import * as Ph from 'phaser';
import {b2, gameConfig} from '../index';
import TerrainSimple from '../objects/terrain-simple';
import {WickedSnowman} from '../objects/wicked-snowman';

export default class GameScene extends Ph.Scene {
  b2: typeof Box2D & EmscriptenModule;

  private terrainSimple: TerrainSimple;
  private wickedSnowman: WickedSnowman;
  private worldScale: number;
  private world: Box2D.b2World;
  private textFPS: Phaser.GameObjects.Text;
  private textDistance: Phaser.GameObjects.Text;
  private backgroundBack: Phaser.GameObjects.TileSprite;
  private backgroundMid: Phaser.GameObjects.TileSprite;
  private backgroundFront: Phaser.GameObjects.TileSprite;
  private bgLandscapeClouds: Phaser.GameObjects.TileSprite;
  private bgLandscapeMountains: Phaser.GameObjects.TileSprite;
  private bgLandscapeHills: Phaser.GameObjects.TileSprite;
  private playAgainButton: Phaser.GameObjects.Text;
  private music: Phaser.Sound.BaseSound;
  private metersTravelled: number;

  constructor() {
    super({key: 'GameScene'});
  }

  async create() {
    console.log('create GameScene');

    const {width, height} = gameConfig.scale;
    this.backgroundBack = this.add.tileSprite(0, 0, width, height, 'space-back').setOrigin(0).setScrollFactor(0, 0);
    this.backgroundMid = this.add.tileSprite(0, 0, width, height, 'space-mid').setOrigin(0).setScrollFactor(0, 0);
    this.backgroundFront = this.add.tileSprite(0, 0, width, height, 'space-front').setOrigin(0).setScrollFactor(0, 0);

    this.bgLandscapeMountains = this.add.tileSprite(0, 0, width, height, 'bg-landscape-4-mountain')
    .setZ(2)
    .setScale(1.25, 2)
    .setOrigin(0, 0.5)
    .setScrollFactor(0, 0)
    .setTint(30, 30, 30, 30);
    this.bgLandscapeHills = this.add.tileSprite(0, 0, width, height, 'bg-landscape-3-trees')
    .setScale(1.25, 1.5)
    .setOrigin(0, 0.25)
    .setScrollFactor(0, 0).setZ(1)
    .setTint(50, 50, 50, 50);

    this.bgLandscapeClouds = this.add.tileSprite(0, 0, width, height, 'bg-landscape-5-clouds').setOrigin(0, 0.3).setScrollFactor(0, 0).setZ(1);

    this.textFPS = this.add.text(this.cameras.main.worldView.x + this.cameras.main.width - 24, 24, '').setScrollFactor(0).setFontSize(32).setOrigin(1, 0);
    this.textFPS.setShadow(1, 1, '#000000', 2);
    setInterval(() => this.textFPS.setText(`fps: ${this.game.loop.actualFps.toFixed(1)} (${this.game.loop.targetFps})`), 1000);

    this.music = this.sound.add('nightmare');
    setTimeout(() => this.music.play({loop: true, volume: 0.5, detune: 0, rate: 1}), 1250);

    this.worldScale = 10; // FIXME When I change this I expect the rest of the app to adjust
    let gravity = new b2.b2Vec2(0, 9.8); // in m/sec
    this.world = new b2.b2World(gravity);
    b2.destroy(gravity);

    this.terrainSimple = new TerrainSimple(this, this.world);
    this.wickedSnowman = new WickedSnowman(this, this.world, this.worldScale);
    this.wickedSnowman.create();

    const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
    this.add.text(screenCenterX + 100, screenCenterY - 400, 'WICKED SNOWMAN').setScrollFactor(0.35).setFontSize(80).setOrigin(0.5);
    this.add.text(screenCenterX + 100, screenCenterY - 200, 'Don\'t lose your head').setScrollFactor(0.35).setFontSize(50).setOrigin(0.5);
    // TODO replace arrow ascii characters with arrow key images. If it is a touchscreen, show a short overlay with the control areas
    this.add.text(screenCenterX - 70, screenCenterY - 125, ' ↑  jump').setScrollFactor(0.35).setFontSize(40).setOrigin(0);
    this.add.text(screenCenterX - 70, screenCenterY - 75, '← → control').setScrollFactor(0.35).setFontSize(40).setOrigin(0);

    this.playAgainButton = this.add.text(screenCenterX, screenCenterY, 'PLAY AGAIN?')
    .setScrollFactor(0)
    .setFontSize(50)
    .setOrigin(0.5)
    .setPadding(24)
    .setAlpha(0)
    .setStyle({backgroundColor: '#223B7B', border: '5px solid red'})
    .setInteractive({useHandCursor: true})
    .on('pointerdown', () => this.restartGame())
    .on('pointerover', () => this.playAgainButton.setStyle({fill: '#5c8dc9'}))
    .on('pointerout', () => this.playAgainButton.setStyle({fill: '#FFF'}));

    this.textDistance = this.add.text(24, 24, 'Travelled: 0m').setScrollFactor(0, 0).setFontSize(32);
    this.textDistance.setShadow(1, 1, '#000000', 2);

    // @ts-ignore
    this.cameras.main.startFollow(this.wickedSnowman.body.userData as Phaser.GameObjects.Graphics, false, 0.8, 0.25);
    this.cameras.main.followOffset.set(-750, 0);
    this.cameras.main.setDeadzone(100, 250);
    this.cameras.main.setBackgroundColor(0x000000);
    this.cameras.main.setZoom(0.5, 0.5);
  }

  restartGame(): void {
    this.music.stop();
    this.scene.restart();
  }

  update() {
    // if (this.wickedSnowman.isCrashed && !this.playAgainButton.alpha) {
    //   this.playAgainButton.setAlpha(1);
    //   this.tweens.add({
    //     targets: this.music,
    //     volume: 0.0,
    //     detune: -500,
    //     rate: 0.5,
    //     duration: 3000,
    //     onComplete: tween => this.music.stop(),
    //   });
    // }

    // if (!this.wickedSnowman.isCrashed) {
    //   this.metersTravelled = Math.floor(this.wickedSnowman.body.getPosition().length() / 2);
    //   this.textDistance.setText('Travelled: ' + this.metersTravelled + 'm');
    // }

    this.backgroundBack.setTilePosition(this.cameras.main.scrollX * 0.001, this.cameras.main.scrollY * 0.001);
    this.backgroundMid.setTilePosition(this.cameras.main.scrollX * 0.0025, this.cameras.main.scrollY * 0.0025);
    this.backgroundFront.setTilePosition(this.cameras.main.scrollX * 0.005, this.cameras.main.scrollY * 0.005);
    this.bgLandscapeClouds.setTilePosition(this.cameras.main.scrollX * 0.25, this.cameras.main.scrollY * 0.25);
    this.bgLandscapeMountains.setTilePosition(this.cameras.main.scrollX * 0.025, 0);
    this.bgLandscapeHills.setTilePosition(this.cameras.main.scrollX * 0.035, 0);

    // console.time('update');
    this.wickedSnowman.update();
    // this.terrainDestructible.update();
    this.terrainSimple.update();
    this.updatePhysics();
    // console.timeEnd('update');
  }

  private updatePhysics() {
    // console.time('physics');

    // let timeStep = this.game.loop.delta / 1000;
    let timeStep = 1 / 40;
    let velocityIterations = 5;
    let positionIterations = 5;

    this.world.Step(timeStep, velocityIterations, positionIterations);
    this.world.ClearForces(); // recommended after each time step

    // iterate through all bodies
    for (let physicsBody = this.world.GetBodyList(); b2.getPointer(physicsBody) !== b2.getPointer(b2.NULL); physicsBody = physicsBody.GetNext()) {
      // for (let physicsBody = this.world.getBodyList(); physicsBody; physicsBody = physicsBody.getNext()) {
      // @ts-ignore
      if (!physicsBody || !physicsBody.userData) continue;

      // update the visible graphics object attached to the physics body
      // @ts-ignore
      let physicsBodyGraphics = physicsBody.userData as Ph.GameObjects.Graphics;
      // console.log('userData graphics', physicsBodyGraphics, physicsBody);
      if (!physicsBodyGraphics) continue;

      let pos = physicsBody.GetPosition();
      physicsBodyGraphics.x = pos.get_x() * this.worldScale;
      physicsBodyGraphics.y = pos.get_y() * this.worldScale;
      physicsBodyGraphics.rotation = physicsBody.GetAngle(); // in radians;
      // physicsBodyGraphics.rotation = physicsBody.GetAngle() * 180 / Math.PI; // in radians;
    }

    // console.timeEnd('physics');

  }
}

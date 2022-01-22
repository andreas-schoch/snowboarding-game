import * as Ph from 'phaser';
import * as Pl from 'planck-js';
import TerrainSimple from '../objects/terrain-simple';
import {WickedSnowman} from '../objects/wicked-snowman';
import {gameConfig} from '../index';

export default class GameScene extends Ph.Scene {
  private terrainSimple: TerrainSimple;
  private wickedSnowman: WickedSnowman;

  private worldScale: number;
  private world: Pl.World;
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

    this.textFPS = this.add.text(this.cameras.main.worldView.x + this.cameras.main.width - 24, 24, '').setScrollFactor(0).setFontSize(16).setOrigin(1, 0);
    this.textFPS.setShadow(1, 1, '#000000', 2);
    setInterval(() => this.textFPS.setText(`fps: ${this.game.loop.actualFps.toFixed(1)} (${this.game.loop.targetFps})`), 1000);

    this.music = this.sound.add('nightmare');
    setTimeout(() => this.music.play({loop: true, volume: 0.5, detune: 0, rate: 1}), 1250);

    this.worldScale = 15; // FIXME When I change this I expect the rest of the app to adjust
    let gravity = Pl.Vec2(0, 9.8); // in m/sec
    this.world = Pl.World(gravity);

    this.terrainSimple = new TerrainSimple(this, this.world);
    this.wickedSnowman = new WickedSnowman(this, this.world, this.worldScale);
    this.wickedSnowman.create();

    const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
    this.add.text(screenCenterX + 50, screenCenterY - 200, 'WICKED SNOWMAN').setScrollFactor(0.35).setFontSize(40).setOrigin(0.5);
    this.add.text(screenCenterX + 50, screenCenterY - 100, 'Don\'t lose your head').setScrollFactor(0.35).setFontSize(25).setOrigin(0.5);
    // TODO replace arrow ascii characters with arrow key images. If it is a touchscreen, show a short overlay with the control areas
    this.add.text(screenCenterX - 35, screenCenterY - 62.5, ' ↑  jump').setScrollFactor(0.35).setFontSize(20).setOrigin(0);
    this.add.text(screenCenterX - 35, screenCenterY - 37.5, '← → control').setScrollFactor(0.35).setFontSize(20).setOrigin(0);

    this.playAgainButton = this.add.text(screenCenterX, screenCenterY, 'PLAY AGAIN?')
    .setScrollFactor(0)
    .setFontSize(25)
    .setOrigin(0.5)
    .setPadding(12)
    .setAlpha(0)
    .setStyle({backgroundColor: '#223B7B'})
    .setInteractive({useHandCursor: true})
    .on('pointerdown', () => this.restartGame())
    .on('pointerover', () => this.playAgainButton.setStyle({fill: '#5c8dc9'}))
    .on('pointerout', () => this.playAgainButton.setStyle({fill: '#FFF'}));

    this.textDistance = this.add.text(12, 12, 'Travelled: 0m').setScrollFactor(0, 0).setFontSize(16);
    this.textDistance.setShadow(1, 1, '#000000', 2);

    this.cameras.main.startFollow(this.wickedSnowman.body.getUserData() as Phaser.GameObjects.Graphics, false, 0.8, 0.25);
    this.cameras.main.followOffset.set(-375, 0);
    this.cameras.main.setDeadzone(50, 125);
    this.cameras.main.setBackgroundColor(0x000000);
    this.cameras.main.setZoom(1, 1);
  }

  restartGame(): void {
    this.music.stop();
    this.scene.restart();
  }

  update() {
    if (this.wickedSnowman.isCrashed && !this.playAgainButton.alpha) {
      this.playAgainButton.setAlpha(1);
      this.tweens.add({
        targets: this.music,
        volume: 0.0,
        detune: -500,
        rate: 0.5,
        duration: 3000,
        onComplete: tween => this.music.stop(),
      });
    }

    if (!this.wickedSnowman.isCrashed) {
      this.metersTravelled = Math.floor(this.wickedSnowman.body.getPosition().length() / 2);
      this.textDistance.setText('Travelled: ' + this.metersTravelled + 'm');
    }

    const {scrollX, scrollY} = this.cameras.main;
    this.backgroundBack.setTilePosition(scrollX * 0.001, scrollY * 0.001);
    this.backgroundMid.setTilePosition(scrollX * 0.0025, scrollY * 0.0025);
    this.backgroundFront.setTilePosition(scrollX * 0.005, scrollY * 0.005);
    this.bgLandscapeClouds.setTilePosition(scrollX * 0.25, scrollY * 0.25);
    this.bgLandscapeMountains.setTilePosition(scrollX * 0.025, 0);
    this.bgLandscapeHills.setTilePosition(scrollX * 0.035, 0);

    this.wickedSnowman.update();
    // this.terrainDestructible.update();
    this.terrainSimple.update();
    this.updatePhysics();
  }

  private updatePhysics() {
    let timeStep = (Math.round(this.game.loop.delta) / 640);
    const iterations = Math.floor(Math.max(this.game.loop.actualFps / 3, 2));

    this.world.step(timeStep, iterations, iterations);
    this.world.clearForces(); // recommended after each time step

    // iterate through all bodies
    for (let physicsBody = this.world.getBodyList(); physicsBody; physicsBody = physicsBody.getNext()) {
      if (!physicsBody) continue;

      // update the visible graphics object attached to the physics body
      let physicsBodyGraphics = physicsBody.getUserData() as Ph.GameObjects.Graphics;
      if (!physicsBodyGraphics) continue;

      let pos = physicsBody.getPosition();
      physicsBodyGraphics.x = pos.x * this.worldScale;
      physicsBodyGraphics.y = pos.y * this.worldScale;
      physicsBodyGraphics.rotation = physicsBody.getAngle(); // in radians;
    }
  }
}

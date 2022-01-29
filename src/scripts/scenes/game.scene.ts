import * as Ph from 'phaser';
import * as Pl from 'planck-js';
import TerrainSimple from '../objects/terrain-simple';
import {WickedSnowman} from '../objects/wicked-snowman';
import {Physics} from '../objects/physics';
import {Backdrop} from '../objects/backdrop';

export default class GameScene extends Ph.Scene {
  private backdrop: Backdrop;
  private terrainSimple: TerrainSimple;
  private wickedSnowman: WickedSnowman;
  private b2Physics: Physics;

  private textDistance: Phaser.GameObjects.Text;
  private playAgainButton: Phaser.GameObjects.Text;
  private music: Phaser.Sound.BaseSound;
  private metersTravelled: number;

  constructor() {
    super({key: 'GameScene'});
  }

  async create() {
    this.music = this.sound.add('theme');
    this.music.play({loop: true, volume: 0.5, rate: 0.9, delay: 1.25});

    let gravity = Pl.Vec2(0, 9.8); // in m/sec
    this.b2Physics = new Physics(this, 15, gravity);

    this.backdrop = new Backdrop(this);
    this.terrainSimple = new TerrainSimple(this, this.b2Physics);
    this.wickedSnowman = new WickedSnowman(this, this.b2Physics);

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

    this.cameras.main.startFollow(this.wickedSnowman.body.getUserData() as Phaser.GameObjects.Image, false, 0.8, 0.25);
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

    this.backdrop.update();
    this.wickedSnowman.update();
    this.terrainSimple.update();
    this.b2Physics.update();
  }
}

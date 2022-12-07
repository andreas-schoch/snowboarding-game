import * as Ph from 'phaser';
import * as Pl from '@box2d/core';
import Terrain from '../components/terrain';
import {Physics} from '../components/physics';
import {DEFAULT_WIDTH, DEFAULT_ZOOM, stats} from '../index';
import UiScene from './ui.scene';
import {Backdrop} from '../components/backdrop';
import {PlayerController} from '../components/wicked-snowman';


export default class GameScene extends Ph.Scene {
  readonly observer: Phaser.Events.EventEmitter = new Ph.Events.EventEmitter();
  private b2Physics: Physics;
  private terrain: Terrain;
  private playerController: PlayerController;
  private backdrop: Backdrop;

  // private backgroundBack: Phaser.GameObjects.TileSprite;
  // private backgroundMid: Phaser.GameObjects.TileSprite;
  // private backgroundFront: Phaser.GameObjects.TileSprite;

  constructor() {
    super({key: 'GameScene'});
  }

  private create() {
    this.cameras.main.setDeadzone(50, 125);
    this.cameras.main.setBackgroundColor(0x555555);
    const resolutionMod = this.cameras.main.width / DEFAULT_WIDTH;
    this.cameras.main.setZoom(DEFAULT_ZOOM * resolutionMod);
    this.cameras.main.scrollX -= this.cameras.main.width / 2;
    this.cameras.main.scrollY -= this.cameras.main.height / 2;

    this.b2Physics = new Physics(this, 40, new Pl.b2Vec2(0, -10));
    this.playerController = new PlayerController(this, this.b2Physics);
    this.terrain = new Terrain(this, this.b2Physics);

    this.cameras.main.startFollow(this.b2Physics.rubeLoader.getBodiesByCustomProperty('bool', 'phaserCameraFollow', true)[0].GetUserData() as Phaser.GameObjects.Image, false, 0.8, 0.25);
    this.cameras.main.followOffset.set(-375, 0);

    this.scene.launch(UiScene.name, [this.observer, () => this.scene.restart()]);

    this.backdrop = new Backdrop(this);

    const {width, height} = this.game.scale;

    // this.backgroundBack = this.add.tileSprite(0, 0, width, height, 'space-back').setOrigin(0).setScrollFactor(0, 0).setDepth(-102);
    // this.backgroundMid = this.add.tileSprite(0, 0, width, height, 'space-mid').setOrigin(0).setScrollFactor(0, 0).setDepth(-101);
    // this.backgroundFront = this.add.tileSprite(0, 0, width, height, 'space-front').setOrigin(0).setScrollFactor(0, 0).setDepth(-100);

    const graphics = this.add.graphics();
    graphics.lineStyle(5, 0x048708, 1.0);
    graphics.beginPath();
    graphics.moveTo(0, 0);
    graphics.lineTo(40, 0);
    graphics.closePath();
    graphics.setDepth(1000);
    graphics.strokePath();

    graphics.lineStyle(5, 0xba0b28, 1.0);
    graphics.beginPath();
    graphics.moveTo(0, 0);
    graphics.lineTo(0, 40);
    graphics.closePath();
    graphics.setDepth(1000);
    graphics.strokePath();

    this.observer.on('enter-crashed', () => {
      this.cameras.main.shake(200, 0.01);
      this.b2Physics.enterBulletTime(-1, 0.4);
    });
  }

  update() {
    stats.begin();
    const delta = this.game.loop.delta / 1000;
    this.b2Physics.update(); // needs to happen before update of snowman otherwise b2Body.GetPosition() inaccurate
    this.playerController.update(delta);
    this.backdrop.update();
    // this.terrain.update();

    // this.backgroundBack.setTilePosition(this.cameras.main.scrollX * 0.005, this.cameras.main.scrollY * 0.005);
    // this.backgroundMid.setTilePosition(this.cameras.main.scrollX * 0.01, this.cameras.main.scrollY * 0.01);
    // this.backgroundFront.setTilePosition(this.cameras.main.scrollX * 0.025, this.cameras.main.scrollY * 0.025);

    stats.end();
  }
}

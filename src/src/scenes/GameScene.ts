import * as Ph from 'phaser';
import * as Pl from '@box2d/core';
import Terrain from '../components/Terrain';
import {Physics} from '../components/Physics';
import {DEBUG, DEFAULT_WIDTH, DEFAULT_ZOOM, stats} from '../index';
import GameUIScene from './GameUIScene';
import {Backdrop} from '../components/Backdrop';
import {PlayerController} from '../components/PlayerController';

export default class GameScene extends Ph.Scene {
  readonly observer: Phaser.Events.EventEmitter = new Ph.Events.EventEmitter();
  private b2Physics: Physics;
  private terrain: Terrain;
  private playerController: PlayerController;
  private backdrop: Backdrop;

  constructor() {
    super({key: 'GameScene'});
  }

  private create() {
    this.cameras.main.setDeadzone(50 / 2, 125 / 2);
    this.cameras.main.setBackgroundColor(0x555555);
    const resolutionMod = this.cameras.main.width / DEFAULT_WIDTH;
    this.cameras.main.setZoom(DEFAULT_ZOOM * resolutionMod);
    this.cameras.main.scrollX -= this.cameras.main.width / 2;
    this.cameras.main.scrollY -= this.cameras.main.height / 2;

    // FIXME the world size is supposed to be set to 40px per 1m but due to floating point precision issues
    //  it is currently halfed and zoom is doubled temporarily. Visually it looks the same but needs to be fixed.
    //  The issue is that the terrain is a single object instead of chunked and gets weird once player moves too far from the origin.
    //  This wasn't an issue when terrain was procedural and chunked, so will likely fix itself once that is optimized again.
    this.b2Physics = new Physics(this, 20, new Pl.b2Vec2(0, -10));
    this.playerController = new PlayerController(this, this.b2Physics);
    this.terrain = new Terrain(this, this.b2Physics);

    this.cameras.main.startFollow(this.b2Physics.rubeLoader.getBodiesByCustomProperty('bool', 'phaserCameraFollow', true)[0].GetUserData() as Phaser.GameObjects.Image, false, 0.8, 0.25);
    this.cameras.main.followOffset.set(-375 / 2, 0);
    this.scene.launch(GameUIScene.name, [this.observer, () => {
      this.playerController.state.reset();
      this.scene.restart();
    }]);

    this.backdrop = new Backdrop(this);

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

    this.observer.on('enter_crashed', () => {
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
    stats.end();
  }
}

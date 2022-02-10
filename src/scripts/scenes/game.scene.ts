import * as Ph from 'phaser';
import * as Pl from '@box2d/core';
import TerrainSimple from '../objects/terrain-simple';
import {WickedSnowman} from '../objects/wicked-snowman';
import {Physics} from '../objects/physics';
import {Backdrop} from '../objects/backdrop';
import {DEFAULT_WIDTH, stats} from '../index';

export default class GameScene extends Ph.Scene {
  private backdrop: Backdrop;
  private terrainSimple: TerrainSimple;
  private wickedSnowman: WickedSnowman;
  private b2Physics: Physics;

  constructor() {
    super({key: 'GameScene'});
  }

  create() {
    this.cameras.main.setDeadzone(50, 125);
    this.cameras.main.setBackgroundColor(0x000000);
    const resolutionModifier = this.game.canvas.width === DEFAULT_WIDTH ? 1 : 0.5; // quickfix to allow 2 different resolutions without adjusting physics worldScale
    this.cameras.main.setZoom(0.85 * resolutionModifier, 0.85 * resolutionModifier);

    this.b2Physics = new Physics(this, 15, new Pl.b2Vec2(0, 9.8));
    this.backdrop = new Backdrop(this);
    this.terrainSimple = new TerrainSimple(this, this.b2Physics);
    this.wickedSnowman = new WickedSnowman(this, this.b2Physics);

    this.cameras.main.startFollow(this.wickedSnowman.parts.body.GetUserData() as Phaser.GameObjects.Image, false, 0.8, 0.25);
    this.cameras.main.followOffset.set(-375, 0);

    const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
    this.add.bitmapText(screenCenterX + 50, screenCenterY - 200, 'atari-classic', 'WICKED SNOWMAN').setScrollFactor(0.35).setFontSize(40).setOrigin(0.5);
    this.add.bitmapText(screenCenterX + 50, screenCenterY - 100, 'atari-classic', 'Don\'t lose your head').setScrollFactor(0.35).setFontSize(25).setOrigin(0.5);

    this.scene.launch('UIScene', [this.wickedSnowman.stateComponent, this.restartGame.bind(this)]);

    this.wickedSnowman.stateComponent.on('enter-crashed', () => {
      this.cameras.main.shake(200, 0.01);
      this.b2Physics.enterBulletTime(-1, 0.4);
    });
  }

  restartGame(): void {
    this.scene.restart();
  }

  update() {
    stats.begin();
    this.b2Physics.update(); // needs to happen before update of snowman otherwise b2Body.GetPosition() inaccurate
    this.backdrop.update();
    this.wickedSnowman.update();
    this.terrainSimple.update();
    stats.end();
  }
}

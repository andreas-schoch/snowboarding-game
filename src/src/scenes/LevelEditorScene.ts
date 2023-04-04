import * as Ph from 'phaser';
import * as Pl from '@box2d/core';
import Terrain from '../components/Terrain';
import {Physics} from '../components/Physics';
import {DEBUG, DEFAULT_WIDTH, DEFAULT_ZOOM, KEY_LEVEL_CURRENT, LevelKeys, SceneKeys, stats} from '../index';
import {Backdrop} from '../components/Backdrop';
import {getCurrentLevel} from '../util/getCurrentLevel';
import {setupCamera} from "../util/setupCamera";
import {DebugMouseJoint} from "../util/DebugMouseJoint";
import {Observer} from "../util/observer";

export default class LevelEditorScene extends Ph.Scene {
  private b2Physics: Physics;
  private backdrop: Backdrop;
  private isSimulating: boolean = false;
  private terrain: Terrain;

  private debugControls: Phaser.Cameras.Controls.SmoothedKeyControl;
  private debugKeyLeft: Phaser.Input.Keyboard.Key | undefined;
  private debugKeyRight: Phaser.Input.Keyboard.Key | undefined;
  private debugKeyUp: Phaser.Input.Keyboard.Key | undefined;
  private debugKeyDown: Phaser.Input.Keyboard.Key | undefined;

  constructor() {
    super({key: SceneKeys.LEVEL_EDITOR_SCENE});
  }

  private create() {
    setupCamera(this.cameras.main);
    // Ensure that listeners from previous runs are cleared. Otherwise, for a single emit it may call the listener multiple times depending on amount of game-over/replays
    Observer.init()
    this.backdrop = new Backdrop(this);
    this.b2Physics = new Physics(this, 40, new Pl.b2Vec2(0, -10));
    this.b2Physics.loadRubeScene(getCurrentLevel());
    this.terrain = new Terrain(this, this.b2Physics);

    this.scene.launch(SceneKeys.LEVEL_EDITOR_UI_SCENE, [() => this.scene.restart()]);

    new DebugMouseJoint(this, this.b2Physics);
    this.debugKeyLeft = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.debugKeyRight = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.debugKeyUp = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.debugKeyDown = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.debugControls = new Phaser.Cameras.Controls.SmoothedKeyControl({
      camera: this.cameras.main,
      zoomIn: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
      zoomOut: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      acceleration: 0.05,
      drag: 0.0015,
      maxSpeed: 1.0,
      zoomSpeed: 0.02,
    });

  }

  update() {
    stats.begin();
    const delta = this.game.loop.delta / 1000;

    if (this.debugKeyLeft?.isDown) this.cameras.main.scrollX -= 300 * delta;
    if (this.debugKeyRight?.isDown) this.cameras.main.scrollX += 300 * delta;
    if (this.debugKeyUp?.isDown) this.cameras.main.scrollY -= 300 * delta;
    if (this.debugKeyDown?.isDown) this.cameras.main.scrollY += 300 * delta;

    if (this.isSimulating) this.b2Physics.update(); // needs to happen before update of snowman otherwise b2Body.GetPosition() inaccurate
    this.backdrop.update();
    stats.end();
  }
}

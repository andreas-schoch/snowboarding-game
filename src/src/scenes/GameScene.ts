import * as Ph from 'phaser';
import * as Pl from '@box2d/core';
import Terrain from '../components/Terrain';
import {Physics} from '../components/Physics';
import {DEBUG, DEFAULT_WIDTH, SceneKeys, stats} from '../index';
import {Backdrop} from '../components/Backdrop';
import {PlayerController} from '../components/PlayerController';
import {getCurrentLevel} from '../util/getCurrentLevel';
import {setupCamera} from "../util/setupCamera";
import {drawCoordZeroPoint} from "../util/drawCoordZeroPoint";
import {Observer} from "../util/observer";

export default class GameScene extends Ph.Scene {
  private b2Physics: Physics;
  private terrain: Terrain;
  private playerController: PlayerController;
  private backdrop: Backdrop;

  constructor() {
    super({key: SceneKeys.GAME_SCENE});
  }

  private create() {
    setupCamera(this.cameras.main);
    // Ensure that listeners from previous runs are cleared. Otherwise, for a single emit it may call the listener multiple times depending on amount of game-over/replays
    Observer.init();
    this.backdrop = new Backdrop(this);
    this.b2Physics = new Physics(this, 40, new Pl.b2Vec2(0, -10));
    this.b2Physics.loadRubeScene(getCurrentLevel());
    this.playerController = new PlayerController(this, this.b2Physics);
    this.terrain = new Terrain(this, this.b2Physics);

    this.cameras.main.startFollow(this.b2Physics.rubeLoader.getBodiesByCustomProperty('bool', 'phaserCameraFollow', true)[0].GetUserData() as Phaser.GameObjects.Image, false, 0.8, 0.25);
    this.cameras.main.followOffset.set(-375 / 2, 0);
    this.scene.launch(SceneKeys.GAME_UI_SCENE, [() => {
      this.playerController.state.reset();
      this.scene.restart();
    }]);

    if (DEBUG) drawCoordZeroPoint(this);
    Observer.instance.on('enter_crashed', () => this.cameras.main.shake(200, 0.03 * (1 / (this.cameras.main.width / DEFAULT_WIDTH))));
  }

  update() {
    stats.begin();
    this.b2Physics.update(); // needs to happen before update of player character otherwise b2Body.GetPosition() inaccurate
    this.playerController.update();
    this.backdrop.update();
    stats.end();
  }
}

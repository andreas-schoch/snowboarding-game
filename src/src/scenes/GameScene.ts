import * as Ph from 'phaser';
import Terrain from '../components/Terrain';
import { Physics } from '../components/Physics';
import { DEFAULT_WIDTH, DEFAULT_ZOOM, SceneKeys } from '../index';
import { Backdrop } from '../components/Backdrop';
import { PlayerController } from '../components/PlayerController';
import { getCurrentLevel } from '../util/getCurrentLevel';

export default class GameScene extends Ph.Scene {
  observer: Phaser.Events.EventEmitter;
  b2Physics: Physics; // TODO should ideally be made private again
  private terrain: Terrain;
  private playerController: PlayerController;
  private backdrop: Backdrop;

  constructor() {
    super({ key: SceneKeys.GAME_SCENE });
  }

  private create() {
    if (this.observer) this.observer.destroy(); // clear previous runs
    this.observer = new Ph.Events.EventEmitter();

    this.b2Physics = new Physics(this, 40, { x: 0, y: -10 });
    this.b2Physics.loadRubeScene(getCurrentLevel());

    this.playerController = new PlayerController(this, this.b2Physics);
    this.terrain = new Terrain(this, this.b2Physics);

    const resolutionMod = this.cameras.main.width / DEFAULT_WIDTH;
    const body = this.b2Physics.rubeLoader.getBodiesByCustomProperty('bool', 'phaserCameraFollow', true)[0]
    const img = this.b2Physics.rubeLoader.bodyUserDataMap.get(body) as Phaser.GameObjects.Image;
    this.cameras.main.startFollow(img, false, 0.8, 0.25);
    this.cameras.main.followOffset.set(-250, 0);
    this.cameras.main.setDeadzone(50, 125);
    this.cameras.main.setBackgroundColor(0x555555);
    this.cameras.main.setZoom(DEFAULT_ZOOM * resolutionMod);
    this.cameras.main.scrollX -= this.cameras.main.width;
    this.cameras.main.scrollY -= this.cameras.main.height;

    this.scene.launch(SceneKeys.GAME_UI_SCENE, [this.observer, () => {
      this.playerController.state.reset();
      this.scene.restart();
    }]);

    this.backdrop = new Backdrop(this);
    this.observer.on('enter_crashed', () => this.cameras.main.shake(200, 0.03 * (1 / resolutionMod)));
  }

  update() {
    const delta = this.game.loop.delta / 1000;
    this.b2Physics.update(); // needs to happen before update of snowman otherwise b2Body.GetPosition() inaccurate
    this.playerController.update(delta);
    this.backdrop.update();
  }
}

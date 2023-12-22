import * as Ph from 'phaser';
import Terrain from '../components/Terrain';
import { Physics } from '../components/Physics';
import { DEFAULT_WIDTH, DEFAULT_ZOOM, SceneKeys, b2 } from '../index';
// import { Backdrop } from '../components/Backdrop';
import { PlayerController } from '../components/PlayerController';
import { getCurrentLevel } from '../util/getCurrentLevel';
import { getSelectedCharacter } from '../util/getCurrentCharacter';
import { vec2Util } from '../util/RUBE/Vec2Math';

export default class GameScene extends Ph.Scene {
  observer: Phaser.Events.EventEmitter;
  resolutionMod: number;
  b2Physics: Physics; // TODO should ideally be made private again
  private terrain: Terrain;
  private playerController: PlayerController;
  body: Box2D.b2Body;
  // private backdrop: Backdrop;

  constructor() {
    super({ key: SceneKeys.GAME_SCENE });
  }

  setZoomLevel() {
    const currentZoom = this.cameras.main.zoom;
    const speed = this.playerController.state.getCurrentSpeed();
    const maxSpeed = 40; // replace with your game's max speed
    const minZoom = 0.5; // zoomed out
    const maxZoom = DEFAULT_ZOOM; // zoomed in

    const normalizedSpeed = Math.min(Math.max(speed / maxSpeed, 0), 1);
    const targetZoom = (maxZoom - normalizedSpeed * (maxZoom - minZoom)) * this.resolutionMod;
    const lerpFactor = 0.02;
    const newZoom = currentZoom + lerpFactor * (targetZoom - currentZoom);
    this.cameras.main.setZoom(newZoom);
  }

  private create() {
    if (this.observer) this.observer.destroy(); // clear previous runs
    this.observer = new Ph.Events.EventEmitter();
    this.b2Physics = new Physics(this, 40, { x: 0, y: -10 });
    this.b2Physics.loadRubeScene(getCurrentLevel())
    this.b2Physics.loadRubeScene(getSelectedCharacter())
    this.playerController = new PlayerController(this, this.b2Physics);
    this.terrain = new Terrain(this, this.b2Physics);

    this.resolutionMod = this.cameras.main.width / DEFAULT_WIDTH;
    this.body = this.b2Physics.rubeLoader.getBodiesByCustomProperty('bool', 'phaserCameraFollow', true)[0]
    const img = this.b2Physics.rubeLoader.bodyUserDataMap.get(this.body) as Phaser.GameObjects.Image;
    this.cameras.main.startFollow(img, false, 0.5, 0.5);
    this.cameras.main.setDeadzone(0, 125);
    this.cameras.main.setBackgroundColor(0x3470c6);
    this.cameras.main.setZoom(DEFAULT_ZOOM * this.resolutionMod * 1.5);
    this.cameras.main.scrollX -= this.cameras.main.width;
    this.cameras.main.scrollY -= this.cameras.main.height;

    this.scene.launch(SceneKeys.GAME_UI_SCENE, [this.observer, () => {
      this.playerController.state.reset();
      this.scene.restart();
      b2.destroy(this.b2Physics.world);
    }]);

    this.observer.on('enter_crashed', () => this.cameras.main.shake(200, 0.03 * (1 / this.resolutionMod)));
  }

  update() {
    this.b2Physics.update(); // needs to happen before update of player character inputs otherwise b2Body.GetPosition() inaccurate
    this.playerController.update();
    this.setZoomLevel();

    const velocityX = this.body.GetLinearVelocity().x * 10;
    const lerpFactor = 0.01;
    this.cameras.main.setFollowOffset(this.cameras.main.followOffset.x + lerpFactor * (-velocityX - this.cameras.main.followOffset.x), 0);
  }
}

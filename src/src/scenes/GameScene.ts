import Terrain from '../components/Terrain';
import { Physics } from '../components/Physics';
import { b2 } from '../index';
import { DEFAULT_ZOOM } from "..";
import { DEFAULT_WIDTH } from "..";
import { SCENE_GAME, SCENE_GAME_UI } from "..";
// import { Backdrop } from '../components/Backdrop';
import { PlayerController } from '../components/PlayerController';
import { getCurrentLevel } from '../util/getCurrentLevel';
import { getSelectedCharacter } from '../util/getCurrentCharacter';
import { vec2Util } from '../util/RUBE/Vec2Math';

export default class GameScene extends Phaser.Scene {
  observer: Phaser.Events.EventEmitter;
  resolutionMod: number;
  b2Physics: Physics; // TODO should ideally be made private again
  private terrain: Terrain;
  private playerController: PlayerController;
  body: Box2D.b2Body;
  windNoise: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
  snowboardSlide: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
  // private backdrop: Backdrop;

  constructor() {
    super({ key: SCENE_GAME });
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

  setWindNoise() {
    // TODO improve. Maybe pan left/right depending on which ear faces movement direction
    const maxSpeed = 60;
    const headSpeed = this.playerController.parts.head.GetLinearVelocity().Length();
    this.windNoise.setVolume(Math.min(Math.max((headSpeed / maxSpeed) * 0.3, 0.02), 0.5));
    this.windNoise.setRate(Math.min(Math.max((headSpeed / maxSpeed) * 1.5, 0.5), 1.5));
  }

  private create() {
    if (this.observer) this.observer.destroy(); // clear previous runs
    this.observer = new Phaser.Events.EventEmitter();
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

    this.snowboardSlide = this.sound.add('snowboard_slide_04', { loop: true, volume: 1, rate: 1, delay: 0, detune: 1000 });
    this.snowboardSlide.play();
    this.windNoise = this.sound.add('wind', { loop: true, volume: 1, rate: 1, delay: 0, detune: 0 });
    this.windNoise.play();

    this.observer.on('surface_impact', (impulse: number, type: string, tailOrNose: boolean, center: boolean, body: boolean) => {
      // TODO improve. Needs sound for other surface types (e.g. ice, snow, rock, etc.)
      const maxImpulse = 12;
      const target = center ? 0 : 1200;
      const lerpFactor = 0.7;
      const currentDetune = this.snowboardSlide.detune;
      const newDetune = currentDetune + lerpFactor * (target - currentDetune);
      this.snowboardSlide.setDetune(newDetune);
      const percentage = Math.min(impulse / maxImpulse, 1);
      const volume = Math.max(Math.min(percentage, 1), 0.2);
      this.snowboardSlide.setVolume(volume);
    });

    this.observer.on('enter_in_air', () => {
      this.add.tween({
        targets: this.snowboardSlide,
        volume: 0.03,
        ease: 'Linear',
        duration: 250,
        onComplete: () => this.snowboardSlide.setDetune(0)
      });
    });

    this.scene.launch(SCENE_GAME_UI, [this.observer, () => {
      this.playerController.state.reset();
      this.snowboardSlide.stop();
      this.snowboardSlide.destroy();
      this.windNoise.stop();
      this.windNoise.destroy();
      this.scene.restart();
      b2.destroy(this.b2Physics.world);
    }]);

    this.observer.on('enter_crashed', () => this.cameras.main.shake(200, 0.03 * (1 / this.resolutionMod)));
  }

  update() {
    this.b2Physics.update(); // needs to happen before update of player character inputs otherwise b2Body.GetPosition() inaccurate
    this.playerController.update();
    this.setZoomLevel();
    this.setWindNoise();

    const velocityX = this.body.GetLinearVelocity().x * 10;
    const lerpFactor = 0.01;
    this.cameras.main.setFollowOffset(this.cameras.main.followOffset.x + lerpFactor * (-velocityX - this.cameras.main.followOffset.x), 0);
  }
}

import {SCENE_GAME , freeLeaked, pb} from '..';
import {Backdrop} from '../Backdrop';
import {GameInfo} from '../GameInfo';
import {Settings} from '../Settings';
import {SoundManager} from '../SoundManager';
import {Terrain} from '../Terrain';
import {initSolidUI} from '../UI';
import {Character} from '../character/Character';
import {CharacterController} from '../controllers/PlayerController';
import {RESTART_GAME} from '../eventTypes';
import {Physics} from '../physics/Physics';
import {RubeScene} from '../physics/RUBE/RubeLoaderInterfaces';

export class GameScene extends Phaser.Scene {
  b2Physics: Physics;
  private playerController: CharacterController;
  private backdrop: Backdrop;
  private ready = false;

  constructor() {
    super({key: SCENE_GAME});
  }

  update() {
    if (!this.ready) return;
    this.b2Physics.update(); // needs to happen before update of player character inputs otherwise b2Body.GetPosition() inaccurate
    Character.instances.forEach(character => character.update());
    this.playerController.update();
    this.backdrop.update();
  }

  private preload() {
    const character = Settings.selectedCharacter();
    this.load.json(character, `assets/levels/export/${character}.json`);
  }

  private create() {
    if (Settings.darkmodeEnabled()) {
      // this.lights.enable();
      // this.lights.setAmbientColor(0x555555);
    }

    if (GameInfo.observer) GameInfo.observer.destroy(); // clear previous runs
    GameInfo.observer = new Phaser.Events.EventEmitter();
    this.b2Physics = new Physics(this, {worldScale: 40, gravityX: 0, gravityY: -10});
    new SoundManager(this);
    this.backdrop = new Backdrop(this);

    pb.level.get(Settings.currentLevel()).then(level => {
      if (!level) throw new Error('Level not found: ' + Settings.currentLevel());
      // console.log('------------------- rube scene protobuf encoded', rubeSceneSerializer.encode(level.scene));
      this.b2Physics.load(level.scene);
      new Terrain(this).draw();
      this.playerController = new CharacterController(this);
      const rubeScene: RubeScene = this.cache.json.get(Settings.selectedCharacter());
      const character = new Character(this, this.b2Physics.load(rubeScene, 0, 0));
      this.playerController.possessCharacter(character);
      this.ready = true;
    });

    GameInfo.observer.on(RESTART_GAME, () => {
      this.b2Physics.loader.cleanup();
      GameInfo.crashed = false;
      GameInfo.possessedCharacterId = '';
      GameInfo.score = {finishedLevel: false, level: Settings.currentLevel(), distance: 0, coins: 0, crashed: false, trickScore: 0, tsl: '[]'};
      freeLeaked();
      this.scene.restart();
    });

    initSolidUI('root-ui');

    // TODO remove. Temporary to serialize open level
    this.input.keyboard!.on('keydown-ONE', () => this.b2Physics.serializer.serialize());
  }
}

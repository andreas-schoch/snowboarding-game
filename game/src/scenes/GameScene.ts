import {SCENE_EDITOR, SCENE_GAME , freeLeaked, pb} from '..';
import {Backdrop} from '../Backdrop';
import {GameInfo} from '../GameInfo';
import {Settings} from '../Settings';
import {SoundManager} from '../SoundManager';
import {Terrain} from '../Terrain';
import {initSolidUI} from '../UI';
import {Character} from '../character/Character';
import {CharacterController} from '../controllers/PlayerController';
import {EDITOR_OPEN, RESTART_GAME} from '../eventTypes';
import {Physics} from '../physics/Physics';
import {RubeScene} from '../physics/RUBE/RubeLoaderInterfaces';
import {IScoreNew} from '../pocketbase/types';

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
    // const levels = ['level_001', 'level_002', 'level_003', 'level_004', 'level_005'];
    // for (const level of levels) this.load.json(level, `assets/levels/export/${level}.json`);
  }

  private create() {
    if (Settings.darkmodeEnabled()) {
      // this.lights.enable();
      // this.lights.setAmbientColor(0x555555);
    }

    // const levels = ['level_001', 'level_002', 'level_003', 'level_004', 'level_005'];
    // for (const level of levels) {
    //   const parsed: RubeScene = this.cache.json.get(level);
    //   const sanitized = sanitizeRubeDefaults(parsed);
    //   const encoded = rubeSceneSerializer.encode(sanitized);
    //   console.log('encoded', encoded);
    //   downloadBinaryStringAsFile(encoded, `${level}.bin`, 'application/octet-stream');
    // }

    if (GameInfo.observer) GameInfo.observer.destroy(); // clear previous runs
    GameInfo.observer = new Phaser.Events.EventEmitter();
    this.b2Physics = new Physics(this, {worldScale: 40, gravityX: 0, gravityY: -10});
    new SoundManager(this);
    this.backdrop = new Backdrop(this);

    pb.level.get(Settings.currentLevel()).then(async level => {
      if (!level) throw new Error('Level not found: ' + Settings.currentLevel());
      GameInfo.currentLevel = level;
      const scene = await pb.level.getRubeScene(level);
      this.b2Physics.load(scene);
      new Terrain(this).draw();
      this.playerController = new CharacterController(this);
      const rubeScene: RubeScene = this.cache.json.get(Settings.selectedCharacter());
      const character = new Character(this, this.b2Physics.load(rubeScene, 0, 0));
      this.playerController.possessCharacter(character);
      this.ready = true;
    });

    GameInfo.observer.on(EDITOR_OPEN, () => {
      this.b2Physics.loader.cleanup();
      GameInfo.crashed = false;
      GameInfo.possessedCharacterId = '';
      GameInfo.score = dummyScore;
      GameInfo.tsl.length = 0;
      GameInfo.currentLevel = null;
      freeLeaked();
      this.scene.start(SCENE_EDITOR);
    });

    GameInfo.observer.on(RESTART_GAME, () => {
      this.b2Physics.loader.cleanup();
      GameInfo.crashed = false;
      GameInfo.possessedCharacterId = '';
      GameInfo.score = dummyScore;
      GameInfo.tsl.length = 0;
      GameInfo.currentLevel = null;
      freeLeaked();
      this.scene.restart();
    });

    initSolidUI('root-ui');

    // TODO remove. Temporary to serialize open level
    this.input.keyboard!.on('keydown-ONE', () => this.b2Physics.serializer.serialize());
  }
}

const dummyScore: IScoreNew = {
  user: '',
  level: Settings.currentLevel(),
  crashed: false,
  finishedLevel: false,
  tsl: '',
  pointsCoin: 0,
  pointsCombo: 0,
  pointsComboBest: 0,
  pointsTotal: 0,
  pointsTrick: 0,
  distance: 0,
  time: 0,
};

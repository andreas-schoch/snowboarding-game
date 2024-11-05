import {SCENE_EDITOR, SCENE_GAME , freeLeaked, pb} from '..';
import {Backdrop} from '../Backdrop';
import {EditorInfo} from '../EditorInfo';
import {GameInfo} from '../GameInfo';
import {PersistedStore} from '../PersistedStore';
import {SoundManager} from '../SoundManager';
import {Terrain} from '../Terrain';
import {initSolidUI} from '../UI';
import {Character} from '../character/Character';
import {CharacterController} from '../controllers/PlayerController';
import {EDITOR_OPEN, RESTART_GAME} from '../eventTypes';
import {waitUntil} from '../helpers/waitUntil';
import {ILevel} from '../levels';
import {Physics} from '../physics/Physics';
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
    // this.load.json('level_001.rube', 'assets/levels/level_001.rube');
    // this.load.json('level_002.rube', 'assets/levels/level_002.rube');
    // this.load.json('level_003.rube', 'assets/levels/level_003.rube');
    // this.load.json('level_004.rube', 'assets/levels/level_004.rube');
    // this.load.json('level_005.rube', 'assets/levels/level_005.rube');
    // this.load.json('saw.rube', 'assets/levels/prefabs/saw.rube');
  }

  private create() {
    // TODO make a node script to automatically convert .rube into .bin (and maybe upload to pocketbase)
    //  Now I just uncomment this whenever I need to update the levels then upload via pocketbase admin UI
    // const levels = ['level_001', 'level_002', 'level_003', 'level_004', 'level_005'];
    // for (const level of ['level_005']) {
    //   const parsed: RubeFile = this.cache.json.get(level + '.rube');
    //   const sanitized = sanitizeRubeFile(parsed);
    //   const encoded = rubeFileSerializer.encode(sanitized);
    //   downloadBlob(encoded, `${level}.bin`, 'application/octet-stream');
    // }

    if (EditorInfo.observer) EditorInfo.observer.destroy(); // clear previous runs
    if (GameInfo.observer) GameInfo.observer.destroy(); // clear previous runs
    GameInfo.observer = new Phaser.Events.EventEmitter();

    waitUntil(() => pb.auth.loggedInUser()).then(async () => {
      this.b2Physics = new Physics(this, {gravityX: 0, gravityY: -10, debugDrawEnabled: false});
      this.backdrop = new Backdrop(this);
      new SoundManager(this);
      let level = await pb.level.get(PersistedStore.currentLevel());
      if (!level) level = await pb.level.byNumber(1);
      if (!level) throw new Error('Level fallback not found');

      const rubeFile = await pb.level.getRubeFile(level);
      if (!rubeFile) throw new Error('RubeFile not found for level: ' + PersistedStore.currentLevel());

      GameInfo.currentLevel = level;
      GameInfo.currentLevelScene = rubeFile;

      const loadedLevelScene = this.b2Physics.load(rubeFile);
      new Terrain(this, loadedLevelScene).draw();
      const character = new Character(this, loadedLevelScene);
      this.playerController = new CharacterController(this);
      this.playerController.possessCharacter(character);
      this.ready = true;
    });

    GameInfo.observer.on(EDITOR_OPEN, (level: ILevel) => {
      this.b2Physics.loader.cleanup();
      GameInfo.crashed = false;
      GameInfo.possessedCharacterId = '';
      GameInfo.score = dummyScore;
      GameInfo.tsl.length = 0;
      GameInfo.currentLevel = null;
      GameInfo.currentLevelScene = null;
      freeLeaked();
      this.sound.stopAll();
      this.scene.stop(SCENE_GAME);
      this.scene.start(SCENE_EDITOR, {level});
    });

    GameInfo.observer.on(RESTART_GAME, () => {
      this.b2Physics.loader.cleanup();
      GameInfo.crashed = false;
      GameInfo.possessedCharacterId = '';
      GameInfo.score = dummyScore;
      GameInfo.tsl.length = 0;
      GameInfo.currentLevel = null;
      GameInfo.currentLevelScene = null;
      freeLeaked();
      this.scene.restart();
    });

    initSolidUI('root-ui');

    // TODO remove. Temporary to serialize open level
    // this.input.keyboard!.on('keydown-SEVEN', () => {
    //   // TODO remove. Temporary to serialize open level and upload to pocketbase via admin panel
    //   //  Can be removed once we have the editor in place to do that properly
    //   // TODO make this possible via cli script
    //   const levels = ['level_001', 'level_002', 'level_003', 'level_004', 'level_005'];
    //   for (const level of levels) {
    //     const parsed: RubeFile = this.cache.json.get(level);
    //     const sanitized = sanitizeRubeFile(parsed);
    //     const encoded = rubeFileSerializer.encode(sanitized);
    //     downloadBlob(encoded, `${level}.bin`, 'application/octet-stream');
    //   }
    // });
  }
}

const dummyScore: IScoreNew = {
  user: '',
  level: PersistedStore.currentLevel(),
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

import {SCENE_GAME , freeLeaked} from '..';
import {Backdrop} from '../Backdrop';
import {GameInfo} from '../GameInfo';
import {Settings} from '../Settings';
import {SoundManager} from '../SoundManager';
import {Terrain} from '../Terrain';
import {initSolidUI} from '../UI';
import {Character} from '../character/Character';
import {CharacterController} from '../controllers/PlayerController';
import {RESTART_GAME} from '../eventTypes';
import {localLevels} from '../levels';
import {Physics} from '../physics/Physics';

export class GameScene extends Phaser.Scene {
  b2Physics: Physics;
  private playerController: CharacterController;
  private backdrop: Backdrop;

  constructor() {
    super({key: SCENE_GAME});
  }

  update() {
    this.b2Physics.update(); // needs to happen before update of player character inputs otherwise b2Body.GetPosition() inaccurate
    Character.instances.forEach(character => character.update());
    this.playerController.update();
    this.backdrop.update();
  }

  private preload() {
    // These may change during gameplay so cannot be loaded in PreloadScene (unless loading all)
    const levelId = Settings.currentLevel();
    const localLevelId = localLevels.find(l => l.id === levelId)?.localId;
    console.log('preload level', localLevelId);
    if (localLevelId) this.load.json(localLevelId, `assets/levels/export/${localLevelId}.json`);
    else throw new Error('Level not found: ' + levelId);

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
    const localLevelId = localLevels.find(l => l.id === Settings.currentLevel())?.localId;
    this.b2Physics.load(localLevelId!);
    new Terrain(this).draw();
    this.playerController = new CharacterController(this);
    const character = new Character(this, this.b2Physics.load(Settings.selectedCharacter(), 0, 0));
    this.playerController.possessCharacter(character);

    GameInfo.observer.on(RESTART_GAME, () => {
      this.b2Physics.loader.cleanup();
      GameInfo.crashed = false;
      GameInfo.possessedCharacterId = '';
      GameInfo.score = {finishedLevel: false, level: Settings.currentLevel(), distance: 0, coins: 0, crashed: false, trickScore: 0, trickScoreLog: []};
      freeLeaked();
      this.scene.restart();
    });

    initSolidUI('root-ui');

    // TODO remove. Temporary to serialize open level
    this.input.keyboard!.on('keydown-ONE', () => this.b2Physics.serializer.serialize());
  }
}

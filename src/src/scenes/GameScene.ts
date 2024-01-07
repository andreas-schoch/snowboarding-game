import Terrain from '../Terrain';
import { Physics } from '../Physics';
import { freeLeaked } from '../index';
import { SCENE_GAME, SCENE_GAME_UI } from "..";
import { CharacterController } from '../PlayerController';
import { Character } from '../Character';
import { RESTART_GAME } from '../eventTypes';
import { SoundManager } from '../SoundManager';
import { Backdrop } from '../Backdrop';
import { Settings } from '../Settings';

export default class GameScene extends Phaser.Scene {
  observer: Phaser.Events.EventEmitter;
  b2Physics: Physics;
  private playerController: CharacterController;
  private backdrop: Backdrop;

  constructor() {
    super({ key: SCENE_GAME });
  }

  preload() {
    // These may change during gameplay so cannot be loaded in PreloadScene (unless loading all)
    const level = Settings.currentLevel();
    const character = Settings.selectedCharacter();
    this.load.json(level, `assets/levels/export/${level}.json`);
    this.load.json(character, `assets/levels/export/${character}.json`);
  }

  private create() {
    if (Settings.darkmodeEnabled()) {
      // this.lights.enable();
      // this.lights.setAmbientColor(0x555555);
    }

    if (this.observer) this.observer.destroy(); // clear previous runs
    this.observer = new Phaser.Events.EventEmitter();
    this.b2Physics = new Physics(this, { worldScale: 40, gravityX: 0, gravityY: -10 });
    new SoundManager(this);
    this.backdrop = new Backdrop(this);
    this.b2Physics.load(Settings.currentLevel());
    new Terrain(this).draw();
    this.playerController = new CharacterController(this);
    const character = new Character(this, this.b2Physics.load(Settings.selectedCharacter(), 0, 0));
    this.playerController.possessCharacter(character);

    this.observer.on(RESTART_GAME, () => {
      this.b2Physics.loader.cleanup();
      freeLeaked();
      this.scene.restart();
    });

    this.scene.launch(SCENE_GAME_UI, [this.observer]);

    // TODO remove. Temporary to serialize open level
    this.input.keyboard!.on('keydown-ONE', () => this.b2Physics.serializer.serialize());
  }

  update() {
    this.b2Physics.update(); // needs to happen before update of player character inputs otherwise b2Body.GetPosition() inaccurate
    Character.instances.forEach(character => character.update());
    this.playerController.update();
    this.backdrop.update();
  }
}

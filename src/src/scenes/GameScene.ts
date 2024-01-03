import Terrain from '../components/Terrain';
import { Physics } from '../components/Physics';
import { b2, freeLeaked } from '../index';
import { SCENE_GAME, SCENE_GAME_UI } from "..";
import { CharacterController } from '../components/PlayerController';
import { getCurrentLevel } from '../util/getCurrentLevel';
import { getSelectedCharacter } from '../util/getCurrentCharacter';
import { Character } from '../components/Character';
import { RESTART_GAME } from '../eventTypes';
import { SoundManager } from '../components/SoundManager';

export default class GameScene extends Phaser.Scene {
  observer: Phaser.Events.EventEmitter;
  b2Physics: Physics; // TODO should ideally be made private again
  playerController: CharacterController;
  soundManager: SoundManager;

  constructor() {
    super({ key: SCENE_GAME });
  }

  private create() {
    this.cameras.main.setBackgroundColor(0x3470c6);
    this.cameras.main.scrollX = -this.cameras.main.width / 2;
    this.cameras.main.scrollY = -this.cameras.main.height / 2;
    if (this.observer) this.observer.destroy(); // clear previous runs
    this.observer = new Phaser.Events.EventEmitter();
    this.b2Physics = new Physics(this, { worldScale: 40, gravityX: 0, gravityY: -10 });
    this.b2Physics.load(getCurrentLevel())
    new Terrain(this).draw();
    this.soundManager = new SoundManager(this);
    this.playerController = new CharacterController(this);
    // TODO this allows only one character per level. For each loadRubeScene call generate unique id and store it as custom props for each entity loaded
    // Then allow finding entities filtered by this uid
    const id = this.b2Physics.load(getSelectedCharacter(), 1, 2);
    // const id2 = this.b2Physics.load(getSelectedCharacter(), 5, 3);
    const character = new Character(this, id);
    this.playerController.possessCharacter(character);
    // const char2 = new Character(this, id2);

    // setTimeout(() => this.playerController.possessCharacter(character), 2000);

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
  }
}

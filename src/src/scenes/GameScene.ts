import Terrain from '../components/Terrain';
import { Physics } from '../components/Physics';
import { freeLeaked } from '../index';
import { SCENE_GAME, SCENE_GAME_UI } from "..";
import { CharacterController } from '../components/PlayerController';
import { getCurrentLevel } from '../util/getCurrentLevel';
import { getSelectedCharacter } from '../util/getCurrentCharacter';
import { Character } from '../components/Character';
import { RESTART_GAME } from '../eventTypes';
import { SoundManager } from '../components/SoundManager';

export default class GameScene extends Phaser.Scene {
  observer: Phaser.Events.EventEmitter;
  b2Physics: Physics;
  private playerController: CharacterController;

  constructor() {
    super({ key: SCENE_GAME });
  }

  private create() {
    if (this.observer) this.observer.destroy(); // clear previous runs
    this.observer = new Phaser.Events.EventEmitter();
    this.b2Physics = new Physics(this, { worldScale: 40, gravityX: 0, gravityY: -10 });
    new SoundManager(this);
    this.b2Physics.load(getCurrentLevel());
    new Terrain(this).draw();
    this.playerController = new CharacterController(this);
    const character = new Character(this, this.b2Physics.load(getSelectedCharacter(), 0, 0));
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
  }
}

import TerrainRenderer from '../components/Terrain';
import { Physics } from '../components/Physics';
import { b2 } from '../index';
import { SCENE_GAME, SCENE_GAME_UI } from "..";
import { CharacterController } from '../components/PlayerController';
import { getCurrentLevel } from '../util/getCurrentLevel';
import { getSelectedCharacter } from '../util/getCurrentCharacter';
import { Character } from '../components/Character';

export default class GameScene extends Phaser.Scene {
  observer: Phaser.Events.EventEmitter;
  b2Physics: Physics; // TODO should ideally be made private again
  playerController: CharacterController;

  constructor() {
    super({ key: SCENE_GAME });
  }

  private create() {
    if (this.observer) this.observer.destroy(); // clear previous runs
    this.observer = new Phaser.Events.EventEmitter();
    this.b2Physics = new Physics(this, 40, { x: 0, y: -10 });
    this.b2Physics.loadRubeScene(getCurrentLevel())
    new TerrainRenderer(this, this.b2Physics);
    // TODO this allows only one character per level. For each loadRubeScene call generate unique id and store it as custom props for each entity loaded
    // Then allow finding entities filtered by this uid
    this.b2Physics.loadRubeScene(getSelectedCharacter())
    const character = new Character(this);
    this.playerController = new CharacterController(this);
    this.playerController.possessCharacter(character);

    this.scene.launch(SCENE_GAME_UI, [this.observer, () => {
      this.playerController.reset();
      this.scene.restart();
      b2.destroy(this.b2Physics.world);
    }]);

    // TODO remove. Temporary to serialize open level
    this.input.keyboard!.on('keydown-ONE', () => this.b2Physics.serializer.serialize());
  }

  update() {
    this.b2Physics.update(); // needs to happen before update of player character inputs otherwise b2Body.GetPosition() inaccurate
    this.playerController.update();
  }
}

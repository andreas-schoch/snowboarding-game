import {SCENE_EDITOR} from '..';
import {Backdrop} from '../Backdrop';
import {BackdropGrid} from '../BackdropGrid';
import {Settings} from '../Settings';
import {EditorController} from '../controllers/EditorController';
import {drawCoordZeroPoint} from '../helpers/drawCoordZeroPoint';
import {Physics} from '../physics/Physics';
import {RubeScene} from '../physics/RUBE/RubeLoaderInterfaces';

export class EditorScene extends Phaser.Scene {
  b2Physics: Physics;
  private backdrop: Backdrop;
  private backdropGrid: BackdropGrid;
  private controller: EditorController;

  constructor() {
    super({key: SCENE_EDITOR});
  }

  private preload() {
    const character = Settings.selectedCharacter();
    this.load.json(character, `assets/levels/export/${character}.json`);
  }

  private create() {
    this.backdrop = new Backdrop(this);
    this.backdropGrid = new BackdropGrid(this);
    this.b2Physics = new Physics(this, {worldScale: 40, gravityX: 0, gravityY: -10});
    this.controller = new EditorController(this);

    drawCoordZeroPoint(this);

    // TODO ability to load individual RubeScenes and treat them as an Object Entity similar like in RUBE
    //  An object may contain many Bodies, Joints, Fixtures, etc. but will be displayed as a single entity
    const rubeScene: RubeScene = this.cache.json.get(Settings.selectedCharacter());
    this.b2Physics.load(rubeScene, 0, 0);
  }

  update(time: number, delta: number) {
    this.controller.update(time, delta);
    this.backdrop.update();
    this.backdropGrid.update();
  }
}

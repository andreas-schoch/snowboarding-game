import {SCENE_EDITOR} from '..';
import {Backdrop} from '../Backdrop';
import {BackdropGrid} from '../BackdropGrid';
import {GameInfo} from '../GameInfo';
import {Settings} from '../Settings';
import {initSolidUI} from '../UI';
import {EditorController} from '../controllers/EditorController';
import { EDITOR_SCENE_LOADED } from '../eventTypes';
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
    if (GameInfo.observer) GameInfo.observer.destroy(); // clear previous runs
    GameInfo.observer = new Phaser.Events.EventEmitter();

    this.backdrop = new Backdrop(this);
    this.backdropGrid = new BackdropGrid(this);
    this.b2Physics = new Physics(this, {worldScale: 40, gravityX: 0, gravityY: -10});
    this.controller = new EditorController(this);

    drawCoordZeroPoint(this);

    // TODO ability to load individual RubeScenes and treat them as an Object Entity similar like in RUBE
    //  An object may contain many Bodies, Joints, Fixtures, etc. but will be displayed as a single entity
    const rubeScene: RubeScene = this.cache.json.get(Settings.selectedCharacter());
    const id = this.b2Physics.load(rubeScene, 0, 0);
    initSolidUI('root-ui');
    GameInfo.observer.emit(EDITOR_SCENE_LOADED, id);

  }

  update(time: number, delta: number) {
    this.controller.update(time, delta);
    this.backdrop.update();
    this.backdropGrid.update();
  }
}

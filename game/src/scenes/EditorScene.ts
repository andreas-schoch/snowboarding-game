import {SCENE_EDITOR} from '..';
import {Backdrop} from '../Backdrop';
import {BackdropGrid} from '../BackdropGrid';
import {GameInfo} from '../GameInfo';
import {Settings} from '../Settings';
import {initSolidUI} from '../UI';
import {EditorController} from '../controllers/EditorController';
import {EDITOR_OPEN} from '../eventTypes';
import {drawCoordZeroPoint} from '../helpers/drawCoordZeroPoint';
import {Physics} from '../physics/Physics';
import {RubeScene} from '../physics/RUBE/RubeFileExport';

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
    this.b2Physics = new Physics(this, {worldScale: 40, gravityX: 0, gravityY: -10, debugDrawEnabled: true});
    this.controller = new EditorController(this);

    drawCoordZeroPoint(this);

    // TODO ability to load individual RubeScenes and treat them as an Object Entity similar like in RUBE
    //  An object may contain many Bodies, Joints, Fixtures, etc. but will be displayed as a single entity
    initSolidUI('root-ui');
    GameInfo.observer.emit(EDITOR_OPEN);
    const rubeScene: RubeScene = this.cache.json.get(Settings.selectedCharacter());
    this.b2Physics.load(rubeScene, 0, 0);
  }

  update(time: number, delta: number) {
    this.controller.update(time, delta);
    this.backdrop.update();
    this.backdropGrid.update();
  }
}

/*
------------------------------------
HOW DO WE LOAD DATA FROM RUBE FILES?
------------------------------------
There are 2 key differences between .rube files and the json export:
- fixtures aren't triangulated in .rube files. So 1 MetaFixture may turn into multiple RubeFixtures
- Objects get inlined in the export. So MetaObject information won't be available in the export

With this in mind. I want to stay compatible with RUBE. So we will only store .rube files in the backend
and transform it into the json format on the fly when opening the level.

--------------------------------------------------------------
The load level into level editor procedure will be as follows:
--------------------------------------------------------------
1. Fetch the level .rube file from the backend
2. Iterate over all MetaObjects:
  - Show its name in the Scene Explorer
  - Load all images and show them in the editor
  - Draw all fixture outlines (pre triangulation!)
  - Make sure when we move the metaObject's pivot point the images and fixtures move along
  - Make sure when we rotate the metaObject the images and fixtures rotate along
  - Make sure when we scale the metaObject the images and fixtures scale along
3. Iterate over all MetaBodies marked as terrain:
  - Draw the same way as the ingame terrain
  - Make sure when the metaBody's pivot point is moved the terrain moves along
4. If there are any remaining MetaBodies, MetaFixtures, MetaJoints, MetaImages:
  - Throw an error. There is no use for them as everything except the terrain can be added with MetaObjects (including obstacles, volumes, decoration etc.)
    (Once I am here I may reconsider adding volumes and images without the MetaObject wrapper but that will probably just complicate things...)
4. The editor scene should look the same as it would in the game now without any real Box2D bodies, fixtures, joints having been created yet

-------------------------------------------
Whenever we change something in the editor:
-------------------------------------------
1. Update the relevant thing in the Rube file (that is loaded in memory as an object)
2. Re-draw any changed images and fixtures, terrain etc.
3. Update any values in the UI (such as position, rotation, scale, names etc.) if needed
4. Indicate that there are unsaved changes (compare diff against uploaded .rube file)
   (Consider differentiating between saved and published. So we can save a level without publishing it to the backend yet)

---------------------------------
When saving/publishing the level:
---------------------------------
1. Transform the Rube file into the json format (wrap in try catch to ensure it's valid, if not, store it in localstorage still so it doesn't get lost)
2. Send the .rube file to the backend (already protobuf encoded) to be stored in the database
3. Update the editor UI to indicate the level has been saved and there are no unsaved changes

-----------------------------
When hitting the play button:
-----------------------------
1. Transform the Rube file into the json format if not already done (maybe do this in worker after saving? So it's ready to go without delay when we hit play)
2. Load it into the phaser scene the same way we do today.
3. Ensure the editor scene changes from "EditorController" to "PlayerController" and possesses the character

*/

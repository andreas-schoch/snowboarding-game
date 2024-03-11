import {SCENE_EDITOR, SCENE_GAME, pb, rootGame} from '..';
import {Backdrop} from '../Backdrop';
import {BackdropGrid} from '../BackdropGrid';
import {EditorInfo} from '../EditorInfo';
import {GameInfo} from '../GameInfo';
import {PersistedStore} from '../PersistedStore';
import {initSolidUI} from '../UI';
import {setEditorItems} from '../UI/EditorUI/globalSignals';
import {EditorController} from '../controllers/EditorController';
import {EditorRenderer} from '../editor/renderers/EditorRenderer';
import {EDITOR_EXIT, RUBE_FILE_LOADED} from '../eventTypes';
import {ILevel, ILevelNew, isLevel} from '../levels';
import {RubeFile} from '../physics/RUBE/RubeFile';
import {RubeMetaLoader} from '../physics/RUBE/RubeMetaLoader';
import {registerNewLevel} from '../physics/RUBE/generateEmptyRubeFile';

export class EditorScene extends Phaser.Scene {
  private backdrop: Backdrop;
  private backdropGrid: BackdropGrid;
  private controller: EditorController;

  constructor() {
    super({key: SCENE_EDITOR});
  }

  private preload() {
  }

  private create() {
    if (GameInfo.observer) GameInfo.observer.destroy();
    if (EditorInfo.observer) EditorInfo.observer.destroy(); // clear previous runs
    EditorInfo.observer = new Phaser.Events.EventEmitter();
    EditorInfo.filename = 'level_001';
    EditorInfo.camera = this.cameras.main;
    EditorInfo.phaserScene = this;
    EditorInfo.metaLoader = new RubeMetaLoader();

    this.backdrop = new Backdrop(this);
    this.backdropGrid = new BackdropGrid(this);
    this.controller = new EditorController(this);

    initSolidUI('root-ui');
    new EditorRenderer(this);

    this.getRubefile().then(([level, rubeFile]) => {
      const items = RubeMetaLoader.load(level, rubeFile);
      setEditorItems(items);
      EditorInfo.observer.emit(RUBE_FILE_LOADED, items);
    });

    EditorInfo.observer.on(EDITOR_EXIT, () => {
      document.body.appendChild(rootGame);
      this.scene.stop(SCENE_EDITOR);
      this.scene.start(SCENE_GAME);
    });
  }

  update(time: number, delta: number) {
    this.controller.update(time, delta);
    this.backdrop.update();
    this.backdropGrid.update();
  }

  private async getRubefile(): Promise<[ILevel | ILevelNew, RubeFile]> {
    const recentLevels = PersistedStore.editorRecentLevels();
    const mostRecent: ILevel | ILevelNew | undefined = recentLevels[0];

    // TODO at some point need to have a way to check the modified date and show a dialog to the user if they want to load the latest version
    if(isLevel(mostRecent)) {
      const rubefile = await pb.level.getRubeFile(mostRecent);
      if (rubefile) {
        PersistedStore.addEditorRecentLevel(mostRecent, rubefile);
        return [mostRecent, rubefile];
      }
    }

    const mostRecentRubefileLocal = PersistedStore.getEditorRubefile(mostRecent);
    if (mostRecentRubefileLocal) return [mostRecent, mostRecentRubefileLocal];

    console.debug('No level found. Creating new one...');
    const [level, file] = registerNewLevel();
    PersistedStore.addEditorRecentLevel(level, file);
    return [level, file];
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

--------------------------------
How terrain vertices are edited?
--------------------------------
- User has to switch to terrain edit mode. The individual points will be shown
- User can press down on a point and drag it to a new position (single press ideally)
- User can add a new point by double clicking on the line between 2 points or by selecting 2 points and opening context menu with right click (or show possible actions in the UI)
- User can add a new point at the end of the line
  (haven't decided how yet, maybe select the last point for it to be possible,
   then automatically select the new point, so user can add points quickly.
   Or simply have sub modes while in terrain edit mode? Add, Move, Delete, Select?
   Maybe have a panel to the left like in photoshop with different tools?)
- User can delete a point by selecting it and pressing the delete key or select delete from the context menu
- User can select multiple points and move them at the same time (implement at a later stage)

Consider using marching squares to allow drawing of terrain with various tools. Ideally this would be the ONLY way to draw terrain but I guess we can keep both
ways available. I just don't like to muddy the waters with too many options and I am not too fond of the current way (with the "control points")

This marching squares tool would simplify some things but make things behind the scenes considerably more difficult:
- We need to dynamically get the isolines
- We need to dynamically split up the terrain texture into chunks (shouldn't be too difficult but need to ensure that there are no gaps due to pixel rounding errors)
- We need to dynamically create the fixtures and vertices. This may be tricky due to ghost collisions. Some ideas:
  - Ghost collisions can be prevented by setting the prev and next vertex where we split them apart I think (verify!)
  - Ghost collisions can potentially be avoided by constantly re-creating the fixtures around the player and other non-static bodies
  - We could only chunk the textures and see how well it works to create all fixtures at once without splitting.
    This would be the easiest way. I know it works well enough for not too complex maps (like 1-5 which I didn't split into chunks until recently)
    But for long maps with lots of overhangs etc. it may not work well. Verify limits by having a huge map (8km) with a lot of vertices on a single fixture
    Also test huge map with lots and lots of fixtures. Compare againest each other
*/

// TODO Create a component for bezier curve generation. It could be used for terrain or for spawning objects along a path (e.g. coins)
// TODO Create a component for drawing with marching squares. It could be used for terrain or just for background decoration
//  Potentially users could create their own parallax backgrounds with this tool by allowing TilePosition and scrollFactor to be set
//  This could be a very powerful tool for the user to create their own unique levels but may be overkill for the first version of the editor...

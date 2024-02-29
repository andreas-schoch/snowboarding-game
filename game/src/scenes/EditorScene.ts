import {SCENE_EDITOR, SCENE_GAME, rootGame, rubeFileSerializer} from '..';
import {Backdrop} from '../Backdrop';
import {BackdropGrid} from '../BackdropGrid';
import {EditorInfo} from '../EditorInfo';
import {GameInfo} from '../GameInfo';
import {Settings} from '../Settings';
import {initSolidUI} from '../UI';
import {EditorController} from '../controllers/EditorController';
import {EditorItemTracker} from '../editor/items/ItemTracker';
import {MetaImageRenderer} from '../editor/renderers/MetaImageRenderer';
import {MetaObjectRenderer} from '../editor/renderers/MetaObjectRenderer';
import {MetaTerrainRenderer, XY} from '../editor/renderers/MetaTerrainRenderer';
import {EDITOR_EXIT, EDITOR_ITEM_SELECTED, EDITOR_SCENE_CHANGED, RUBE_FILE_LOADED} from '../eventTypes';
import {decomposePolygon} from '../helpers/decomposePolygon';
import {drawCoordZeroPoint} from '../helpers/drawCoordZeroPoint';
import {ILevel} from '../levels';
import {Physics} from '../physics/Physics';
import {RubeExport} from '../physics/RUBE/RubeExport';
import {RubeFile, RubeVectorArray} from '../physics/RUBE/RubeFile';
import { RubeFileToExport } from '../physics/RUBE/RubeFileToExport';
import {EditorItem, RubeMetaLoader} from '../physics/RUBE/RubeMetaLoader';
import {sanitizeRubeFile} from '../physics/RUBE/sanitizeRubeFile';

export class EditorScene extends Phaser.Scene {
  b2Physics: Physics;
  private backdrop: Backdrop;
  private backdropGrid: BackdropGrid;
  private controller: EditorController;
  private ready: boolean;
  private level: ILevel | null = null;

  constructor() {
    super({key: SCENE_EDITOR});
  }

  private init(data: {level: ILevel | null}) {
    // this.data = data;
    this.level = data.level;
    this.ready = false;
  }

  private preload() {
    const character = Settings.selectedCharacter();
    this.load.json(character, `assets/levels/export/${character}.json`);
    this.load.json('level_new.rube', 'assets/levels/level_new.rube');
    if (this.level?.number) {
      const filename = `level_${String(this.level.number).padStart(3, '0')}.rube`;
      this.load.json(filename, `assets/levels/${filename}`);
    }
  }

  private create() {
    if (GameInfo.observer) GameInfo.observer.destroy();
    if (EditorInfo.observer) EditorInfo.observer.destroy(); // clear previous runs
    EditorInfo.observer = new Phaser.Events.EventEmitter();
    EditorInfo.filename = this.level?.number ? `level_${String(this.level.number).padStart(3, '0')}.rube` : 'level_new.rube';

    this.backdrop = new Backdrop(this);
    this.backdropGrid = new BackdropGrid(this);
    this.b2Physics = new Physics(this, {pixelsPerMeter: 40, gravityX: 0, gravityY: -10, debugDrawEnabled: true});
    this.controller = new EditorController(this);

    drawCoordZeroPoint(this);
    initSolidUI('root-ui');

    /////////////////////////////////////////////////////////////////7

    const rubeVecArray: RubeVectorArray = {
      x :
      [
        0.5,
        0.3535529971122742,
        0.215586781501770,
        -2.185569947243948e-08,
        -0.1315781027078629,
        -0.3361012637615204,
        -0.5506259799003601,
        -0.6399946212768555,
        -0.7207240462303162,
        -0.7611986398696899,
        -0.7669696211814880,
        -0.7343879938125610,
        -0.7059382796287537,
        -0.6593312621116638,
        -0.6909815669059753,
        -0.7007053494453430,
        -0.6903861761093140,
        -0.6717327833175659,
        -0.5975423455238342,
        -0.4929342865943909,
        -0.7250875234603882,
        -1.006091833114624,
        -1.059871912002563,
        -0.9356896281242371,
        -0.5,
        -0.7987096309661865,
        -0.7155374884605408,
        -0.6472271680831909,
        -0.4684544205665588,
        -0.1929901987314224,
        5.962439875162318e-09,
        0.2249274104833603,
        0.2567968070507050,
        0.2784064114093781,
        0.3537681102752686,
        0.7811901569366455,
        0.9154679775238037,
        1.024560928344727,
        1.034868717193604,
        1.130254626274109,
        1.245498180389404,
        1.217666625976562,
        1.132608652114868,
        1.060717821121216,
        0.9164497852325439,
        0.7930280566215515,
        0.6923287510871887,
        0.6920139789581299,
        0.7382264733314514,
        0.8317661285400391,
        0.9494246244430542,
        0.3886514008045197,
        0.4058951735496521,
        0.3290123641490936
      ],
      y :
      [
        0.0,
        0.3535529971122742,
        0.4753211140632629,
        0.5,
        0.5141767859458923,
        0.5146940946578979,
        0.6832293868064880,
        0.719593882560730,
        0.7286999225616455,
        0.6616541147232056,
        0.6183973550796509,
        0.5720059871673584,
        0.5533577203750610,
        0.5815785527229309,
        0.5854197740554810,
        0.6127966046333313,
        0.6329299211502075,
        0.6409077644348145,
        0.6101993322372437,
        0.5124871730804443,
        0.4119075536727905,
        0.2386015355587006,
        0.1595349907875061,
        0.09624360501766205,
        -4.371139894487897e-08,
        -0.3111850023269653,
        -0.4551549851894379,
        -0.2575103938579559,
        -0.2309914231300354,
        -0.3070929348468781,
        -0.5,
        -0.3971499502658844,
        -0.3936311900615692,
        -0.4113028943538666,
        -0.6155840754508972,
        -0.7675529718399048,
        -0.7363286614418030,
        -0.2944563031196594,
        -0.1798244714736938,
        -0.08899474143981934,
        0.1067938953638077,
        0.4049117565155029,
        0.5786545872688293,
        0.7225071191787720,
        0.7890956401824951,
        0.6788933277130127,
        0.5835910439491272,
        0.4451115727424622,
        0.2775663137435913,
        0.08084143698215485,
        -0.1328427493572235,
        -0.2688201665878296,
        -0.2271898984909058,
        -0.1083750873804092
      ]
    };

    const polygons = decomposePolygon(rubeVecArray);

    const graphics = this.add.graphics().setDepth(10000000000000000000);
    const ppm = 500;
    graphics.lineStyle(1, 0x00ff00, 1);
    for (const polygon of polygons) {
      const polygonScaled: XY[] = polygon.x.map((x, i) => ({x: x * ppm, y: -polygon.y[i] * ppm}));
      console.log('--- draw polygonScaled', polygonScaled);
      graphics.beginPath();
      graphics.moveTo(polygonScaled[0].x, polygonScaled[0].y);
      for (let i = 1; i < polygonScaled.length; i++) {
        graphics.lineTo(polygonScaled[i].x, polygonScaled[i].y);
      }
      graphics.closePath();
      graphics.strokePath();

      graphics.fillStyle(0xff0000, 1);
      for (const point of polygonScaled) {
        graphics.fillCircle(point.x, point.y, 2);
      }

    }

    /////////////////////////////////////////////////////////////////7

    EditorInfo.observer.on(EDITOR_EXIT, () => {
      document.body.appendChild(rootGame);
      this.scene.stop(SCENE_EDITOR);
      this.scene.start(SCENE_GAME);
    });

    EditorInfo.observer.on(EDITOR_ITEM_SELECTED, (item: EditorItem, centerOn: boolean) => {
      const position = item.getPosition();
      const ppm = this.b2Physics.worldEntity.pixelsPerMeter;
      if (centerOn) this.cameras.main.pan(position.x * ppm, position.y * ppm, 300, 'Power2', true);
    });

    // pb.level.get(Settings.currentLevel()).then(async level => {
    // GameInfo.currentLevel = level;
    // const scene = await pb.level.getRubeScene(level);
    // const scene: RubeFile = this.cache.json.get('level_new.rube');
    const rubefile: RubeFile = this.cache.json.get(EditorInfo.filename);
    const sanitized = sanitizeRubeFile(rubefile);
    const jsonExport = RubeFileToExport(sanitized);
    const encoded = rubeFileSerializer.encode(sanitized);
    console.debug('sanitized rube file', sanitized, JSON.stringify(sanitized).length);
    console.debug('encoded rube file', encoded, encoded.length);
    console.log('----------jsonExport', jsonExport);

    const metaLoader = new RubeMetaLoader(this);
    const items = metaLoader.load(rubefile);
    EditorItemTracker.editorItems = items;
    EditorInfo.observer.emit(RUBE_FILE_LOADED, items);

    const metaTerrainRenderer = new MetaTerrainRenderer(this, this.b2Physics.worldEntity.pixelsPerMeter);
    const metaImageRenderer = new MetaImageRenderer(this, this.b2Physics.worldEntity.pixelsPerMeter);
    const metaObjectRenderer = new MetaObjectRenderer(this, this.b2Physics.worldEntity.pixelsPerMeter);
    metaTerrainRenderer.renderThrottled(Object.values(items.terrain));
    metaImageRenderer.renderThrottled(Object.values(items.image));
    metaObjectRenderer.renderThrottled(Object.values(items.object));

    EditorInfo.observer.on(EDITOR_SCENE_CHANGED, (changed: EditorItem) => {
      switch (changed.type) {
      case 'terrain':
        return metaTerrainRenderer.renderThrottled([changed]);
      case 'image':
        return metaImageRenderer.renderThrottled([changed]);
      case 'object':
        return metaObjectRenderer.renderThrottled([changed]);
      }
    });

    const rubeScene: RubeExport = this.cache.json.get(Settings.selectedCharacter());
    this.b2Physics.load(rubeScene, 0, 0);
    this.ready = true;
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

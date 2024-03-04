import {Accessor, Setter, createSignal} from 'solid-js';
import {XY} from '../../Terrain';
import {pseudoRandomId} from '../../helpers/pseudoRandomId';
import {RubeCustomPropsMap} from '../../physics/RUBE/EntityTypes';
import {MetaBody, MetaFixture} from '../../physics/RUBE/RubeFile';
import {BaseEditorItem, RubeMetaLoader, Bounds} from '../../physics/RUBE/RubeMetaLoader';
import {customPropsArrayToMap, RubeVectorArrayToXY, customPropsMapToArray, XYToRubeVectorArray, rubeToXY} from '../../physics/RUBE/rubeTransformers';
import {EditorObject} from './EditorObject';
import {EditorItemTracker} from './ItemTracker';

export class EditorTerrainChunk implements BaseEditorItem {

  readonly id: string;
  readonly type = 'terrain';
  readonly signal: Accessor<EditorTerrainChunk>;
  private readonly setSignal: Setter<EditorTerrainChunk>;
  private pseudoAngle: number = 0;

  constructor(private loader: RubeMetaLoader, public metaBody: MetaBody, private metaFixture: MetaFixture, public parent?: EditorObject) {
    this.id = pseudoRandomId();
    const [signal, setSignal] = createSignal<EditorTerrainChunk>(this, {equals: false});
    this.signal = signal;
    this.setSignal = setSignal;
  }

  getCustomProps() {
    return customPropsArrayToMap(this.metaFixture.customProperties);
  }

  getName() {
    return this.metaFixture.name || '';
  }

  getPosition(options = {local: false}) {
    // We treat a fixture as it's own entity but only the body of the fixture has a position (body assumed to be at 0,0)
    // The position of the fixture is the avg position of all its vertices.

    // While we can get a decent approximation from the bounds, it causes the position to constantly change when we rotate the fixture
    // This is annoying as the terrain won't end up in the same spot when we rotate it back to 0...
    // const bounds = this.getBounds();
    // return {x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2};

    const vertices = this.getVertices(options);
    const x = vertices.reduce((sum, v) => sum + v.x, 0) / vertices.length;
    const y = vertices.reduce((sum, v) => sum + v.y, 0) / vertices.length;
    return {x, y};
  }

  getAngle() {
    // We treat a fixture as it's own entity but only the body of the fixture has an angle
    // Pseudo angle has no relevancy outside of the UI
    return this.pseudoAngle;
  }

  getVertices(options = {local: false}) {
    const {x, y} = options.local ? {x: 0, y: 0} : rubeToXY(this.metaBody.position);
    return RubeVectorArrayToXY(this.metaFixture.vertices, x, y);
  }

  getBounds(): Bounds {
    const vertices = this.getVertices();
    const minX = vertices.reduce((min, v) => Math.min(min, v.x), vertices[0].x);
    const minY = vertices.reduce((min, v) => Math.min(min, v.y), vertices[0].y);
    const maxX = vertices.reduce((max, v) => Math.max(max, v.x), vertices[0].x);
    const maxY = vertices.reduce((max, v) => Math.max(max, v.y), vertices[0].y);
    return {x: minX, y: minY, width: maxX - minX, height: maxY - minY};
  }

  setCustomProps(props: RubeCustomPropsMap) {
    this.metaFixture.customProperties = customPropsMapToArray(props);
    this.signalUpdate();
  }

  setName(name: string) {
    this.metaBody.name = name;
    this.signalUpdate();
  }

  // TODO add ability to change between world and local coordinates when translating items in the editor)
  setPosition(position: XY) {
    // get the difference of the current avg position and the new position then add that difference to all vertices
    const vertices = this.getVertices({local: true});
    const oldPosition = this.getPosition();
    const diff = {x: position.x - oldPosition.x, y: position.y - oldPosition.y};
    const newVertices = vertices.map(v => ({x: v.x + diff.x, y: v.y + diff.y}));
    this.setVertices(newVertices);
    this.setSignal(this as EditorTerrainChunk);
    // TODO can be optimized by passing which properties changed. If only pos or rot change, we can just translate or rotate the graphics
    //  Only when the vertices change due to user editing them (well excluding rotation which also changes then) we need to redraw the graphics for terrain
    EditorItemTracker.trackChange(this);
  }

  setAngle(angle: number) {
    // We shouldn't change the body angle as it will affect all of its fixtures.
    // Fixtures itself have no angle, so we change the position of each vertex instead.
    // We take the avg vertex position as the pivot point and rotate each vertex around that pivot point
    // Later on we can make it work with arbitrary pivot points like the RUBE Editor where you can set a "cursor" by pressing "c"
    const vertices = this.getVertices({local: true});
    const pivot = this.getPosition({local: true});
    const angleDiff = angle - this.getAngle(); // TODO verify if this works when parent body is rotated

    const newVertices = vertices.map(v => {
      const x = pivot.x + (v.x - pivot.x) * Math.cos(angleDiff) - (v.y - pivot.y) * Math.sin(angleDiff);
      const y = pivot.y + (v.x - pivot.x) * Math.sin(angleDiff) + (v.y - pivot.y) * Math.cos(angleDiff);
      return {x, y};
    });

    this.pseudoAngle = angle;
    this.setVertices(newVertices);
    this.signalUpdate();
  }

  private setVertices(vertices: XY[]) {
    this.metaFixture.vertices = XYToRubeVectorArray(vertices);
  }

  private signalUpdate() {
    this.setSignal(this as EditorTerrainChunk);
    EditorItemTracker.trackChange(this);
  }
}

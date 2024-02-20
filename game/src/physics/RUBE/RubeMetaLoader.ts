import {XY} from '../../Terrain';
import {pseudoRandomId} from '../../helpers/pseudoRandomId';
import {RubeVectorArrayToXY, XYToRubeVectorArray, customPropsArrayToMap, customPropsMapToArray, rubeToXY} from '../../helpers/rubeTransformers';
import {RubeCustomPropsMap} from './EntityTypes';
import {MetaBody, MetaFixture, MetaImage, MetaObject, RubeFile} from './RubeFile';

export interface EditorItems {
  objects: EditorObject[];
  terrainChunks: EditorTerrainChunk[];
  sensors: EditorSensor[];
  images: EditorImage[];
}

interface BaseEditorItem {
  id: string;
  type: 'object' | 'terrain' | 'image' | 'sensor';

  getCustomProps(): RubeCustomPropsMap;
  getPosition(): XY;
  getName(): string;
  getAngle(): number;

  setCustomProps(props: RubeCustomPropsMap): void;
  setPosition(position: XY): void;
  setName(name: string): void;
  setAngle(angle: number): void;
}

////////////////////////////////////////////////////////////////////////////////////////

export class EditorObject implements BaseEditorItem {
  readonly id: string;
  readonly type = 'object';
  readonly items: EditorItems;

  constructor(private loader: RubeMetaLoader, public meta: MetaObject) {
    this.id = pseudoRandomId();
    const fileName = meta.file.split('/').reverse()[0];
    if (!this.loader.scene.cache.json.has(fileName)) throw new Error(`RUBE file "${fileName}" not found in the cache`);
    const rubeFile: RubeFile = this.loader.scene.cache.json.get(fileName);
    this.items = loader.load(rubeFile);
  }

  getCustomProps() {
    return customPropsArrayToMap(this.meta.customProperties);
  }

  getName() {
    return this.meta.name || '';
  }

  getPosition() {
    return rubeToXY(this.meta.position);
  }

  getAngle() {
    return this.meta.angle || 0;
  }

  setCustomProps(props: RubeCustomPropsMap) {
    this.meta.customProperties = customPropsMapToArray(props);
  }

  setName(name: string) {
    this.meta.name = name;
  }

  setPosition(position: XY) {
    this.meta.position = {x: position.x, y: position.y};
  }

  setAngle(angle: number) {
    this.meta.angle = angle;
  }
}

////////////////////////////////////////////////////////////////////////////////////////

export class EditorTerrainChunk implements BaseEditorItem {
  readonly id: string;
  readonly type = 'terrain';
  private pseudoAngle: number = 0;

  constructor(private loader: RubeMetaLoader, public metaBody: MetaBody, private metaFixture: MetaFixture) {
    this.id = pseudoRandomId();
  }

  getCustomProps() {
    return customPropsArrayToMap(this.metaFixture.customProperties);
  }

  getName() {
    return this.metaFixture.name || '';
  }

  getPosition() {
    // We treat a fixture as it's own entity but only the body of the fixture has a position (body assumed to be at 0,0)
    // For now I take the average of the fixture vertices as the position
    // I'm not sure if this will stay this way or if we limit bodies to 1 fixture
    const vertices = this.getVertices();
    const x = vertices.reduce((sum, v) => sum + v.x, 0) / vertices.length;
    const y = vertices.reduce((sum, v) => sum + v.y, 0) / vertices.length;
    return {x, y};
  }

  getAngle() {
    // We treat a fixture as it's own entity but only the body of the fixture has an angle
    // Pseudo angle has no relevancy outside of the UI
    return this.pseudoAngle;
  }

  getVertices() {
    return RubeVectorArrayToXY(this.metaFixture.vertices);
  }

  setCustomProps(props: RubeCustomPropsMap) {
    this.metaFixture.customProperties = customPropsMapToArray(props);
  }

  setName(name: string) {
    this.metaBody.name = name;
  }

  setPosition(position: XY) {
    // get the difference of the current avg position and the new position then add that difference to all vertices
    const vertices = this.getVertices();
    const oldPosition = this.getPosition();
    const diff = {x: position.x - oldPosition.x, y: position.y - oldPosition.y};
    const newVertices = vertices.map(v => ({x: v.x + diff.x, y: v.y + diff.y}));
    this.setVertices(newVertices);
  }

  setAngle(angle: number) {
    // We shouldn't change the body angle as it will affect all of its fixtures.
    // Fixtures itself have no angle, so we change the position of each vertex instead.
    // We take the avg vertex position as the pivot point and rotate each vertex around that pivot point
    // Later on we can make it work with arbitrary pivot points like the RUBE Editor where you can set a "cursor" by pressing "c"
    const vertices = this.getVertices();
    const pivot = this.getPosition();
    const angleDiff = angle - this.getAngle();
    const newVertices = vertices.map(v => {
      const x = pivot.x + (v.x - pivot.x) * Math.cos(angleDiff) - (v.y - pivot.y) * Math.sin(angleDiff);
      const y = pivot.y + (v.x - pivot.x) * Math.sin(angleDiff) + (v.y - pivot.y) * Math.cos(angleDiff);
      return {x, y};
    });

    this.setVertices(newVertices);
  }

  setVertices(vertices: XY[]) {
    this.metaFixture.vertices = XYToRubeVectorArray(vertices);
  }
}

////////////////////////////////////////////////////////////////////////////////////////

export class EditorSensor implements BaseEditorItem {
  readonly id: string;
  readonly type: 'sensor';

  constructor(private loader: RubeMetaLoader, public meta: MetaBody, public sensorType: 'level_finish' | 'level_deathzone' | 'pickup_present') {
    this.id = pseudoRandomId();
    this.meta = meta;
    this.sensorType = sensorType;
  }

  getCustomProps() {
    const fixture = this.meta.fixture?.[0];
    if (!fixture) throw new Error('No fixture found in the sensor body');
    return customPropsArrayToMap(fixture.customProperties);
  }

  getName() {
    return this.meta.name || '';
  }

  getPosition() {
    return rubeToXY(this.meta.position);
  }

  getAngle() {
    return this.meta.angle || 0;
  }

  setCustomProps(props: RubeCustomPropsMap) {
    const fixture = this.meta.fixture?.[0];
    if (!fixture) throw new Error('No fixture found in the sensor body');
    fixture.customProperties = customPropsMapToArray(props);
  }

  setName(name: string) {
    this.meta.name = name;
  }

  setPosition(position: XY) {
    this.meta.position = {x: position.x, y: position.y};
  }

  setAngle(angle: number) {
    this.meta.angle = angle;
  }
}

////////////////////////////////////////////////////////////////////////////////////////

export class EditorImage implements BaseEditorItem {
  readonly id: string;
  readonly type = 'image';

  constructor(private loader: RubeMetaLoader, public meta: MetaImage) { // TODO consider making meta private, used for rendering for now
    this.id = pseudoRandomId();
  }

  getCustomProps() {
    return customPropsArrayToMap(this.meta.customProperties);
  }

  getName() {
    return this.meta.name || '';
  }

  getPosition() {
    return rubeToXY(this.meta.center);
  }

  getAngle() {
    return this.meta.angle || 0;
  }

  getDepth() {
    return this.meta.renderOrder || 0;
  }

  setCustomProps(props: RubeCustomPropsMap) {
    this.meta.customProperties = customPropsMapToArray(props);
  }

  setName(name: string) {
    this.meta.name = name;
  }

  setPosition(position: XY) {
    this.meta.center = {x: position.x, y: position.y};
  }

  setAngle(angle: number) {
    this.meta.angle = angle;
  }

  setDepth(depth: number) {
    this.meta.renderOrder = depth;
  }
}

////////////////////////////////////////////////////////////////////////////////////////

export interface EditorSpawnPoint extends BaseEditorItem {
  meta: MetaBody;
}

export interface EditorVertex extends XY {
  id: string;
  index: number;
}

export type EditorItem = EditorObject | EditorTerrainChunk | EditorImage | EditorSensor;

export class RubeMetaLoader {

  constructor(public scene: Phaser.Scene) { }

  load(rubeFile: RubeFile): EditorItems {
    return {
      objects: this.loadObjects(rubeFile),
      terrainChunks: this.loadTerrainChunks(rubeFile),
      sensors: this.loadSensors(rubeFile),
      images: this.loadImages(rubeFile)
    };
  }

  private loadObjects(rubeFile: RubeFile): EditorObject[] {
    const metaObjects = rubeFile.metaworld?.metaobject || [];
    const objects: EditorObject[] = [];
    for (const metaObject of metaObjects) objects.push(new EditorObject(this, metaObject));
    return objects;
  }

  // loadObjectItems(metaObject: MetaObject): EditorItems {
  //   return this.load(rubeFile);
  // }

  private loadImages(rubeFile: RubeFile): EditorImage[] {
    const metaImages = rubeFile.metaworld?.metaimage || [];
    const images = metaImages.map(metaImage => new EditorImage(this, metaImage));
    return images;
  }

  private loadTerrainChunks(rubeFile: RubeFile): EditorTerrainChunk[] {
    const terrainChunks: EditorTerrainChunk[] = [];
    if (!rubeFile.metaworld?.metabody) return terrainChunks;

    for (const metaBody of rubeFile.metaworld.metabody) {
      if (!metaBody.fixture) continue;
      for (const metaFixture of metaBody.fixture) {
        if (!metaFixture.customProperties) continue;
        const isTerrain = metaFixture.customProperties.some(prop => prop.name === 'surfaceType' && prop.string === 'snow');
        if (!isTerrain) continue;
        if (metaFixture.shapes.length === 0) throw new Error('No shapes found in the fixture');
        if (metaFixture.shapes.length > 1) throw new Error('Multiple shapes found in the fixture');
        const metaFixtureShape = metaFixture.shapes[0];
        if (metaFixtureShape.type !== 'line' && metaFixtureShape.type !== 'loop') throw new Error('Only polygon shapes are supported for terrain chunks');
        terrainChunks.push(new EditorTerrainChunk(this, metaBody, metaFixture));
      }
    }

    console.log('terrainChunks', terrainChunks);
    return terrainChunks;
  }

  private loadSensors(rubeFile: RubeFile): EditorSensor[] {
    const sensorBodies = rubeFile.metaworld?.metabody?.filter(b => b.fixture?.[0].customProperties?.some(prop => prop.name === 'phaserSensorType')) || [];
    const sensors: EditorSensor[] = []; // TODO
    for (const body of sensorBodies) {
      const sensorFixture = body.fixture?.[0];
      if (!sensorFixture) throw new Error('No fixture found in the sensor body');
      const sensorType = sensorFixture.customProperties?.find(prop => prop.name === 'phaserSensorType')?.string;
      if (!sensorType) throw new Error('Sensor type not defined on the sensor body');
      if (sensorType !== 'level_finish' && sensorType !== 'level_deathzone' && sensorType !== 'pickup_present') throw new Error('Invalid sensor type');
      sensors.push(new EditorSensor(this, body, sensorType as 'level_finish' | 'level_deathzone' | 'pickup_present'));
    }

    return sensors;
  }
}

import {XY} from '../../Terrain';
import {EditorImage} from '../../editor/items/EditorImage';
import {EditorObject} from '../../editor/items/EditorObject';
import {EditorSensor} from '../../editor/items/EditorSensor';
import {EditorTerrainChunk} from '../../editor/items/EditorTerrain';
import {ILevel, ILevelNew} from '../../levels';
import {RubeCustomPropsMap} from './EntityTypes';
import {RubeFile} from './RubeFile';

export interface EditorItems {
  object: Record<EditorItem['id'], EditorObject>;
  terrain: Record<EditorItem['id'], EditorTerrainChunk>;
  sensor: Record<EditorItem['id'], EditorSensor>;
  image: Record<EditorItem['id'], EditorImage>;
  // fixture: Record<EditorItem['id'], EditorFixture>;
  rubefile: RubeFile;
  level: ILevel | ILevelNew;
}

export type Bounds = {x: number, y: number, width: number, height: number};

export interface BaseEditorItem {
  id: string;
  type: 'object' | 'terrain' | 'image' | 'sensor' | 'fixture';

  getCustomProps(): RubeCustomPropsMap;
  getPosition(): XY;
  getName(): string;
  getAngle(): number;
  getBounds(): Bounds;

  setCustomProps(props: RubeCustomPropsMap): void;
  setPosition(x: number, y: number): void;
  setName(name: string): void;
  setAngle(angle: number): void;

  delete(): void;
}

// TODO add new type of EditorItem called "Group" with can contain any amount of other non-group items, lists members in explorer as collapsible list
export type EditorItem = EditorObject | EditorTerrainChunk | EditorImage | EditorSensor; // | EditorFixture;

export class RubeMetaLoader {

  constructor() { }

  static load(level: ILevel | ILevelNew, rubefile: RubeFile, parent?: EditorObject): EditorItems {
    return {
      rubefile,
      level,
      object: RubeMetaLoader.loadObjects(level, rubefile),
      terrain: RubeMetaLoader.loadTerrainChunks(rubefile, parent),
      sensor: RubeMetaLoader.loadSensors(rubefile, parent),
      image: RubeMetaLoader.loadImages(rubefile, parent),
      // fixture: this.loadFixtures(rubefile, parent),
    };
  }

  private static loadObjects(level: ILevel | ILevelNew, rubeFile: RubeFile) {
    const metaObjects = rubeFile.metaworld?.metaobject || [];
    const objects: Record<EditorObject['id'], EditorObject> = {};
    for (const metaObject of metaObjects) {
      const object = new EditorObject(level, metaObject);
      objects[object.id] = object;
    }
    return objects;
  }

  private static loadImages(rubeFile: RubeFile, parent?: EditorObject) {
    const metaImages = rubeFile.metaworld?.metaimage || [];
    const images: Record<EditorImage['id'], EditorImage> = {};
    for (const metaImage of metaImages) {
      const body = rubeFile.metaworld?.metabody?.find(b => b.id === metaImage.body);
      const image = new EditorImage(metaImage, body, parent);
      images[image.id] = image;
    }
    return images;
  }

  private static loadTerrainChunks(rubeFile: RubeFile, parent?: EditorObject) {
    const terrainChunks: Record<EditorTerrainChunk['id'], EditorTerrainChunk> = {};
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
        const chunk = new EditorTerrainChunk(metaBody, metaFixture, parent);
        terrainChunks[chunk.id] = chunk;
      }
    }

    return terrainChunks;
  }

  // private loadFixtures(rubeFile: RubeFile, parent?: EditorObject) {
  //   const fixtureBodies = rubeFile.metaworld?.metabody?.filter(b => b.fixture?.length) || [];
  //   const fixtures: Record<EditorFixture['id'], EditorFixture> = {};
  //   for (const body of fixtureBodies) {
  //     for (const fixture of body.fixture || []) {
  //       const editorFixture = new EditorFixture(this, body, fixture, parent);
  //       fixtures[editorFixture.id] = editorFixture;
  //     }
  //   }

  //   return fixtures;
  // }

  private static loadSensors(rubeFile: RubeFile, parent?: EditorObject) {
    const sensorBodies = rubeFile.metaworld?.metabody?.filter(b => b.fixture?.[0]?.customProperties?.some(prop => prop.name === 'phaserSensorType')) || [];
    const sensors: Record<EditorSensor['id'], EditorSensor> = {};
    for (const body of sensorBodies) {
      const sensorFixture = body.fixture?.[0];
      if (!sensorFixture) throw new Error('No fixture found in the sensor body');
      const sensorType = sensorFixture.customProperties?.find(prop => prop.name === 'phaserSensorType')?.string;
      if (!sensorType) throw new Error('Sensor type not defined on the sensor body');
      if (sensorType !== 'level_finish' && sensorType !== 'level_deathzone' && sensorType !== 'pickup_present') throw new Error('Invalid sensor type');
      const sensor = new EditorSensor(body, sensorType as 'level_finish' | 'level_deathzone' | 'pickup_present', parent);
      sensors[sensor.id] = sensor;
    }

    return sensors;
  }
}

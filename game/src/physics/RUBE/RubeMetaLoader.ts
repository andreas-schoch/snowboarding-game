import {XY} from '../../Terrain';
import {EditorImage} from '../../editor/items/EditorImage';
import {EditorObject} from '../../editor/items/EditorObject';
import {EditorSensor} from '../../editor/items/EditorSensor';
import {EditorTerrainChunk} from '../../editor/items/EditorTerrain';
import {RubeCustomPropsMap} from './EntityTypes';
import {RubeFile} from './RubeFile';

export interface EditorItems {
  object: Record<EditorItem['id'], EditorObject>;
  terrain: Record<EditorItem['id'], EditorTerrainChunk>;
  sensor: Record<EditorItem['id'], EditorSensor>;
  image: Record<EditorItem['id'], EditorImage>;
}

export type Bounds = {x: number, y: number, width: number, height: number};

export interface BaseEditorItem {
  id: string;
  type: 'object' | 'terrain' | 'image' | 'sensor';

  getCustomProps(): RubeCustomPropsMap;
  getPosition(): XY;
  getName(): string;
  getAngle(): number;
  getBounds(): Bounds;

  setCustomProps(props: RubeCustomPropsMap): void;
  setPosition(position: XY): void;
  setName(name: string): void;
  setAngle(angle: number): void;
}

export type EditorItem = EditorObject | EditorTerrainChunk | EditorImage | EditorSensor;

export class RubeMetaLoader {

  constructor(public scene: Phaser.Scene) { }

  load(rubeFile: RubeFile): EditorItems {
    return {
      object: this.loadObjects(rubeFile),
      terrain: this.loadTerrainChunks(rubeFile),
      sensor: this.loadSensors(rubeFile),
      image: this.loadImages(rubeFile),
    };
  }

  private loadObjects(rubeFile: RubeFile) {
    const metaObjects = rubeFile.metaworld?.metaobject || [];
    const objects: Record<EditorObject['id'], EditorObject> = {};
    for (const metaObject of metaObjects) {
      const object = new EditorObject(this, metaObject);
      objects[object.id] = object;
    }
    return objects;
  }

  private loadImages(rubeFile: RubeFile) {
    const metaImages = rubeFile.metaworld?.metaimage || [];
    const images: Record<EditorImage['id'], EditorImage> = {};
    for (const metaImage of metaImages) {
      const body = rubeFile.metaworld?.metabody?.find(b => b.id === metaImage.body);
      const image = new EditorImage(this, metaImage, body);
      images[image.id] = image;
    }
    return images;
  }

  private loadTerrainChunks(rubeFile: RubeFile) {
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
        const chunk = new EditorTerrainChunk(this, metaBody, metaFixture);
        terrainChunks[chunk.id] = chunk;
      }
    }

    return terrainChunks;
  }

  private loadSensors(rubeFile: RubeFile) {
    const sensorBodies = rubeFile.metaworld?.metabody?.filter(b => b.fixture?.[0].customProperties?.some(prop => prop.name === 'phaserSensorType')) || [];
    const sensors: Record<EditorSensor['id'], EditorSensor> = {};
    for (const body of sensorBodies) {
      const sensorFixture = body.fixture?.[0];
      if (!sensorFixture) throw new Error('No fixture found in the sensor body');
      const sensorType = sensorFixture.customProperties?.find(prop => prop.name === 'phaserSensorType')?.string;
      if (!sensorType) throw new Error('Sensor type not defined on the sensor body');
      if (sensorType !== 'level_finish' && sensorType !== 'level_deathzone' && sensorType !== 'pickup_present') throw new Error('Invalid sensor type');
      const sensor = new EditorSensor(this, body, sensorType as 'level_finish' | 'level_deathzone' | 'pickup_present');
      sensors[sensor.id] = sensor;
    }

    return sensors;
  }
}

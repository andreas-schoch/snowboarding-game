import {XY} from '../../Terrain';
import {EditorImage} from '../../editor/items/EditorImage';
import {EditorObject} from '../../editor/items/EditorObject';
import {EditorSensor} from '../../editor/items/EditorSensor';
import {EditorTerrainChunk} from '../../editor/items/EditorTerrain';
import {RubeCustomPropsMap} from './EntityTypes';
import {RubeFile} from './RubeFile';

export interface EditorItems {
  objects: EditorObject[];
  terrainChunks: EditorTerrainChunk[];
  sensors: EditorSensor[];
  images: EditorImage[];
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

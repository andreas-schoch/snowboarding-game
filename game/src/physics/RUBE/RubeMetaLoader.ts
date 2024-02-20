import {XY} from '../../Terrain';
import {pseudoRandomId} from '../../helpers/pseudoRandomId';
import {customPropsArrayToMap, rubeToXY} from '../../helpers/rubeTransformers';
import {MetaBody, MetaImage, MetaObject, RubeFile, RubeCustomProperty, RubeVectorArray , RubeVector} from './RubeFile';
import {customPropertyDefs} from './customPropertyDefs';
import {RubeCustomPropsMap} from './otherTypes';

export interface EditorItems {
  objects: EditorObject[];
  terrainChunks: EditorTerrainChunk[];
  sensors: EditorSensor[];
  images: EditorImage[];
}

interface BaseEditorItem {
  id: string;
  customProps: RubeCustomPropsMap;
  position: XY;
  angle: number;
}

export interface EditorObject extends BaseEditorItem {
  type: 'object';
  meta: MetaObject;
  items: EditorItems;
}

export interface EditorTerrainChunk extends BaseEditorItem {
  type: 'terrain';
  meta: MetaBody;
  metaFixtureIndex: number;
  vertices: EditorVertex[];
}

export interface EditorSensor extends BaseEditorItem {
  meta: MetaBody;
  type: 'level_finish' | 'level_deathzone' | 'pickup_present';
}

export interface EditorSpawnPoint extends BaseEditorItem {
  meta: MetaBody;
}

export interface EditorImage extends BaseEditorItem {
  type: 'image';
  meta: MetaImage;
  depth: number;
}

export interface EditorVertex extends XY {
  id: string;
  index: number;
}

export type EditorItem = EditorObject | EditorTerrainChunk | EditorImage;

export class RubeMetaLoader {

  constructor(private scene: Phaser.Scene) { }

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
    for (const metaObject of metaObjects) {
      const fileName = metaObject.file.split('/').reverse()[0];
      const rubeFile: RubeFile = this.scene.cache.json.get(fileName);
      const scene = this.load(rubeFile);
      objects.push({
        type: 'object',
        id: pseudoRandomId(),
        meta: metaObject,
        items: scene,
        customProps: customPropsArrayToMap(metaObject.customProperties || []),
        position: rubeToXY(metaObject.position),
        angle: metaObject.angle || 0
      });
    }
    return objects;
  }

  private loadImages(rubeFile: RubeFile): EditorImage[] {
    const metaImages = rubeFile.metaworld?.metaimage || [];
    const images = metaImages.map(imageJson => this.loadImage(imageJson));
    return images;
  }

  private loadTerrainChunks(rubeFile: RubeFile): EditorTerrainChunk[] {
    const terrainBodies = rubeFile.metaworld?.metabody?.filter(b => b.customProperties?.some(prop => prop.name === 'surfaceType' && prop.string === 'snow')) || [];
    const terrainChunks: EditorTerrainChunk[] = [];
    for (const metaBody of terrainBodies) {
      if (!metaBody.fixture) continue;
      for (let i = 0; i < metaBody.fixture.length; i++) {
        if (!metaBody.fixture) throw new Error('No fixture found in the terrain body');
        const metaFixture = metaBody.fixture[i];
        if (metaFixture.shapes.length === 0) throw new Error('No shapes found in the fixture');
        if (metaFixture.shapes.length > 1) throw new Error('Multiple shapes found in the fixture');
        const metaFixtureShape = metaFixture.shapes[0];
        if (metaFixtureShape.type !== 'line' && metaFixtureShape.type !== 'loop') throw new Error('Only polygon shapes are supported for terrain chunks');

        terrainChunks.push({
          type: 'terrain',
          id: pseudoRandomId(),
          meta: metaBody,
          metaFixtureIndex: i,
          vertices: this.editorVertsFromSeparatedVerts(metaFixture.vertices),
          customProps: customPropsArrayToMap(metaFixture.customProperties || []),
          position: rubeToXY(metaBody.position),
          angle: metaBody.angle || 0
        });
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
      sensors.push({
        type: sensorType,
        id: pseudoRandomId(),
        meta: body,
        customProps: customPropsArrayToMap(sensorFixture.customProperties || []),
        position: rubeToXY(body.position),
        angle: body.angle || 0
      });
    }

    return sensors;
  }

  private loadImage(metaImage: MetaImage): EditorImage {
    return {
      type: 'image',
      id: pseudoRandomId(),
      meta: metaImage,
      customProps: customPropsArrayToMap(metaImage.customProperties || []),
      position: rubeToXY(metaImage.center),
      angle: metaImage.angle || 0,
      depth: metaImage.renderOrder || 0
    };
  }

  private editorVertsFromSeparatedVerts(vertices: RubeVectorArray): EditorVertex[] {
    const verts: EditorVertex[] = [];
    // In RUBE Editor the Y coordinates are upside down when compared to Phaser3
    for (let i = 0; i < vertices.x.length; i++) verts.push({
      x: vertices.x[i],
      y: -vertices.y[i],
      id: pseudoRandomId(),
      index: i
    });
    return verts;
  }
}

export class RubeMetaSerializer {
  constructor(private scene: Phaser.Scene) { }

  serialize(items: EditorItems): RubeFile {
    // Apart from the meta properties
    const {customPropertyDefs, metaworld}: RubeFile = this.scene.cache.json.get('level_new.rube');

    const rubeFile: RubeFile = {
      customPropertyDefs,
      metaworld: {
        ...metaworld,
        metaobject: items.objects.map(o => o.meta),
        metaimage: items.images.map(i => i.meta),
        metabody: items.terrainChunks.map(t => t.meta),
      },

    };
    return rubeFile;
  }

  // private serializeObject(meta: MetaObject, items: EditorItems): MetaObject {
  //   const fileName = meta.file.split('/').reverse()[0];
  //   const rubeFile: RubeFile = this.serialize(items);
  //   this.scene.cache.json.add(fileName, rubeFile);
  //   return meta;
  // }

  private customPropsMapToArray(customProps: RubeCustomPropsMap): RubeCustomProperty[] {
    return Object.entries(customProps).map(([key, value]) => {
      const propDef = customPropertyDefs[key];
      // Since we don't dynamically create custom properties, we know which keys are available
      if (!propDef) throw new Error(`No custom property definition found for key: ${key}`);

      // TODO get rid of type casting
      switch (propDef.type) {
      case 'int':
        return {name: key, int: value as number} as RubeCustomProperty;
      case 'float':
        return {name: key, float: value as number} as RubeCustomProperty;
      case 'string':
        return {name: key, string: value as string} as RubeCustomProperty;
      case 'color':
        return {name: key, color: value as string} as RubeCustomProperty;
      case 'bool':
        return {name: key, bool: value as boolean} as RubeCustomProperty;
      case 'vec2':
        return {name: key, vec2: value as RubeVector} as RubeCustomProperty;
      default:
        throw new Error(`Invalid custom property type: ${propDef.type}`);
      }
    });
  }
}

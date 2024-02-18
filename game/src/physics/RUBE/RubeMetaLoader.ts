import {XY} from '../../Terrain';
import {pseudoRandomId} from '../../helpers/pseudoRandomId';
import {MetaBody, MetaFixture, MetaImage, MetaObject, RubeFile} from './RubeFile';
import {RubeCustomProperty, RubeVector, RubeVectorArray} from './RubeFileExport';

export interface EditorItems {
  objects: EditorObject[];
  terrainChunks: EditorTerrainChunk[];
  images: EditorImage[];
}

interface BaseEditorItem {
  id: string;
  customProps: Record<string, unknown>;
  position: XY;
  angle: number;
}

export interface EditorObject extends BaseEditorItem {
  type: 'object';
  meta: MetaObject;
  items: EditorItems
}

export interface EditorTerrainChunk extends BaseEditorItem{
  type: 'terrain';
  meta: MetaFixture;
  vertices: EditorVertex[];
}

export interface EditorVolume extends BaseEditorItem {
  meta: MetaFixture;
  type: 'level_finish' | 'level_deathzone';
}

export interface EditorSpawnPoint extends BaseEditorItem {
  meta: MetaFixture;
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
    const metaObjects = rubeFile.metaworld?.metaobject || [];
    const objects = metaObjects.map(metaObject => this.loadObject(metaObject));

    const terrainBody = rubeFile.metaworld?.metabody?.filter(b => b.customProperties?.some(prop => prop.name === 'surfaceType' && prop.string === 'snow'));
    if (!terrainBody) throw new Error('No terrain body found in the RUBE file TEMP');
    const terrainFixtures = (terrainBody || []).flatMap(b => b.fixture!);
    const terrainChunks = terrainFixtures.map(metaFixture => this.loadTerrainChunks(metaFixture, terrainBody[0]));

    const metaImages = rubeFile.metaworld?.metaimage || [];
    const images = metaImages.map(imageJson => this.loadImage(imageJson));

    return {objects, terrainChunks, images};
  }

  private loadObject(metaObject: MetaObject): EditorObject {
    const fileName = metaObject.file.split('/').reverse()[0];
    const rubeFile: RubeFile = this.scene.cache.json.get(fileName);
    const scene = this.load(rubeFile);
    return {
      type: 'object',
      id: pseudoRandomId(),
      meta: metaObject,
      items: scene,
      customProps: this.customPropsArrayToMap(metaObject.customProperties || []),
      position: this.rubeToXY(metaObject.position),
      angle: metaObject.angle || 0
    };
  }

  private loadTerrainChunks(metaFixture: MetaFixture, metaBody: MetaBody): EditorTerrainChunk {
    // get the vertices from the fixture
    // create a terrain chunk with the vertices
    return {
      type: 'terrain',
      id: pseudoRandomId(),
      meta: metaFixture,
      vertices: this.editorVertsFromSeparatedVerts(metaFixture.vertices),
      customProps: this.customPropsArrayToMap(metaFixture.customProperties || []),
      position: this.rubeToXY(metaBody.position),
      angle: metaBody.angle || 0
    };
  }

  private loadImage(metaImage: MetaImage): EditorImage {
    return {
      type: 'image',
      id: pseudoRandomId(),
      meta: metaImage,
      customProps: this.customPropsArrayToMap(metaImage.customProperties || []),
      position: this.rubeToXY(metaImage.center),
      angle: metaImage.angle || 0,
      depth: metaImage.renderOrder || 0
    };
  }

  private customPropsArrayToMap(customProperties: RubeCustomProperty[]): Record<string, unknown> {
    return customProperties.reduce((obj, cur) => {
      if (cur.hasOwnProperty('int')) obj[cur.name] = cur.int;
      else if (cur.hasOwnProperty('float')) obj[cur.name] = cur.float;
      else if (cur.hasOwnProperty('string')) obj[cur.name] = cur.string;
      else if (cur.hasOwnProperty('color')) obj[cur.name] = cur.color;
      else if (cur.hasOwnProperty('bool')) obj[cur.name] = cur.bool;
      else if (cur.hasOwnProperty('vec2')) obj[cur.name] = cur.vec2;
      else throw new Error('invalid or missing custom property type');
      return obj;
    }, {});
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

  private rubeToXY(val?: RubeVector, offsetX = 0, offsetY = 0): XY {
    if (this.isXY(val)) return {x: val.x + offsetX, y: val.y + offsetY};
    // else if (val === 0) throw new Error('Ensure the option "Compact zero vectors" is disabled for the loaded rube scene.');
    else if (val === 0) return {x: 0, y: 0};
    return {x: 0, y: 0};
  }

  private isXY(val: unknown): val is Box2D.b2Vec2 {
    return Boolean(val && typeof val === 'object' && val.hasOwnProperty('x') && val.hasOwnProperty('y'));
  }
}

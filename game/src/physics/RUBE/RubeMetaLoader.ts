import {XY} from '../../Terrain';
import {pseudoRandomId} from '../../helpers/pseudoRandomId';
import {MetaFixture, MetaImage, MetaObject, RubeFile} from './RubeFile';
import {RubeCustomProperty, RubeVectorArray} from './RubeFileExport';

export interface EditorItems {
  objects: EditorObject[];
  terrainChunks: EditorTerrainChunk[];
  images: EditorImage[];
}

export interface EditorObject {
  id: string;
  meta: MetaObject;
  items: EditorItems
}

export interface EditorTerrainChunk {
  id: string;
  meta: MetaFixture;
  vertices: EditorVertex[];
}

export interface EditorVolume {
  id: string;
  meta: MetaFixture;
  type: 'level_finish' | 'level_deathzone'
}

export interface EditorSpawnPoint {
  id: string;
  meta: MetaFixture;
  point: XY;
}

export interface EditorImage {
  id: string;
  meta: MetaImage;
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
    const terrainFixtures = (terrainBody || []).flatMap(b => b.fixture!);
    const terrainChunks = terrainFixtures.map(metaFixture => this.loadTerrainChunks(metaFixture));

    const metaImages = rubeFile.metaworld?.metaimage || [];
    const images = metaImages.map(imageJson => this.loadImage(imageJson));

    return {objects, terrainChunks, images};
  }

  private loadObject(metaObject: MetaObject): EditorObject {
    const fileName = metaObject.file.split('/').reverse()[0];
    const rubeFile: RubeFile = this.scene.cache.json.get(fileName);
    const scene = this.load(rubeFile);
    return {
      id: pseudoRandomId(),
      meta: metaObject,
      items: scene
    };

  }

  private loadTerrainChunks(metaFixture: MetaFixture): EditorTerrainChunk {
    // get the vertices from the fixture
    // create a terrain chunk with the vertices
    return {
      id: pseudoRandomId(),
      meta: metaFixture,
      vertices: this.editorVertsFromSeparatedVerts(metaFixture.vertices)
    };
  }

  private loadImage(metaImage: MetaImage): EditorImage {
    return {
      id: pseudoRandomId(),
      meta: metaImage
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
}

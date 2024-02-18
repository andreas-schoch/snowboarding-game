import {XY} from '../../Terrain';
import {RubeVector} from '../../physics/RUBE/RubeFileExport';
import {EditorObject} from '../../physics/RUBE/RubeMetaLoader';
import {MetaImageRenderer} from './MetaImageRenderer';
import {MetaTerrain} from './MetaTerrainRenderer';

export class MetaObjectRenderer {
  private imageRenderer: MetaImageRenderer;
  private terrainRenderer: MetaTerrain;
  constructor(private scene: Phaser.Scene, private pixelsPerMeter: number) {
    this.imageRenderer = new MetaImageRenderer(scene, pixelsPerMeter);
    this.terrainRenderer = new MetaTerrain(scene, pixelsPerMeter);
  }

  render(objects: EditorObject[]) {
    for (const object of objects) {
      this.renderObject(object);
    }
  }

  private renderObject(object: EditorObject, offset: XY = {x: 0, y: 0}) {
    console.log('render object', object);
    const origin = this.rubeToXY(object.position);
    origin.x += offset.x;
    origin.y += offset.y;
    this.terrainRenderer.draw(object.items.terrainChunks, origin);
    this.imageRenderer.render(object.items.images, origin);
    for (const subObject of object.items.objects) {
      this.renderObject(subObject, origin);
    }
  }

  private rubeToXY(val?: RubeVector, offsetX = 0, offsetY = 0): XY {
    if (this.isXY(val)) return {x: val.x + offsetX, y: val.y + offsetY};
    else if (val === 0) throw new Error('Ensure the option "Compact zero vectors" is disabled for the loaded rube scene.');
    return {x: 0, y: 0};
  }

  private isXY(val: unknown): val is Box2D.b2Vec2 {
    return Boolean(val && typeof val === 'object' && val.hasOwnProperty('x') && val.hasOwnProperty('y'));
  }
}

import {XY} from '../../Terrain';
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
    const origin = object.getPosition();
    origin.x += offset.x;
    origin.y += offset.y;
    this.terrainRenderer.draw(object.items.terrainChunks, origin);
    this.imageRenderer.render(object.items.images, origin);
    for (const subObject of object.items.objects) {
      this.renderObject(subObject, origin);
    }
  }
}

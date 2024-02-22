import {EditorObject} from '../../physics/RUBE/RubeMetaLoader';
import {MetaImageRenderer} from './MetaImageRenderer';
import {MetaTerrainRenderer} from './MetaTerrainRenderer';

export class MetaObjectRenderer {
  private imageRenderer: MetaImageRenderer;
  private terrainRenderer: MetaTerrainRenderer;
  constructor(private scene: Phaser.Scene, private pixelsPerMeter: number) {
    this.imageRenderer = new MetaImageRenderer(scene, pixelsPerMeter);
    this.terrainRenderer = new MetaTerrainRenderer(scene, pixelsPerMeter);
  }

  render(objects: EditorObject[]) {
    for (const object of objects) {
      this.renderObject(object);
    }
  }

  private renderObject(object: EditorObject, offsetX = 0, offsetY = 0) {
    const position = object.getPosition();
    const x = position.x + offsetX;
    const y = position.y + offsetY;
    this.terrainRenderer.draw(object.items.terrainChunks, x, y);
    this.imageRenderer.render(object.items.images, x, y);
    for (const subObject of object.items.objects) {
      this.renderObject(subObject, x, y);
    }
  }
}

// TODO fix translation of objects. I think the negation of the Y axis causes it to flip flop and not move in the right direction

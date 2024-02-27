import {throttle} from '../../helpers/debounce';
import {EditorObject} from '../items/EditorObject';
import {MetaImageRenderer} from './MetaImageRenderer';
import {MetaTerrainRenderer} from './MetaTerrainRenderer';

export class MetaObjectRenderer {
  renderThrottled = throttle(this.render.bind(this), 100);
  private imageRenderer: MetaImageRenderer;
  private terrainRenderer: MetaTerrainRenderer;

  constructor(scene: Phaser.Scene, pixelsPerMeter: number) {
    this.imageRenderer = new MetaImageRenderer(scene, pixelsPerMeter);
    this.terrainRenderer = new MetaTerrainRenderer(scene, pixelsPerMeter);
  }

  render(objects: EditorObject[]) {
    for (const object of objects) {
      this.renderObject(object);
    }
  }

  private renderObject(object: EditorObject, offsetX = 0, offsetY = 0, offsetAngle = 0) {
    const position = object.getPosition();
    const x = position.x + offsetX;
    const y = position.y + offsetY;

    // the angle is in radians and clamped to 6.28 (2 * PI). I need to make sure it overflows  correctly. When 7.28, it should be 1.0
    const twoPI = 6.28;
    let angle = object.getAngle() + offsetAngle;
    if (angle > twoPI) angle -= twoPI;
    if (angle < 0) angle += twoPI;

    this.terrainRenderer.render(Object.values(object.items.terrain), x, y, angle);
    this.imageRenderer.render(Object.values(object.items.image), x, y, angle);
    for (const subObject of Object.values(object.items.object)) {
      this.renderObject(subObject, x, y, angle);
    }
  }
}

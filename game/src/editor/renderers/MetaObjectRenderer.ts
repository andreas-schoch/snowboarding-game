import {normalizeRadians} from '../../helpers/angle';
import {throttle} from '../../helpers/debounce';
import {EditorObject} from '../items/EditorObject';
import {MetaImageRenderer} from './MetaImageRenderer';
import {MetaTerrainRenderer} from './MetaTerrainRenderer';

export class MetaObjectRenderer {
  renderThrottled = throttle(this.render.bind(this), 100);
  private imageRenderer: MetaImageRenderer;
  private terrainRenderer: MetaTerrainRenderer;
  // private fixtureRenderer: MetaFixtureRenderer;

  constructor(scene: Phaser.Scene) {
    this.imageRenderer = new MetaImageRenderer(scene);
    this.terrainRenderer = new MetaTerrainRenderer(scene);
    // this.fixtureRenderer = new MetaFixtureRenderer(scene);

  }

  render(objects: EditorObject[]) {
    for (const object of objects) {
      this.renderObject(object);
    }
  }

  clear(object: EditorObject) {
    const images = Object.values(object.items.image);
    const terrainChunks = Object.values(object.items.terrain);

    for (const image of images) this.imageRenderer.clear(image.id);
    for (const chunk of terrainChunks) this.terrainRenderer.clear(chunk);
  }

  clearAll() {
    // this.fixtureRenderer.resetAll();
    this.terrainRenderer.clearAll();
    this.imageRenderer.clearAll();
  }

  private renderObject(object: EditorObject, offsetX = 0, offsetY = 0, offsetAngle = 0) {
    const position = object.getPosition();
    const x = position.x + offsetX;
    const y = position.y + offsetY;

    // the angle is in radians and clamped to 6.28 (2 * PI). I need to make sure it overflows  correctly. When 7.28, it should be 1.0
    const angle = normalizeRadians(object.getAngle() + offsetAngle); // TODO check if correct after change

    this.terrainRenderer.render(Object.values(object.items.terrain), x, y, angle);

    // this.fixtureRenderer.render(Object.values(object.items.fixture), x, y, angle);

    this.imageRenderer.render(Object.values(object.items.image), x, y, angle);
    for (const subObject of Object.values(object.items.object)) {
      this.renderObject(subObject, x, y, angle);
    }
  }
}

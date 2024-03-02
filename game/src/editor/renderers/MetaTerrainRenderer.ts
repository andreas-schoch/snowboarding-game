import {ppm} from '../..';
import {Settings} from '../../Settings';
import {throttle} from '../../helpers/debounce';
import {EditorTerrainChunk} from '../items/EditorTerrain';

export type XY = {x: number, y: number};

type TerrainChunkContext = {
  chunkId: string;
  terrain: Phaser.GameObjects.Graphics;
  gizmo: Phaser.GameObjects.Graphics;
  // bounds: Bounds
};

export class MetaTerrainRenderer {
  renderThrottled = throttle(this.render.bind(this), 100);
  private contextMap: Map<string, TerrainChunkContext> = new Map();

  constructor(private scene: Phaser.Scene) { }

  // TODO take offsetAngle into account
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render(chunks: EditorTerrainChunk[], offsetX = 0, offsetY = 0, offsetAngle = 0) {
    for (const chunk of chunks) {
      const context = this.getContext(chunk.id);

      const vertsPixelSpace = chunk.getVertices().map(vertex => ({x: (vertex.x + offsetX) * ppm, y: (vertex.y + offsetY) * ppm}));
      this.drawChunk(context, vertsPixelSpace);
      // const {bounds, gizmo} = context;
      // const x = (bounds.x + bounds.width / 2) * ppm;
      // const y = (bounds.y + bounds.height / 2) * ppm;
      // // const position = chunk.getPosition(); // Not sure if this is the cause of insane persistent fps drop when changing position via details panel like a mad man
      // gizmo.setPosition(x, y);
      // gizmo.fillCircle(0, 0, 10);

      // const width = bounds.width * ppm;
      // const height = bounds.height * ppm;
      // const graphics2 = this.scene.add.graphics().setDepth(100000);
      // graphics2.setPosition(bounds.x * ppm, bounds.y * ppm);
      // graphics2.fillStyle(0xff0000, 1);
      // graphics2.lineStyle(4, 0xff0000, 1);
      // graphics2.fillCircle(0, 0, 20);
      // graphics2.strokeRect(0, 0, width, height);
    }
  }

  private drawChunk(context: TerrainChunkContext, pointsWorld: XY[]): void {
    const minX = Math.min(...pointsWorld.map(point => point.x));
    const minY = Math.min(...pointsWorld.map(point => point.y));

    const graphics = context.terrain;
    graphics.clear();
    graphics.setPosition(minX, minY);
    const pointsLocal: XY[] = pointsWorld.map(point => ({x: point.x - minX, y: point.y - minY}));
    graphics.fillStyle(Settings.darkmodeEnabled() ? 0x030203 : 0xb3cef2, 1);
    graphics.fillPoints(pointsLocal, true, false);

    // The terrain within RUBE is represented as chunks of non-loopped edge fixtures
    // We remove these points as they are not part of the surface and therefore doesn't need contouring
    // These points merely control the fill so camera doesn't see holes
    const pointsLocalCopy = [...pointsLocal];
    pointsLocalCopy.shift();
    pointsLocalCopy.shift();
    pointsLocalCopy.shift();
    pointsLocalCopy.pop();
    pointsLocalCopy.pop();
    pointsLocalCopy.pop();
    graphics.lineStyle(2, 0x000000, 1);
    graphics.strokePoints(pointsLocalCopy, false, false);

    graphics.lineStyle(4, 0x00ff00, 1);
    graphics.strokePoints(pointsLocal, false, false);
  }

  getContext(chunkId: string): TerrainChunkContext {
    let context = this.contextMap.get(chunkId);
    if (!context) {
      // const bounds = chunk.getBounds();
      const terrain = this.scene.add.graphics().setDepth(100000);
      const gizmo = this.scene.add.graphics().setDepth(100000).fillStyle(0x00ff00, 1);
      context = {terrain, gizmo, chunkId: chunkId};
      this.contextMap.set(chunkId, context);
    }
    return context;
  }
}

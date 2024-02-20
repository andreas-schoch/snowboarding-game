import {Settings} from '../../Settings';
import {EditorTerrainChunk} from '../../physics/RUBE/RubeMetaLoader';

export type XY = {x: number, y: number};

export class MetaTerrain {

  constructor(private scene: Phaser.Scene, private pixelsPerMeter: number) { }

  draw(chunks: EditorTerrainChunk[], offset: XY = {x: 0, y: 0}) {
    for (const chunk of chunks) {
      const vertsPixelSpace = chunk.getVertices().map(vertex => ({x: (vertex.x + offset.x) * this.pixelsPerMeter, y: (vertex.y + offset.y) * this.pixelsPerMeter}));
      this.drawChunk(vertsPixelSpace);
    }
  }

  private drawChunk(pointsWorld: XY[]): void {
    const minX = Math.min(...pointsWorld.map(point => point.x));
    const minY = Math.min(...pointsWorld.map(point => point.y));
    const graphics = this.scene.add.graphics().setDepth(10);
    graphics.setPosition(minX, minY);
    const pointsLocal: XY[] = pointsWorld.map(point => ({x: point.x - minX, y: point.y - minY}));
    graphics.fillStyle(Settings.darkmodeEnabled() ? 0x030203 : 0xb3cef2, 1);
    graphics.fillPoints(pointsLocal, true, false);

    // 
    graphics.lineStyle(4, 0x00ff00, 1);
    graphics.strokePoints(pointsLocal, false, false);

    // The terrain within RUBE is represented as chunks of non-loopped edge fixtures
    // We remove these points as they are not part of the surface and therefore doesn't need contouring
    // These points merely control the fill so camera doesn't see holes
    pointsLocal.shift();
    pointsLocal.shift();
    pointsLocal.shift();
    pointsLocal.pop();
    pointsLocal.pop();
    pointsLocal.pop();
    graphics.lineStyle(2, 0x000000, 1);
    graphics.strokePoints(pointsLocal, false, false);
  }
}

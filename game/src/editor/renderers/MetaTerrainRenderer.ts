import {Settings} from '../../Settings';
import {EditorTerrainChunk} from '../../physics/RUBE/RubeMetaLoader';

export type XY = {x: number, y: number};

export class MetaTerrain {

  constructor(private scene: Phaser.Scene, private pixelsPerMeter: number) { }

  draw(chunks: EditorTerrainChunk[], offset: XY = {x: 0, y: 0}) {
    const ppm = this.pixelsPerMeter;
    for (const chunk of chunks) {
      const vertsPixelSpace = chunk.getVertices().map(vertex => ({x: (vertex.x + offset.x) * ppm, y: (vertex.y + offset.y) * ppm}));
      this.drawChunk(vertsPixelSpace);

      const position = chunk.getPosition();
      const graphics = this.scene.add.graphics().setDepth(100000);
      graphics.setPosition(position.x * ppm, position.y * ppm);
      graphics.fillStyle(0x00ff00, 1);
      graphics.fillCircle(0, 0, 10);

      // const bounds = chunk.getBounds();
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

  private drawChunk(pointsWorld: XY[]): void {
    const minX = Math.min(...pointsWorld.map(point => point.x));
    const minY = Math.min(...pointsWorld.map(point => point.y));
    const graphics = this.scene.add.graphics().setDepth(10);
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
}

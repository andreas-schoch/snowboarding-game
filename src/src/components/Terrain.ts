import { DARKMODE_ENABLED, b2, recordLeak } from '../index';
import GameScene from '../scenes/GameScene';


export type XY = { x: number, y: number };

export default class Terrain {

  constructor(private scene: GameScene) { }

  draw() {
    const terrainBodies = this.scene.b2Physics.loader.getBodiesByCustomProperty('surfaceType', 'snow');
    if (!terrainBodies.length) return; // There may be levels where no terrain is present
    const scale = this.scene.b2Physics.worldScale;

    for (const body of terrainBodies) {
      const bodyPos = body.GetPosition();
      // Using reifyArray() was problematic for the "control points" but maybe it could work. needs investigation
      let edgeShape = new b2.b2EdgeShape();
      for (let fixture = recordLeak(body.GetFixtureList()); b2.getPointer(fixture) !== b2.getPointer(b2.NULL); fixture = recordLeak(fixture.GetNext())) {
        const shape = b2.castObject(fixture.GetShape(), b2.b2ChainShape);
        const chunkPoints: XY[] = [];
        for (let i = 0; i < shape.get_m_count() - 1; i++) {
          shape.GetChildEdge(edgeShape, i);
          const vert1 = { x: (edgeShape.m_vertex1.x + bodyPos.x) * scale, y: -(edgeShape.m_vertex1.y + bodyPos.y) * scale };
          const vert2 = { x: (edgeShape.m_vertex2.x + bodyPos.x) * scale, y: -(edgeShape.m_vertex2.y + bodyPos.y) * scale };
          chunkPoints.push(vert1, vert2);
        }
        this.drawChunk(chunkPoints);
      }
    }
  }

  private drawChunk(pointsWorld: XY[]): void {
    const minX = Math.min(...pointsWorld.map(point => point.x));
    const minY = Math.min(...pointsWorld.map(point => point.y));
    const graphics = this.scene.add.graphics().setDepth(10);
    graphics.setPosition(minX, minY)
    const pointsLocal: XY[] = pointsWorld.map(point => ({ x: point.x - minX, y: point.y - minY }));
    graphics.fillStyle(DARKMODE_ENABLED ? 0x030203 : 0xb3cef2, 1);
    graphics.fillPoints(pointsLocal, true, false);
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
    // if (DARKMODE_ENABLED) graphics.setPipeline('Light2D');
  }
}

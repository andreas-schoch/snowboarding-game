import { Physics } from './Physics';
import GameScene from '../scenes/GameScene';
import { b2 } from '../index';


export type XY = { x: number, y: number };

export default class Terrain {
  private readonly b2Physics: Physics;
  private readonly scene: GameScene;

  constructor(scene: GameScene, physics: Physics) {
    this.scene = scene;
    this.b2Physics = physics;

    const terrainBodies = this.b2Physics.loader.getBodiesByCustomProperty('string', 'surfaceType', 'snow');
    if (!terrainBodies.length) return; // There may be levels where no terrain is present
    const scale = this.b2Physics.worldScale;

    for (const body of terrainBodies) {
      const bodyPos = body.GetPosition();
      let edgeShape = new b2.b2EdgeShape();
      for (let fix = body.GetFixtureList(); b2.getPointer(fix) !== b2.getPointer(b2.NULL); fix = fix.GetNext()) {
        const shape = b2.castObject(fix.GetShape(), b2.b2ChainShape);
        const chunkPoints: XY[] = [];
        for (let i = 0; i < shape.get_m_count() - 1; i++) {
          shape.GetChildEdge(edgeShape, i);
          const vert1 = { x: (edgeShape.m_vertex1.x + bodyPos.x) * scale, y: -(edgeShape.m_vertex1.y + bodyPos.y) * scale };
          const vert2 = { x: (edgeShape.m_vertex2.x + bodyPos.x) * scale, y: -(edgeShape.m_vertex2.y + bodyPos.y) * scale };
          chunkPoints.push(vert1, vert2);
        }
        this.drawTerrain(chunkPoints);
      }
      b2.destroy(edgeShape);
    }
  }

  private drawTerrain(pointsWorld: XY[]): void {
    const minX = Math.min(...pointsWorld.map(point => point.x));
    const minY = Math.min(...pointsWorld.map(point => point.y));
    const graphics = this.scene.add.graphics().setDepth(10);
    graphics.setPosition(minX, minY)
    // TODO don't use b2Vec2 for non-box2d stuff!!
    const pointsLocal = pointsWorld.map(point => new b2.b2Vec2(point.x - minX, point.y - minY));
    graphics.fillStyle(0xb3cef2, 1);
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
  }
}

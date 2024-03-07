import {PersistedStore} from './PersistedStore';
import {LoadedScene} from './physics/RUBE/EntityTypes';
import {b2, ppm} from './index';

export type XY = {x: number, y: number};

export class Terrain {

  constructor(private scene: Phaser.Scene, private rubeScene: LoadedScene) { }

  draw() {

    for (const body of this.rubeScene.bodies) {
      if (!body.fixtures) continue;
      for (const fixture of body.fixtures) {
        const surfaceType = fixture.customProps['surfaceType'];
        if (!surfaceType) continue;
        if (surfaceType !== 'snow') throw new Error('Only snow terrain is expected as terrain surfaceType for now');

        const bodyPos = body.body.GetPosition();
        // Using reifyArray() was problematic for the "control points" but maybe it could work. needs investigation
        const edgeShape = new b2.b2EdgeShape();
        const shape = b2.castObject(fixture.fixture.GetShape(), b2.b2ChainShape);
        const chunkPoints: XY[] = [];
        for (let i = 0; i < shape.get_m_count() - 1; i++) {
          shape.GetChildEdge(edgeShape, i);
          const vert1 = {x: (edgeShape.m_vertex1.x + bodyPos.x) * ppm, y: -(edgeShape.m_vertex1.y + bodyPos.y) * ppm};
          const vert2 = {x: (edgeShape.m_vertex2.x + bodyPos.x) * ppm, y: -(edgeShape.m_vertex2.y + bodyPos.y) * ppm};
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
    graphics.setPosition(minX, minY);
    const pointsLocal: XY[] = pointsWorld.map(point => ({x: point.x - minX, y: point.y - minY}));
    graphics.fillStyle(PersistedStore.darkmodeEnabled() ? 0x030203 : 0xb3cef2, 1);
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

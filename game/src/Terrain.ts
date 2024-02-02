import {Settings} from './Settings';
import {iterBodyFixtures} from './helpers/B2Iterators';
import {LoadedScene} from './physics/RUBE/otherTypes';
import {b2} from './index';

export type XY = {x: number, y: number};

export class Terrain {

  constructor(private scene: Phaser.Scene, private rubeScene: LoadedScene) { }

  draw() {
    const {worldEntity: {pixelsPerMeter}} = this.rubeScene;
    const terrainBodyEntities = this.rubeScene.bodies.filter(body => body.customProps.surfaceType === 'snow');
    if (!terrainBodyEntities.length) return; // There may be levels where no terrain is present

    for (const {body} of terrainBodyEntities) {
      const bodyPos = body.GetPosition();
      // Using reifyArray() was problematic for the "control points" but maybe it could work. needs investigation
      const edgeShape = new b2.b2EdgeShape();
      for (const fixture of iterBodyFixtures(body)) {
        const shape = b2.castObject(fixture.GetShape(), b2.b2ChainShape);
        const chunkPoints: XY[] = [];
        for (let i = 0; i < shape.get_m_count() - 1; i++) {
          shape.GetChildEdge(edgeShape, i);
          const vert1 = {x: (edgeShape.m_vertex1.x + bodyPos.x) * pixelsPerMeter, y: -(edgeShape.m_vertex1.y + bodyPos.y) * pixelsPerMeter};
          const vert2 = {x: (edgeShape.m_vertex2.x + bodyPos.x) * pixelsPerMeter, y: -(edgeShape.m_vertex2.y + bodyPos.y) * pixelsPerMeter};
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
    graphics.fillStyle(Settings.darkmodeEnabled() ? 0x030203 : 0xb3cef2, 1);
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

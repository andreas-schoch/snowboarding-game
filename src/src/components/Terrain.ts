import * as Ph from 'phaser';
import { Physics } from './Physics';
import GameScene from '../scenes/GameScene';
import { DEFAULT_ZOOM, b2 } from '../index';
import { vec2Util } from '../util/RUBE/Vec2Math';

export default class Terrain {
  private readonly terrainBody: Box2D.b2Body;
  private readonly chunks: ITerrainChunk[] = [];

  private readonly b2Physics: Physics;
  private readonly scene: GameScene;
  private readonly zoomModifier = 1 / DEFAULT_ZOOM;
  private readonly layers = [
    { color: 0xC8E1EB, width: 5 * this.zoomModifier }, // top layer of snow
    { color: 0x7ca3d3, width: 20 * this.zoomModifier },
    // {color: 0x7ca3d3 - 0x444444, width: 12 * this.zoomModifier},
    { color: 0xb3cef2 - 0x666666, width: 10 * this.zoomModifier },
    { color: 0xb3cef2 - 0x222222, width: 5 * this.zoomModifier },
    { color: 0xb3cef2, width: 250 * this.zoomModifier },
  ];

  constructor(scene: GameScene, physics: Physics) {
    this.scene = scene;
    this.b2Physics = physics;

    const def = new b2.b2BodyDef();
    this.terrainBody = this.b2Physics.world.CreateBody(def);
    const pos = this.terrainBody.GetPosition();

    const p = this.b2Physics.rubeLoader.getBodiesByCustomProperty('bool', 'phaserTerrain', true)[0];
    if (!p) return; // There may be levels where no terrain is present

    const fix = p.GetFixtureList();
    const shape = b2.castObject(fix.GetShape(), b2.b2ChainShape);
    const vertices: Box2D.b2Vec2[] = [];
    for (let i = 0; i < shape.get_m_count(); ++i) {
      let edgeShape = new b2.b2EdgeShape();
      shape.GetChildEdge(edgeShape, i);
      vertices.push(vec2Util.Clone(edgeShape.m_vertex1), vec2Util.Clone(edgeShape.m_vertex2));
      b2.destroy(edgeShape);
    }

    let startX: number = 0;
    const CHUNK_WIDTH_METERS = 50 * this.b2Physics.worldScale;
    const chunks: Box2D.b2Vec2[][] = [];
    let chunk: Box2D.b2Vec2[] = [];
    for (const [i, vert] of [...vertices].reverse().entries()) {
      const vertPixelScale = new b2.b2Vec2((vert.x - pos.x) * this.b2Physics.worldScale, -(vert.y + pos.y) * this.b2Physics.worldScale);
      chunk.push(vertPixelScale);
      if (i === 0) startX = vertPixelScale.x;
      // When last chunk isn't wide enough, simply make it part of the previous
      else if (i === vertices.length - 1 && chunk.length && chunks.length && vertPixelScale.x - chunk[0].x < CHUNK_WIDTH_METERS) chunks[chunks.length - 1].push(...chunk);
      if (vertPixelScale.x - startX >= CHUNK_WIDTH_METERS) {
        // start a new chunk which both share the same vert as their respective starting or ending point
        chunks.push(chunk);
        chunk = [vertPixelScale];
        startX = vertPixelScale.x;
      }
    }
    chunks.forEach((chunkPoints, i) => this.drawTerrain(chunkPoints, i));
  }

  update() {
    // const {zoom, width, worldView} = this.scene.cameras.main;
    // while (this.slopeStart.x < worldView.x + width + 500 * (1 / zoom)) {
    //
    // }
  }

  private drawTerrain(points: Box2D.b2Vec2[], chunkIndex: number): void {
    const lastIndex = points.length - 1;
    const chunk: ITerrainChunk = {
      graphics: this.scene.add.graphics().setDepth(10),
      index: chunkIndex,
      vertices: points,
      firstVert: points[0],
      lastVert: points[lastIndex],
    };
    this.chunks.push(chunk);
    const end = Math.max(...chunk.vertices.map(p => p.y)) + this.scene.cameras.main.height * 2;
    let offset = 0;
    points.push(new b2.b2Vec2(chunk.lastVert.x, end));
    points.push(new b2.b2Vec2(chunk.firstVert.x, end));
    for (const { color, width } of this.layers) {
      chunk.graphics.translateCanvas(0, offset);
      chunk.graphics.fillStyle(color);
      chunk.graphics.fillPoints(points, true, true);
      chunk.graphics.translateCanvas(0, 0);
      offset = width * 0.5;
    }
  }
}


interface ITerrainChunk {
  index: number;
  graphics: Ph.GameObjects.Graphics;
  vertices: Box2D.b2Vec2[];
  firstVert: Box2D.b2Vec2;
  lastVert: Box2D.b2Vec2;
}

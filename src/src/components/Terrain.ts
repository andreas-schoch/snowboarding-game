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
    { color: 0x000000, width: 7 * this.zoomModifier },
    { color: 0xb3cef2 - 0x222222, width: 10 * this.zoomModifier },
    { color: 0xb3cef2, width: 20 * this.zoomModifier },
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
    for (let i = 0; i < shape.get_m_count() - 1; i++) {
      let edgeShape = new b2.b2EdgeShape();
      shape.GetChildEdge(edgeShape, i);
      vertices.push(vec2Util.Clone(edgeShape.m_vertex1), vec2Util.Clone(edgeShape.m_vertex2));
      b2.destroy(edgeShape);
    }

    let startX: number = 0;
    const CHUNK_WIDTH_METERS = 50 * this.b2Physics.worldScale;
    const chunks: Box2D.b2Vec2[][] = [];
    let chunk: Box2D.b2Vec2[] = [];
    for (const [i, vert] of vertices.reverse().entries()) {
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
    chunks.forEach((chunkPoints, i) => this.drawTerrain(chunkPoints));
  }

  private drawTerrain(pointsWorld: Box2D.b2Vec2[]): void {
    const minX = Math.min(...pointsWorld.map(point => point.x));
    const maxX = Math.max(...pointsWorld.map(point => point.x));
    const minY = Math.min(...pointsWorld.map(point => point.y));
    const maxY = Math.max(...pointsWorld.map(point => point.y));
    const width = maxX - minX;
    const height = maxY - minY;
    const graphics = this.scene.add.graphics().setDepth(10);
    graphics.setPosition(minX, minY);

    const pointsLocal = pointsWorld.map(point => new b2.b2Vec2(point.x - minX, point.y - minY));

    let lowestHeight = pointsLocal[0].y;
    for (const { y } of pointsLocal) if (y > lowestHeight) lowestHeight = y;
    pointsLocal.push(new b2.b2Vec2(pointsLocal[pointsLocal.length - 1].x, lowestHeight + this.scene.cameras.main.height * 2));
    pointsLocal.push(new b2.b2Vec2(pointsLocal[0].x, lowestHeight + this.scene.cameras.main.height * 2));
    let offset = 0;
    for (const { color, width } of this.layers) {
      graphics.translateCanvas(0, offset);
      graphics.fillStyle(color, 1);
      graphics.fillPoints(pointsLocal, true, false);
      graphics.translateCanvas(0, -offset);
      offset += width / 2;
    }
    // graphics.lineStyle(10, 0x0000ff, 1);
    // graphics.strokeRect(0, 0, width, height);
    // this.downloadTerrainImage(graphics, pointsWorld);
  }

  private downloadTerrainImage(graphics: Ph.GameObjects.Graphics, points: Box2D.b2Vec2[]): void {
    const minX = Math.min(...points.map(point => point.x));
    const maxX = Math.max(...points.map(point => point.x));
    const minY = Math.min(...points.map(point => point.y));
    const maxY = Math.max(...points.map(point => point.y));
    const width = maxX - minX;
    const height = maxY - minY;

    // Generate a texture from the Graphics object
    const textureKey = `terrainChunk`;
    graphics.generateTexture(textureKey, width, height);

    // Get the texture as a base64 encoded URL
    const texture = this.scene.textures.get(textureKey);
    const canvas = texture.getSourceImage() as HTMLCanvasElement;
    const base64URL = canvas.toDataURL();

    // Create a link element and use it to download the texture
    const link = document.createElement('a');
    link.href = base64URL;
    link.download = `${textureKey}.png`;
    link.click();
  }
}


interface ITerrainChunk {
  index: number;
  graphics: Ph.GameObjects.Graphics;
  vertices: Box2D.b2Vec2[];
  firstVert: Box2D.b2Vec2;
  lastVert: Box2D.b2Vec2;
}

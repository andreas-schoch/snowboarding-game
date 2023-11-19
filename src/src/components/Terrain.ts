import * as Ph from 'phaser';
import * as Pl from '@box2d/core';
import {Physics} from './Physics';
import GameScene from '../scenes/GameScene';
import {DEFAULT_ZOOM} from '../index';

export default class Terrain {
  private readonly terrainBody: Pl.b2Body;
  private readonly chunks: ITerrainChunk[] = [];

  private readonly b2Physics: Physics;
  private readonly scene: GameScene;
  private readonly zoomModifier = 1 / DEFAULT_ZOOM;
  private readonly layers = [
    {color: 0xC8E1EB, width: 4 * this.zoomModifier}, // top layer of snow
    {color: 0x5c8dc9, width: 15 * this.zoomModifier},
    {color: 0xC8E1EB, width: 4 * this.zoomModifier},
    {color: 0xffffff, width: 250 * this.zoomModifier},
  ];

  constructor(scene: GameScene, physics: Physics) {
    this.scene = scene;
    this.b2Physics = physics;

    this.terrainBody = this.b2Physics.world.CreateBody();
    const pos = this.terrainBody.GetPosition();

    const p = this.b2Physics.rubeLoader.getBodiesByCustomProperty('bool', 'phaserTerrain', true)[0];
    if (!p) return; // There may be levels where no terrain is present

    const fix = p.GetFixtureList()?.GetShape() as Pl.b2ChainShape;

    // this.drawTerrain(fix.m_vertices.map(v => ({x: (v.x + pos.x) * this.b2Physics.worldScale, y: -(v.y + pos.y) * this.b2Physics.worldScale})), 0);

    let startX: number = 0;
    const CHUNK_WIDTH_METERS = 50 * this.b2Physics.worldScale;
    const chunks: Pl.XY[][] = [];
    let chunk: Pl.XY[] = [];
    for (const [i, vert] of [...fix.m_vertices].reverse().entries()) {
      const vertPixelScale = {x: (vert.x - pos.x) * this.b2Physics.worldScale, y: -(vert.y + pos.y) * this.b2Physics.worldScale};
      chunk.push(vertPixelScale);
      if (i === 0) startX = vertPixelScale.x;
      // When last chunk isn't wide enough, simply make it part of the previous
      else if (i === fix.m_vertices.length - 1 && chunk.length && chunks.length && vertPixelScale.x - chunk[0].x < CHUNK_WIDTH_METERS) chunks[chunks.length - 1].push(...chunk);
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

  private drawTerrain(points: Pl.XY[], chunkIndex: number): void {
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
    points.push({x: chunk.lastVert.x, y: end}, {x: chunk.firstVert.x, y: end});
    for (const {color, width} of this.layers) {
      chunk.graphics.translateCanvas(0, offset);
      chunk.graphics.fillStyle(color);
      chunk.graphics.fillPoints(points, true, true);
      chunk.graphics.translateCanvas(0, 0);
      offset = width * 0.5;
    }

    // const lowestY = Math.min(...points.map(p => p.y));
    // const largestY = points[points.length - 1].y;
    // points.length -= 2;
    // console.log('---------texture width', points[points.length - 1].x - points[0].x, largestY - lowestY);
    // chunk.generateTexture(`terrain_chunk_${chunkIndex}`, 7000, largestY - lowestY + 2000);
    // //
    // const img = this.scene.add.image(0, this.scene.cameras.main.height, `terrain_chunk_${chunkIndex}`);
    // console.log(img)
    // setTimeout(() => img.setVisible(true));
    // chunk.clear();
  }
}


interface ITerrainChunk {
  index: number;
  graphics: Ph.GameObjects.Graphics;
  vertices: Pl.XY[];
  firstVert: Pl.XY;
  lastVert: Pl.XY;
}

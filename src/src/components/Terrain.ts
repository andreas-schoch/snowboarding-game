import * as Ph from 'phaser';
import * as Pl from '@box2d/core';
import {Physics} from './Physics';
import GameScene from '../scenes/GameScene';
import {DEFAULT_ZOOM} from '../index';

export default class Terrain {
  private readonly terrainBody: Pl.b2Body;
  private readonly chunks: Ph.GameObjects.Graphics[];

  private readonly b2Physics: Physics;
  private readonly scene: GameScene;
  private readonly zoomModifier = 1 / DEFAULT_ZOOM;
  private readonly layers = [
    {color: 0xC8E1EB, width: 5 * this.zoomModifier}, // top layer of snow
    {color: 0x5c8dc9, width: 22 * this.zoomModifier},
    {color: 0x223B7B, width: 10 * this.zoomModifier},
    {color: 0x2d2c2c, width: 5 * this.zoomModifier},
    {color: 0x3a3232, width: 250 * this.zoomModifier},
  ];

  private readonly pointsPool: Pl.XY[] = [];
  private readonly vec2Pool: Pl.b2Vec2[] = [];

  constructor(scene: GameScene, physics: Physics) {
    this.scene = scene;
    this.b2Physics = physics;

    const poolSize = 2500;
    for (let i = 0; i < poolSize; i++) this.pointsPool.push({x: 0, y: 0});
    for (let i = 0; i < poolSize; i++) this.vec2Pool.push(new Pl.b2Vec2(0, 0));

    this.chunks = [
      this.scene.add.graphics().setDepth(10),
      this.scene.add.graphics().setDepth(10),
      this.scene.add.graphics().setDepth(10),
      this.scene.add.graphics().setDepth(10),
      this.scene.add.graphics().setDepth(10),
      this.scene.add.graphics().setDepth(10),
      this.scene.add.graphics().setDepth(10),
      this.scene.add.graphics().setDepth(10),
    ];

    this.terrainBody = this.b2Physics.world.CreateBody();
    const pos = this.terrainBody.GetPosition();

    const p = this.b2Physics.rubeLoader.getBodiesByCustomProperty('bool', 'phaserTerrain', true)[0];
    const fix = p.GetFixtureList()?.GetShape() as Pl.b2ChainShape;
    this.drawTerrain(fix.m_vertices.map(v => ({x: (v.x + pos.x) * this.b2Physics.worldScale, y: -(v.y + pos.y) * this.b2Physics.worldScale})));
  }

  private drawTerrain(points: Pl.XY[]): void {
    const chunk = this.chunks.shift();
    if (!chunk) return;
    this.chunks.push(chunk);
    chunk.clear();

    const lastIndex = points.length - 1;
    const end = Math.max(points[0].y, points[lastIndex].y) + this.scene.cameras.main.height * 2;
    let offset = 0;
    points.push({x: points[lastIndex].x, y: end}, {x: points[0].x, y: end});
    for (const {color, width} of this.layers) {
      chunk.translateCanvas(0, offset);
      chunk.fillStyle(color);
      chunk.fillPoints(points, true, true);
      chunk.translateCanvas(0, 0);
      offset = width * 0.5;
    }

    points.length -= 2;
  }
}

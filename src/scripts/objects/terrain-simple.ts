import * as Ph from 'phaser';
import * as Pl from '@box2d/core';
import {Physics} from './physics';
import {stats} from '../index';

// TODO experiment with Phaser splines https://phaser.io/examples/v3/view/paths/curves/drag-spline-curve
//  Might be a good solution to support a simple level editor
export interface ITerrainSimpleConfig {
  // starting terrain height, in % of game height
  startTerrainHeight: number;
  // The higher the value, the higher the hills
  slopeAmplitude: number;
  // slope length range, in pixels
  slopeLengthRange: [number, number];
  // horizontal distance between each terrain point
  gridDensity: number;
  // visual representation of the terrain
  layers: { color: number, width: number }[];
}


// TODO write loader for physics editor json export instead of hardcoding it
const rock01Points = [
  {x: 2, y: 82},
  {x: 7, y: 14},
  {x: 20, y: 6},
  {x: 41, y: 2},
  {x: 89, y: 11},
  {x: 137, y: 52},
  {x: 147, y: 82},
];

const defaultConfig: ITerrainSimpleConfig = {
  startTerrainHeight: 0.5,
  slopeAmplitude: 200,
  slopeLengthRange: [375, 750],
  gridDensity: 64,
  layers: [
    {color: 0xC8E1EB, width: 5}, // top layer of snow
    {color: 0x5c8dc9, width: 22},
    {color: 0x223B7B, width: 10},
    {color: 0x2d2c2c, width: 5},
    {color: 0x3a3232, width: 250},
  ],
};

// Loosely based on: https://www.emanueleferonato.com/2020/10/16/build-a-html5-game-like-risky-road-using-phaser-step-5-drawing-a-better-terrain/
export default class TerrainSimple {
  private readonly terrainBody: Pl.b2Body;
  private slopeStart: Pl.XY;
  private slopeEnd: Pl.XY;
  private readonly chunks: Ph.GameObjects.Graphics[];

  private readonly b2Physics: Physics;
  private readonly scene: Ph.Scene;
  private readonly config: ITerrainSimpleConfig;

  private readonly pointsPool: Pl.XY[];
  private readonly vec2Pool: Pl.b2Vec2[];
  private readonly obstacleImagePool: Ph.GameObjects.Image[];
  private yOffset = 0;
  private lastRockSpawnX = 0;

  constructor(scene: Ph.Scene, physics: Physics, config: ITerrainSimpleConfig = defaultConfig) {
    this.scene = scene;
    this.b2Physics = physics;
    this.config = config;

    // pre-allocating points to be re-used throughout the game lifecycle. Hopefully reduces garbage collection induced lag spikes
    const maxSlopePoints = Math.floor(config.slopeLengthRange[1] * 1.5);
    this.pointsPool = [];
    for (let i = 0; i < maxSlopePoints; i++) this.pointsPool.push({x: 0, y: 0});
    this.vec2Pool = [];
    for (let i = 0; i < maxSlopePoints; i++) this.vec2Pool.push(new Pl.b2Vec2(0, 0));

    this.chunks = [
      this.scene.add.graphics(),
      this.scene.add.graphics(),
      this.scene.add.graphics(),
      this.scene.add.graphics(),
      this.scene.add.graphics(),
      this.scene.add.graphics(),
      this.scene.add.graphics(),
      this.scene.add.graphics(),
    ];

    this.obstacleImagePool = [
      this.scene.add.image(-1000, 0, 'rock-01'),
      this.scene.add.image(-1000, 0, 'rock-01'),
      this.scene.add.image(-1000, 0, 'rock-01'),
      this.scene.add.image(-1000, 0, 'rock-01'),
      this.scene.add.image(-1000, 0, 'rock-01'),
      this.scene.add.image(-1000, 0, 'rock-01'),
      this.scene.add.image(-1000, 0, 'rock-01'),
      this.scene.add.image(-1000, 0, 'rock-01'),
    ];

    this.terrainBody = this.b2Physics.world.CreateBody();
    this.slopeStart = new Phaser.Math.Vector2(0, 0);
    this.update();
  }

  update() {
    stats.begin('terrain');
    const {zoom, width, worldView} = this.scene.cameras.main;
    while (this.slopeStart.x < worldView.x + width + 500 * (1 / zoom)) {
      // this.scene.cameras.main.cull()
      this.cleanupFixtures();
      this.updateChunk();
    }
    stats.end('terrain');
  }

  private updateChunk(): void {
    const [slopePoints, chainPoints] = this.generatePoints();

    this.createTerrainColliders(chainPoints);

    this.drawTerrain(slopePoints);
    this.drawDecoration(slopePoints);
    this.drawObstacles(slopePoints);
  }

  private createTerrainColliders(chainPoints: Pl.XY[], type: 'surface' | 'obstacle' = 'surface'): Pl.b2Fixture {
    // TODO move to Physics class. Can be used for all chain chapes
    const chain = new Pl.b2ChainShape();

    type === 'surface'
      ? chain.CreateChain(chainPoints, chainPoints.length, chainPoints[0], chainPoints[chainPoints.length - 1])
      : chain.CreateLoop(chainPoints, chainPoints.length);
    const fd: Pl.b2FixtureDef = {shape: chain, density: 0, friction: 0};
    return this.terrainBody.CreateFixture(fd);
  }

  private drawTerrain(slopePoints: Pl.XY[]): void {
    const chunk = this.chunks.shift();
    if (!chunk) return;
    this.chunks.push(chunk);
    chunk.clear();

    const lastIndex = slopePoints.length - 1;
    const end = Math.max(slopePoints[0].y, slopePoints[lastIndex].y) + this.scene.cameras.main.height * 2;
    let offset = 0;
    slopePoints.push({x: slopePoints[lastIndex].x, y: end}, {x: slopePoints[0].x, y: end});
    for (const {color, width} of this.config.layers) {
      chunk.translateCanvas(0, offset);
      chunk.fillStyle(color);
      chunk.fillPoints(slopePoints, true, true);
      chunk.translateCanvas(0, 0);
      offset = width;
    }

    slopePoints.length -= 2;
  }

  private drawDecoration(slopePoints: Pl.XY[]): void {
    // TODO
    //  - Experiment with adding different type of decorations: trees, bushes
  }

  private drawObstacles(slopePoints: Pl.XY[]): void {
    const pointStart = slopePoints[0];
    const pointEnd = slopePoints[slopePoints.length - 1];

    const travelDistance = this.scene.cameras.main.scrollX / (this.b2Physics.worldScale * 2);
    const minDistanceFromLast = travelDistance < 750 ? 2500 : 1500;
    const minMaxLengthRange = travelDistance < 3000 ? 0.7 : 0.4;

    const length = pointEnd.x - pointStart.x;
    const heightDifference = Math.abs(pointStart.y - pointEnd.y);
    const distanceFromLast = pointEnd.x - this.lastRockSpawnX;
    if (heightDifference <= 50 && length >= this.config.slopeLengthRange[1] * minMaxLengthRange && Math.random() < 0.7 && distanceFromLast > minDistanceFromLast) {
      this.lastRockSpawnX = pointEnd.x;
      const img = this.obstacleImagePool.shift();
      img?.setPosition(pointEnd.x, pointEnd.y + 35);
      const fixture = this.createTerrainColliders(
        rock01Points.map(p => ({x: (p.x - 75 + pointEnd.x) / this.b2Physics.worldScale, y: (p.y - 40 + pointEnd.y) / this.b2Physics.worldScale})),
        'obstacle',
      );

      fixture.SetUserData(img);
    }
  }

  private generatePoints(): [Pl.XY[], Pl.b2Vec2[]] {
    this.slopeEnd = this.getNextSlopeEnd();
    const slopePoints: { x: number, y: number }[] = [];
    const chainPoints: Pl.b2Vec2[] = [];
    const worldScale = this.b2Physics.worldScale;

    let pointX = this.slopeStart.x;
    let i = 0;
    const {startTerrainHeight, slopeAmplitude} = this.config;
    const base = this.scene.cameras.main.height * startTerrainHeight;
    const slopeLength = this.slopeEnd.x - this.slopeStart.x;
    const slopeStartX = this.slopeStart.x;
    const slopeStartY = this.slopeStart.y;
    const slopeEndY = this.slopeEnd.y;
    let point: { x: number, y: number };
    let chainPoint: Pl.b2Vec2;
    while (pointX <= this.slopeEnd.x) {
      let interpolationVal = this.interpolate(slopeStartY, slopeEndY, (pointX - slopeStartX) / slopeLength);
      let pointY = base + interpolationVal * slopeAmplitude;

      point = this.pointsPool[i];
      point.x = pointX;
      point.y = pointY;
      slopePoints.push(point);

      chainPoint = this.vec2Pool[i];
      chainPoint.x = point.x / worldScale;
      chainPoint.y = point.y / worldScale;
      chainPoints.push(chainPoint);

      pointX += this.config.gridDensity;
      i++;
    }
    // prepare for next slope
    this.slopeStart.x = this.slopeEnd.x;
    this.slopeStart.y = this.slopeEnd.y;
    return [slopePoints, chainPoints];
  }

  private getNextSlopeEnd(): Pl.XY {
    const {gridDensity, slopeLengthRange} = this.config;
    let slopeLength = Phaser.Math.Between(slopeLengthRange[0], slopeLengthRange[1]);
    slopeLength = Math.round(slopeLength / gridDensity) * gridDensity; // round to next grid value

    this.yOffset += slopeLength > this.config.slopeLengthRange[1] * 0.8 ? 0.3 : 0.05;
    const amplitudeModifier = slopeLength <= this.config.slopeLengthRange[1] / 2 ? 0.75 : 0.75;
    return (this.slopeStart.x === 0)
      ? {x: Math.round(defaultConfig.slopeLengthRange[1] * 1.5 / gridDensity) * gridDensity, y: 0}
      : {x: this.slopeStart.x + slopeLength, y: (Math.random() * amplitudeModifier) + this.yOffset};
  }

  private interpolate(vFrom, vTo, delta): number {
    let interpolation = (1 - Math.cos(delta * Math.PI)) * 0.5;
    return vFrom * (1 - interpolation) + vTo * interpolation;
  }

  private cleanupFixtures() {
    const worldScale = this.b2Physics.worldScale;
    const outOfBoundsX = this.scene.cameras.main.scrollX - (500 * (1 / this.scene.cameras.main.zoom));

    for (let fixture = this.terrainBody.GetFixtureList(); fixture; fixture = fixture.GetNext()) {
      const shape = fixture.GetShape();
      if (this.b2Physics.isChain(shape) && shape.m_vertices[shape.m_vertices.length - 1].x * worldScale < outOfBoundsX) {
        const obstacleImage = fixture.GetUserData() as Ph.GameObjects.Image;
        obstacleImage && this.obstacleImagePool.push(obstacleImage);
        this.terrainBody.DestroyFixture(fixture);
      }
    }
  }
}

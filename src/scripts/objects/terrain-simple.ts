import * as Ph from 'phaser';
import * as Pl from '@box2d/core';
import {Physics} from './physics';

// TODO experiment with Phaser splines https://phaser.io/examples/v3/view/paths/curves/drag-spline-curve
//  Might be a good solution to support a simple level editor
export interface ITerrainSimpleConfig {
  // starting terrain height, in % of game height
  startTerrainHeight: number;
  // The higher the value, the higher the hills
  slopeAmplitude: number;
  // slope length range, in pixels
  slopeLengthRange: number[]; // TODO transform into number of points based on slopeDetail
  // horizontal distance between each terrain point
  slopeDetail: number;
  layers: { color: number, width: number }[];
}


const defaultConfig: ITerrainSimpleConfig = {
  startTerrainHeight: 0.5,
  slopeAmplitude: 200,
  slopeLengthRange: [375, 750],
  slopeDetail: 64,
  layers: [
    {color: 0xC8E1EB, width: 5}, // top layer of snow
    {color: 0x5c8dc9, width: 22},
    {color: 0x223B7B, width: 10},
    {color: 0x2d2c2c, width: 5},
    {color: 0x3a3232, width: 250},
  ],
};

export default class TerrainSimple {
  private readonly terrainBody: Pl.b2Body;
  private readonly slopeStart: Ph.Math.Vector2;
  private readonly chunks: Ph.GameObjects.Graphics[];

  private readonly b2Physics: Physics;
  private readonly scene: Ph.Scene;
  private readonly config: ITerrainSimpleConfig;

  private readonly pointsPool: { x: number, y: number }[];
  private readonly vec2Pool: Pl.b2Vec2[];
  private yOffset = 0;

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
    this.terrainBody = this.b2Physics.world.CreateBody();
    this.slopeStart = new Phaser.Math.Vector2(0, 0);
    this.update();
  }

  interpolate(vFrom, vTo, delta) {
    let interpolation = (1 - Math.cos(delta * Math.PI)) * 0.5;
    return vFrom * (1 - interpolation) + vTo * interpolation;
  }

  update() {
    const {zoom, width, worldView} = this.scene.cameras.main;
    while (this.slopeStart.x < worldView.x + width + 500 * (1 / zoom)) {
      console.time('TerrainSimple#generateSlope()');
      this.updateChunk();
      console.timeEnd('TerrainSimple#generateSlope()');
    }
  }

  // TODO make this a bit more readable
  updateChunk() {
    const slopePoints: { x: number, y: number }[] = [];
    const chainPoints: Pl.b2Vec2[] = [];
    const {slopeDetail} = this.config;
    const worldScale = this.b2Physics.worldScale;

    let slopeStart = new Phaser.Math.Vector2(0, this.slopeStart.y);
    let slopeLengthRange = Phaser.Math.Between(defaultConfig.slopeLengthRange[0], defaultConfig.slopeLengthRange[1]);
    slopeLengthRange = Math.round(slopeLengthRange / slopeDetail) * slopeDetail;

    this.yOffset += slopeLengthRange > this.config.slopeLengthRange[1] * 0.8 ? 0.2 : 0.05;
    const amptlitudeModifier = slopeLengthRange <= this.config.slopeLengthRange[1] / 2 ? 0.75 : 0.75;
    let slopeEnd = (this.slopeStart.x === 0)
      ? {x: slopeStart.x + defaultConfig.slopeLengthRange[1] * 1.5, y: 0}
      : {x: slopeStart.x + slopeLengthRange, y: (Math.random() * amptlitudeModifier) + this.yOffset};
    let pointX = 0;

    let i = 0;
    let point: { x: number, y: number };
    let chainPoint: Pl.b2Vec2;
    const {startTerrainHeight, slopeAmplitude} = this.config;
    const base = this.scene.cameras.main.height * startTerrainHeight;
    const slopeLength = slopeEnd.x - slopeStart.x;

    const slopeStartX = this.slopeStart.x;
    while (pointX <= slopeEnd.x) {
      let interpolationVal = this.interpolate(slopeStart.y, slopeEnd.y, (pointX - slopeStart.x) / slopeLength);
      let pointY = base + interpolationVal * slopeAmplitude;

      point = this.pointsPool[i];
      point.x = pointX + slopeStartX;
      point.y = pointY;
      slopePoints.push(point);

      chainPoint = this.vec2Pool[i];
      chainPoint.x = point.x / worldScale;
      chainPoint.y = point.y / worldScale;
      chainPoints.push(chainPoint);

      pointX += slopeDetail;
      i++;
    }

    const chain = new Pl.b2ChainShape();
    chain.CreateChain(chainPoints, chainPoints.length, chainPoints[0], chainPoints[chainPoints.length - 1]);
    const fd: Pl.b2FixtureDef = {shape: chain, density: 0, friction: 0};
    this.terrainBody.CreateFixture(fd);

    // Draw terrain layers
    // based on this: https://www.emanueleferonato.com/2020/10/16/build-a-html5-game-like-risky-road-using-phaser-step-5-drawing-a-better-terrain/
    // TODO revisit chunking system. It's a bit wonky with the shift() and push(). Probably better to use a phaser group.
    const chunk = this.chunks.shift();
    if (!chunk) return;
    this.chunks.push(chunk);

    chunk.clear();
    const length = slopePoints.length;
    const end = Math.max(slopePoints[0].y, slopePoints[length - 1].y) + this.scene.cameras.main.height * 2;
    let offset = 0;
    slopePoints.push({x: slopePoints[length - 1].x, y: end}, {x: slopeStartX, y: end});
    for (const {color, width} of this.config.layers) {
      chunk.translateCanvas(0, offset);
      chunk.fillStyle(color);
      chunk.fillPoints(slopePoints, true, true);
      chunk.translateCanvas(0, 0);
      offset = width;
    }

    // prepare for next slope
    this.slopeStart.x += pointX - slopeDetail;
    this.slopeStart.y = slopeEnd.y;
  }
}

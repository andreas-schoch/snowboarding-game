import * as Ph from 'phaser';
import * as Pl from '@box2d/core';
import {IBodyConfig, IChainConfig, Physics} from './physics';
import {renderDepth, stats} from '../index';
import GameScene from '../scenes/game.scene';
import {PhysicsTree} from './physics-tree';


export interface ITerrainSimpleConfig {
  // starting terrain height, in % of game height
  startTerrainHeight: number;
  // The higher the value, the higher the hills
  slopeAmplitude: number;
  // min/max amount of gridDensity units per slope
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
  slopeLengthRange: [7, 14],
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
export default class Terrain {
  private readonly terrainBody: Pl.b2Body;
  private slopeStart: Pl.XY;
  private slopeEnd: Pl.XY;
  private readonly chunks: Ph.GameObjects.Graphics[];

  private readonly b2Physics: Physics;
  private readonly scene: GameScene;
  private readonly config: ITerrainSimpleConfig;

  private readonly pointsPool: Pl.XY[];
  private readonly vec2Pool: Pl.b2Vec2[];
  private readonly poolBoulderBodies: [Pl.b2Body, Pl.b2Fixture][];
  private readonly poolCoinBodies: Pl.b2Body[];
  private readonly poolTreeImages: Phaser.GameObjects.Image[];
  private readonly poolPhysicsTrees: PhysicsTree[];

  private yOffset = 0;
  private lastRockSpawnX = 0;

  constructor(scene: GameScene, physics: Physics, config: ITerrainSimpleConfig = defaultConfig) {
    this.scene = scene;
    this.b2Physics = physics;
    this.config = config;

    // pre-allocating points to be re-used throughout the game lifecycle. Hopefully reduces garbage collection induced lag spikes
    const maxSlopePoints = Math.floor(config.slopeLengthRange[1] * this.config.gridDensity * 1.5);
    this.pointsPool = [];
    for (let i = 0; i < maxSlopePoints; i++) this.pointsPool.push({x: 0, y: 0});
    this.vec2Pool = [];
    for (let i = 0; i < maxSlopePoints; i++) this.vec2Pool.push(new Pl.b2Vec2(0, 0));

    this.chunks = [
      this.scene.add.graphics().setDepth(renderDepth.TERRAIN),
      this.scene.add.graphics().setDepth(renderDepth.TERRAIN),
      this.scene.add.graphics().setDepth(renderDepth.TERRAIN),
      this.scene.add.graphics().setDepth(renderDepth.TERRAIN),
      this.scene.add.graphics().setDepth(renderDepth.TERRAIN),
      this.scene.add.graphics().setDepth(renderDepth.TERRAIN),
      this.scene.add.graphics().setDepth(renderDepth.TERRAIN),
      this.scene.add.graphics().setDepth(renderDepth.TERRAIN),
    ];

    const boulderPoints = rock01Points.map(p => ({x: (p.x - 75) / this.b2Physics.worldScale, y: (p.y - 75) / this.b2Physics.worldScale}));
    const boulderConfig: IChainConfig = {
      points: boulderPoints,
      type: 'boulder',
      texture: 'atlas-foliage',
      textureKey: 'boulder-01.png',
      disabled: true,
      body: this.terrainBody,
      depth: renderDepth.BOULDER
    };
    this.poolBoulderBodies = [
      this.b2Physics.createChain(1300, 305, boulderConfig),
      this.b2Physics.createChain(1300, 305, boulderConfig),
      this.b2Physics.createChain(1300, 305, boulderConfig),
      this.b2Physics.createChain(1300, 305, boulderConfig),
      this.b2Physics.createChain(1300, 305, boulderConfig),
      this.b2Physics.createChain(1300, 305, boulderConfig),
      this.b2Physics.createChain(1300, 305, boulderConfig),
      this.b2Physics.createChain(1300, 305, boulderConfig),
    ];

    const coinDiameter = 22; // should match coin texture;
    const poolCoinConfig: IBodyConfig = {
      color: 0xFFD700,
      type: Pl.b2BodyType.b2_staticBody,
      texture: 'atlas-foliage',
      textureKey: 'coin.png',
      enabled: false,
      isSensor: true,
      depth: renderDepth.COIN
    };

    this.poolCoinBodies = [
      this.b2Physics.createBox(0, -1000, 0, coinDiameter,coinDiameter, poolCoinConfig),
      this.b2Physics.createBox(0, -1000, 0, coinDiameter,coinDiameter, poolCoinConfig),
      this.b2Physics.createBox(0, -1000, 0, coinDiameter,coinDiameter, poolCoinConfig),
      this.b2Physics.createBox(0, -1000, 0, coinDiameter,coinDiameter, poolCoinConfig),
      this.b2Physics.createBox(0, -1000, 0, coinDiameter,coinDiameter, poolCoinConfig),
      this.b2Physics.createBox(0, -1000, 0, coinDiameter,coinDiameter, poolCoinConfig),
      this.b2Physics.createBox(0, -1000, 0, coinDiameter,coinDiameter, poolCoinConfig),
      this.b2Physics.createBox(0, -1000, 0, coinDiameter,coinDiameter, poolCoinConfig),
    ];

    this.poolTreeImages = [
      this.scene.add.image(-1000, 0, 'atlas-foliage', 'dead-tree-01.png').setVisible(false).setDepth(renderDepth.TREE_BACKGROUND),
      this.scene.add.image(-1000, 0, 'atlas-foliage', 'dead-tree-02.png').setVisible(false).setDepth(renderDepth.TREE_BACKGROUND),
      this.scene.add.image(-1000, 0, 'atlas-foliage', 'dead-tree-03.png').setVisible(false).setDepth(renderDepth.TREE_BACKGROUND),
      this.scene.add.image(-1000, 0, 'atlas-foliage', 'dead-tree-01.png').setVisible(false).setDepth(renderDepth.TREE_BACKGROUND),
      this.scene.add.image(-1000, 0, 'atlas-foliage', 'dead-tree-02.png').setVisible(false).setDepth(renderDepth.TREE_BACKGROUND),
      this.scene.add.image(-1000, 0, 'atlas-foliage', 'dead-tree-03.png').setVisible(false).setDepth(renderDepth.TREE_BACKGROUND),
      this.scene.add.image(-1000, 0, 'atlas-foliage', 'dead-tree-02.png').setVisible(false).setDepth(renderDepth.TREE_BACKGROUND),
      this.scene.add.image(-1000, 0, 'atlas-foliage', 'dead-tree-03.png').setVisible(false).setDepth(renderDepth.TREE_BACKGROUND),
    ];

    this.poolPhysicsTrees = [
      new PhysicsTree(this.scene, this.b2Physics, 1450, 350).setEnabled(false),
      new PhysicsTree(this.scene, this.b2Physics, 600, 250).setEnabled(false),
      new PhysicsTree(this.scene, this.b2Physics, 600, 250).setEnabled(false),
      new PhysicsTree(this.scene, this.b2Physics, 600, 250).setEnabled(false),
      new PhysicsTree(this.scene, this.b2Physics, 600, 250).setEnabled(false),
      new PhysicsTree(this.scene, this.b2Physics, 600, 250).setEnabled(false),
      new PhysicsTree(this.scene, this.b2Physics, 600, 250).setEnabled(false),
      new PhysicsTree(this.scene, this.b2Physics, 600, 250).setEnabled(false),
    ];

    this.terrainBody = this.b2Physics.world.CreateBody();
    this.slopeStart = new Phaser.Math.Vector2(0, 0);
    this.update();
  }

  update() {
    stats.begin('terrain');
    const {zoom, width, worldView} = this.scene.cameras.main;
    while (this.slopeStart.x < worldView.x + width + 500 * (1 / zoom)) {
      this.cleanupFixtures();
      this.updateChunk();
    }
    stats.end('terrain');
  }

  private updateChunk(): void {
    const isFirst = this.slopeStart.x === 0;
    const [slopePoints, chainPoints] = this.generatePoints();

    this.drawTerrain(slopePoints, chainPoints);
    this.drawDecoration(slopePoints);
    this.drawCoins(slopePoints);
    this.drawObstacles(slopePoints, isFirst);
    this.drawPhysicsTree(slopePoints);
  }

  private drawTerrain(slopePoints: Pl.XY[], chainPoints: Pl.XY[]): void {
    const chunk = this.chunks.shift();
    if (!chunk) return;
    this.chunks.push(chunk);
    chunk.clear();

    this.b2Physics.createChain(0, 0, {points: chainPoints, type: 'terrain', pointsScaled: true, body: this.terrainBody});

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
    const randIndex = Math.floor(Math.random() * (slopePoints.length - 1));
    const point = slopePoints[randIndex];

    const treeImage = this.poolTreeImages.shift();
    if (!treeImage) return;
    this.poolTreeImages.push(treeImage);
    treeImage.setPosition(point.x, point.y - (treeImage.height / 2.25)).setVisible(true);
  }

  // TODO coins need to be placed in a smarter way. E.g
  //  - in the air after a physics tree on a path or in a 4x3 grid
  //  - Over a rock barely in reach
  //  - on flat empty surface 3-5 in a row
  //  - In places where player only reaches when jumping correctly with enough boost
  private drawCoins(slopePoints: Pl.XY[]) {
    const randIndex = Math.floor(Math.random() * (slopePoints.length - 1));
    const point = slopePoints[randIndex];

    const coinBody = this.poolCoinBodies.shift();
    if (!coinBody) return;
    this.poolCoinBodies.push(coinBody);

    const temp = this.vec2Pool[0];
    coinBody.SetTransformVec(temp.Set(point.x / this.b2Physics.worldScale, (point.y - 25) / this.b2Physics.worldScale), 0);
    (coinBody.GetUserData() as Ph.GameObjects.Image).setPosition(point.x, point.y - 25);
    coinBody.SetEnabled(true);
  }

  private drawObstacles(slopePoints: Pl.XY[], forceSpawn: boolean = false): void {
    const pointStart = slopePoints[0];
    const pointEnd = slopePoints[slopePoints.length - 1];

    const travelDistance = this.scene.cameras.main.scrollX / (this.b2Physics.worldScale * 2);
    const minDistFromLast = travelDistance < 750 ? 2500 : 1500;
    const lengthMod = travelDistance < 3000 ? 0.7 : 0.4;

    const {gridDensity, slopeLengthRange} = this.config;
    const length = pointEnd.x - pointStart.x;
    const heightDifference = Math.abs(pointStart.y - pointEnd.y);
    const distanceFromLast = pointEnd.x - this.lastRockSpawnX;
    // boulders spawn more often depending on distance
    const spawn = heightDifference <= 50 && length >= slopeLengthRange[1] * gridDensity * lengthMod && Math.random() < 0.7 && distanceFromLast > minDistFromLast;
    if (spawn || forceSpawn) {
      const obstacle = this.poolBoulderBodies.shift();
      if (!obstacle) return;
      this.poolBoulderBodies.push(obstacle);
      this.lastRockSpawnX = pointEnd.x;

      const yOffset = travelDistance < 500 ? 40 : 35; // a little easier to jump over at the beginning
      const body = obstacle[0];
      body.SetTransformXY(pointEnd.x / this.b2Physics.worldScale, (pointEnd.y + yOffset) / this.b2Physics.worldScale, 0);
      (body.GetUserData() as Ph.GameObjects.Image).setPosition(pointEnd.x, pointEnd.y + yOffset).setVisible(true);
      body.SetEnabled(true);
    }
  }

  private drawPhysicsTree(slopePoints: Pl.XY[]): void {
    const pointStart = slopePoints[0];
    const pointEnd = slopePoints[slopePoints.length - 1];

    const length = pointEnd.x - pointStart.x;
    const heightDifference = pointStart.y - pointEnd.y;

    if (heightDifference < -125 && length <= (this.config.slopeLengthRange[0] + 2) * this.config.gridDensity) {
      const tree = this.poolPhysicsTrees.shift();
      if (!tree) return;
      this.poolPhysicsTrees.push(tree);
      tree.moveTo(slopePoints[2].x - 10, slopePoints[1].y + 25).setEnabled(true);
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
    const diff = slopeLengthRange[1] - slopeLengthRange[0];
    const slopeLength = (Math.round(Math.random() * diff) + diff) * gridDensity;

    this.yOffset += (slopeLength > (slopeLengthRange[1] - 3) * gridDensity) ? 0.4 : 0.1;
    this.yOffset += (slopeLength < (slopeLengthRange[0] + 2) * gridDensity) ? 0.4 : 0;
    // const amplitudeModifier = slopeLength <= slopeLengthRange[1] / 2 ? 0.75 : 0.75;
    return (this.slopeStart.x === 0)
      ? {x: (slopeLengthRange[1] + 7) * gridDensity, y: 0}
      : {x: this.slopeStart.x + slopeLength, y: (Math.random() * 0.75) + this.yOffset};
  }

  private interpolate(vFrom, vTo, delta): number {
    let interpolation = (1 - Math.cos(delta * Math.PI)) * 0.5;
    return vFrom * (1 - interpolation) + vTo * interpolation;
  }

  private cleanupFixtures() {
    const worldScale = this.b2Physics.worldScale;
    const outOfBoundsX = this.scene.cameras.main.scrollX - (500 * (1 / this.scene.cameras.main.zoom));
    this.poolPhysicsTrees.forEach(pt => pt.cleanup(outOfBoundsX));

    for (let fixture = this.terrainBody.GetFixtureList(); fixture; fixture = fixture.GetNext()) {
      const shape = fixture.GetShape();
      if (this.b2Physics.isChain(shape) && shape.m_vertices[shape.m_vertices.length - 1].x * worldScale < outOfBoundsX) {
        const body = fixture.GetBody();
        const obstacleImage = body.GetUserData() as Ph.GameObjects.Image;
        obstacleImage
          ? body.SetEnabled(false)
          : this.terrainBody.DestroyFixture(fixture);
      }
    }
  }
}

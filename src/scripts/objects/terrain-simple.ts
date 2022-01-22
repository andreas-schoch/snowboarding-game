import * as Ph from 'phaser';
import * as Pl from 'planck-js';
import simplify from 'simplify-js';
import {gameConfig} from '../index'; // TODO try to only rely on main camera

// TODO experiment with Phaser splines https://phaser.io/examples/v3/view/paths/curves/drag-spline-curve
//  Might be a good solution to support a simple level editor
export interface ITerrainSimpleConfig {
  // starting terrain height, in % of game height
  startTerrainHeight: number;
  // The higher the value, the higher the hills
  slopeAmplitude: number;
  // slope length range, in pixels
  slopeLengthRange: number[];
  worldScale: number;
  layers: ITerrainLayer[];
}


export interface ITerrainLayer {
  color: number;
  width: number;
}


// TODO experiment with shaders to render the terrain. Depending on where the surface is it should be possible to render colors just like here or even textures
// TODO experiment with a single phaser rope to render the surface with a seamless texture instead of drawing multiple offset layers
//      (Instead of a rope any other method allowing a texture to be rendered and warped along a path would work just as well)
const defaultConfig: ITerrainSimpleConfig = {
  startTerrainHeight: 0.5,
  slopeAmplitude: 200,
  slopeLengthRange: [375, 750],
  worldScale: 15,
  layers: [
    {color: 0x5c8dc9, width: 0},
    {color: 0x223B7B, width: 22},
    {color: 0x2d2c2c, width: 32},
    {color: 0x3a3232, width: 37},
    {color: 0x2d2c2c, width: 250},
  ],
};

// Based on this: https://www.emanueleferonato.com/2021/05/05/endless-physics-random-terrain-with-only-a-bunch-of-bodies-for-your-html5-games-using-phaser-box2d-by-planck-js-and-simplify-js/
export default class TerrainSimple {
  private readonly terrainBody: Pl.Body;
  private readonly slopeStart: Ph.Math.Vector2;
  private readonly chunks: Ph.GameObjects.Graphics[];

  private readonly world: Pl.World;
  private readonly scene: Ph.Scene;
  private readonly config: ITerrainSimpleConfig;

  private slopePoints: { x: number, y: number }[];
  private readonly pointsPool: { x: number, y: number }[];
  private readonly vec2Pool: Pl.Vec2[];

  constructor(scene: Ph.Scene, world: Pl.World, config: ITerrainSimpleConfig = defaultConfig) {
    this.scene = scene;
    this.world = world;
    this.config = config;

    // pre-allocating points to be re-used throughout the game lifecycle. Hopefully reduces garbage collection induced lag spikes
    const maxSlopePoints = Math.floor(config.slopeLengthRange[1] * 2);
    this.pointsPool = [];
    for (let i = 0; i < maxSlopePoints; i++) this.pointsPool.push({x: 0, y: 0});

    this.vec2Pool = [];
    for (let i = 0; i < maxSlopePoints; i++) this.vec2Pool.push(Pl.Vec2(0, 0));

    this.chunks = [
      this.scene.add.graphics(),
      this.scene.add.graphics(),
      this.scene.add.graphics(),
      this.scene.add.graphics(),
      this.scene.add.graphics(),
      this.scene.add.graphics(),
      this.scene.add.graphics(),
    ];
    this.terrainBody = this.world.createBody();
    this.slopeStart = new Phaser.Math.Vector2(0, 0);
    this.generateTerrain();
  }

  update() {
    this.cleanupTerrainFixtures();
    this.generateTerrain();
  }

  interpolate(vFrom, vTo, delta) {
    let interpolation = (1 - Math.cos(delta * Math.PI)) * 0.5;
    return vFrom * (1 - interpolation) + vTo * interpolation;
  }

  generateTerrain() {
    while (this.slopeStart.x < this.scene.cameras.main.worldView.x + this.scene.cameras.main.width + 500) {
      console.time('TerrainSimple#generateSlope()');
      this.generateSlope();
      console.timeEnd('TerrainSimple#generateSlope()');
    }
  }

  // TODO make this a bit more readable
  generateSlope() {
    const detail = 1;
    // TODO generate slopes as chunks where each chunk has a list of pre-allocated slopePoints (large enough for max slope length) which are reused.
    let slopePoints: { x: number, y: number }[] = [];
    let slopeStart = new Phaser.Math.Vector2(0, this.slopeStart.y);
    let slopeLengthRange = Phaser.Math.Between(defaultConfig.slopeLengthRange[0], defaultConfig.slopeLengthRange[1]);
    slopeLengthRange = Math.floor(slopeLengthRange / 200) * 200;
    slopeLengthRange = Math.min(Math.max(slopeLengthRange, this.config.slopeLengthRange[0]), this.config.slopeLengthRange[1]);

    const amptlitudeModifier = slopeLengthRange <= this.config.slopeLengthRange[1] / 2 ? 0.75 : 0.75;
    let slopeEnd = (this.slopeStart.x === 0)
      ? {x: slopeStart.x + defaultConfig.slopeLengthRange[1] * 1.5, y: 0}
      : {x: slopeStart.x + slopeLengthRange, y: Math.random() * amptlitudeModifier};
    let pointX = 0;

    let i = 0;
    let point: { x: number, y: number };
    const {startTerrainHeight, slopeAmplitude} = this.config;
    const base = gameConfig.scale.height * startTerrainHeight;
    const slopeLength = slopeEnd.x - slopeStart.x;

    while (pointX <= slopeEnd.x) {
      let interpolationVal = this.interpolate(slopeStart.y, slopeEnd.y, (pointX - slopeStart.x) / slopeLength);
      let pointY = base + interpolationVal * slopeAmplitude;

      point = this.pointsPool[i];
      point.x = pointX;
      point.y = pointY;

      slopePoints.push(point);
      pointX += detail;
      i++;
    }

    this.slopePoints = simplify(slopePoints, 1, false);
    slopePoints.length = 0;
    const options: Pl.FixtureOpt = {density: 0, friction: 1};
    const worldScale = this.config.worldScale;
    const length = this.slopePoints.length;

    const slopeStartX = this.slopeStart.x;


    const chainPoints: Pl.Vec2[] = [];
    for (let i = 0; i < length; i++) {
      const slopePoint = this.slopePoints[i];
      const chainPoint = this.vec2Pool[i];
      chainPoint.x = (slopePoint.x + slopeStartX) / worldScale;
      chainPoint.y = slopePoint.y / worldScale;
      chainPoints.push(chainPoint);
    }

    // const chain = Pl.Chain(this.slopePoints.map(p => Pl.Vec2((p.x + slopeStartX) / worldScale, p.y / worldScale)));
    const chain = Pl.Chain(chainPoints);
    this.terrainBody.createFixture(chain, options);

    // Layering based on this: https://www.emanueleferonato.com/2020/10/16/build-a-html5-game-like-risky-road-using-phaser-step-5-drawing-a-better-terrain/
    // TODO revisit chunking system. It's a bit wonky with the shift() and push(). Probably better to use a phaser group.
    const chunk = this.chunks.shift();
    if (!chunk) return;
    this.chunks.push(chunk);

    chunk.clear();
    const height = gameConfig.scale.height * 2;

    // draw sub-layers
    for (const {color, width} of this.config.layers) {
      chunk.moveTo(slopeStartX, height);
      chunk.fillStyle(color);
      chunk.beginPath();
      for (let i = 0; i < length; i++) {
        const point = this.slopePoints[i];
        chunk.lineTo(point.x + slopeStartX, point.y + width);
      }
      chunk.lineTo(this.slopePoints[length - 1].x + slopeStartX, height);
      chunk.lineTo(slopeStartX, height);
      chunk.closePath();
      chunk.fillPath();
    }

    // draw top-layer
    chunk.lineStyle(5, 0xC8E1EB); // snow
    chunk.beginPath();
    for (let i = 0; i < length; i++) {
      const point = this.slopePoints[i];
      chunk.lineTo(point.x + slopeStartX, point.y);
    }
    chunk.strokePath();

    this.slopeStart.x += pointX - detail;
    this.slopeStart.y = slopeEnd.y; // FIXME somewhat off when detail is > 1
  }

  private isEdge(shape: Pl.Shape): shape is Pl.Edge {
    return shape.getType() === 'edge';
  }

  private isChain(shape: Pl.Shape): shape is Pl.Chain {
    return shape.getType() === 'chain';
  }

  private isPolygon(shape: Pl.Shape): shape is Pl.Polygon {
    return shape.getType() === 'polygon';
  }

  private isCircle(shape: Pl.Shape): shape is Pl.Circle {
    return shape.getType() === 'circle';
  }

  private cleanupTerrainFixtures() {
    const outOfBoundsX = this.scene.cameras.main.scrollX - 450;
    const worldScale = this.config.worldScale;
    for (let body = this.world.getBodyList(); body; body = body.getNext()) {
      for (let fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
        const shape = fixture.getShape();
        if (this.isChain(shape) && shape.m_vertices[shape.m_count - 1].x * worldScale < outOfBoundsX) {
          body.destroyFixture(fixture);
        }
      }
    }
  }
}

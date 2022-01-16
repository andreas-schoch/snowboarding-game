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
  slopeAmplitude: 400,
  slopeLengthRange: [750, 1500],
  worldScale: 30,
  layers: [
    {color: 0x5c8dc9, width: 0},
    {color: 0x223B7B, width: 35 * 1.3},
    {color: 0x2d2c2c, width: 50 * 1.3},
    {color: 0x3a3232, width: 57 * 1.3},
    {color: 0x2d2c2c, width: 500},
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

  constructor(scene: Ph.Scene, world: Pl.World, config: ITerrainSimpleConfig = defaultConfig) {
    this.scene = scene;
    this.world = world;
    this.config = config;

    this.chunks = [this.scene.add.graphics(), this.scene.add.graphics(), this.scene.add.graphics(), this.scene.add.graphics(), this.scene.add.graphics()];
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
      // console.time('TerrainSimple#generateSlope()');
      this.generateSlope();
      // console.timeEnd('TerrainSimple#generateSlope()');
    }
  }

  // TODO make this a bit more readable
  generateSlope() {
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

    const color = new Ph.Display.Color().random();
    while (pointX <= slopeEnd.x) {
      let interpolationVal = this.interpolate(slopeStart.y, slopeEnd.y, (pointX - slopeStart.x) / (slopeEnd.x - slopeStart.x));
      let pointY = gameConfig.scale.height * defaultConfig.startTerrainHeight + interpolationVal * defaultConfig.slopeAmplitude;
      slopePoints.push(new Phaser.Math.Vector2(pointX, pointY));
      pointX++;
    }

    this.slopePoints = simplify(slopePoints, 1, false);
    const options: Pl.FixtureOpt = {density: 0, friction: 1};
    const {worldScale} = this.config;
    for (let i = 1; i < this.slopePoints.length; i++) {
      const fix = this.terrainBody.createFixture(Pl.Edge(
        Pl.Vec2((this.slopePoints[i - 1].x + this.slopeStart.x) / worldScale, this.slopePoints[i - 1].y / worldScale),
        Pl.Vec2((this.slopePoints[i].x + this.slopeStart.x) / worldScale, this.slopePoints[i].y / worldScale),
      ), options);

      fix.setUserData(color);
    }

    // Layering based on this: https://www.emanueleferonato.com/2020/10/16/build-a-html5-game-like-risky-road-using-phaser-step-5-drawing-a-better-terrain/
    // TODO revisit chunking system. It's a bit wonky with the shift() and push(). Probably better to use a phaser group.
    const chunk = this.chunks.shift();
    if (!chunk) return;
    this.chunks.push(chunk);

    chunk.clear();
    // draw sub-layers
    for (const {color, width} of this.config.layers) {
      chunk.moveTo(this.slopeStart.x, gameConfig.scale.height * 2);
      chunk.fillStyle(color);
      chunk.beginPath();
      this.slopePoints.forEach(point => chunk.lineTo(point.x + this.slopeStart.x, point.y + width));
      chunk.lineTo(this.slopePoints[this.slopePoints.length - 1].x + this.slopeStart.x, gameConfig.scale.height * 2);
      chunk.lineTo(this.slopeStart.x, gameConfig.scale.height * 2);
      chunk.closePath();
      chunk.fillPath();
    }

    // draw top-layer
    chunk.lineStyle(10, 0xC8E1EB); // snow
    chunk.beginPath();
    this.slopePoints.forEach(point => chunk.lineTo(point.x + this.slopeStart.x, point.y));
    chunk.strokePath();

    this.slopeStart.x += pointX - 1;
    this.slopeStart.y = slopeEnd.y;
  }

  private isEdge(shape: Pl.Shape): shape is Pl.Edge {
    return Boolean((shape as Pl.Edge).m_vertex1);
  }

  private cleanupTerrainFixtures() {
    for (let body = this.world.getBodyList(); body; body = body.getNext()) {
      for (let fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
        const shape = fixture.getShape();
        if (this.isEdge(shape) && shape.m_vertex2.x * defaultConfig.worldScale < this.scene.cameras.main.scrollX - 900) {
          body.destroyFixture(fixture);
        }
      }
    }
  }
}

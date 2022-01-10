import * as Ph from 'phaser';
import * as Pl from 'planck-js';
import simplify from 'simplify-js';
import {gameConfig} from '../index';


export interface ITerrainSimpleConfig {
  // starting terrain height, in % of game height
  startTerrainHeight: number;
  // The higher the value, the higher the hills
  slopeAmplitude: number;
  // slope length range, in pixels
  slopeLengthRange: number[];
  // amount of pixels in a meter, in Box2D world
  worldScale: number;
}


const defaultConfig: ITerrainSimpleConfig = {
  startTerrainHeight: 0.5,
  slopeAmplitude: 500,
  slopeLengthRange: [800, 2000],
  worldScale: 30,
};

// TODO this terrain is mostly just a placeholder until adjusting the marching squares terrain to procedurally generate chunks
//  In case I am unable to improve the marching squares terrain in time, this remains PlanB. The following needs adjustments:
//  - Terrain should go downhill at a constant angle with some noise or sine-wave on top of it
//  - Can stutter every few seconds on mobile. Maybe due to Garbage collection of fixtures?

// Based on this: https://www.emanueleferonato.com/2021/05/05/endless-physics-random-terrain-with-only-a-bunch-of-bodies-for-your-html5-games-using-phaser-box2d-by-planck-js-and-simplify-js/
export default class TerrainSimple {
  private readonly terrainGraphics: Ph.GameObjects.Graphics;
  private readonly terrainBody: Pl.Body;
  private readonly slopeStart: Ph.Math.Vector2;
  private readonly debugGraphics: Ph.GameObjects.Graphics;

  private readonly world: Pl.World;
  private readonly scene: Ph.Scene;
  private readonly config: ITerrainSimpleConfig;

  constructor(scene: Ph.Scene, world: Pl.World, config: ITerrainSimpleConfig = defaultConfig) {
    this.scene = scene;
    this.world = world;
    this.config = config;

    this.debugGraphics = this.scene.add.graphics();
    this.terrainGraphics = this.scene.add.graphics();
    this.terrainBody = this.world.createBody();
    this.slopeStart = new Phaser.Math.Vector2(0, 0);
    this.generateTerrain();
  }

  update() {
    this.generateTerrain();
    this.debugDraw();
  }

  interpolate(vFrom, vTo, delta) {
    let interpolation = (1 - Math.cos(delta * Math.PI)) * 0.5;
    return vFrom * (1 - interpolation) + vTo * interpolation;
  }

  generateTerrain() {
    // while next slope starting X coordinate is less than game width and camera scroll...
    while (this.slopeStart.x < this.scene.cameras.main.scrollX + gameConfig.scale.width) {
      // console.time('TerrainSimple#generateSlope()');
      this.generateSlope();
      // console.timeEnd('TerrainSimple#generateSlope()');
    }
  }

  generateSlope() {
    // TODO generate slopes as chunks where each chunk has a list of pre-allocated slopePoints (large enough for max slope length) which are reused.
    let slopePoints: { x: number, y: number }[] = [];
    let slopeStart = new Phaser.Math.Vector2(0, this.slopeStart.y);
    let slopeLengthRange = Phaser.Math.Between(defaultConfig.slopeLengthRange[0], defaultConfig.slopeLengthRange[1]);
    slopeLengthRange = Math.floor(slopeLengthRange / 200) * 200;
    slopeLengthRange = Math.min(Math.max(slopeLengthRange, this.config.slopeLengthRange[0]), this.config.slopeLengthRange[1]);
    let slopeEnd = (this.slopeStart.x === 0) ? {x: slopeStart.x + defaultConfig.slopeLengthRange[1] * 1.5, y: 0} : {x: slopeStart.x + slopeLengthRange, y: Math.random()};
    let pointX = 0;

    while (pointX <= slopeEnd.x) {
      let interpolationVal = this.interpolate(slopeStart.y, slopeEnd.y, (pointX - slopeStart.x) / (slopeEnd.x - slopeStart.x));
      let pointY = gameConfig.scale.height * defaultConfig.startTerrainHeight + interpolationVal * defaultConfig.slopeAmplitude;
      slopePoints.push(new Phaser.Math.Vector2(pointX, pointY));
      pointX++;
    }

    slopePoints = simplify(slopePoints, 1, false);
    const options: Pl.FixtureOpt = {density: 0, friction: 0};
    const {worldScale} = this.config;
    for (let i = 1; i < slopePoints.length; i++) {
      this.terrainBody.createFixture(Pl.Edge(
        Pl.Vec2((slopePoints[i - 1].x + this.slopeStart.x) / worldScale, slopePoints[i - 1].y / worldScale),
        Pl.Vec2((slopePoints[i].x + this.slopeStart.x) / worldScale, slopePoints[i].y / worldScale),
      ), options);
    }

    this.slopeStart.x += pointX - 1;
    this.slopeStart.y = slopeEnd.y;
  }

  // TODO draw a single connected line for each segment
  debugDraw() {
    this.debugGraphics.clear();
    for (let body = this.world.getBodyList(); body; body = body.getNext()) {
      for (let fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
        let shape = fixture.getShape();
        switch (fixture.getType()) {
          case 'edge': {
            this.debugGraphics.lineStyle(4, 0xff00ff);
            // @ts-ignore
            let v1 = shape.m_vertex1;
            // @ts-ignore
            let v2 = shape.m_vertex2;
            if (v2.x * defaultConfig.worldScale < this.scene.cameras.main.scrollX) {
              body.destroyFixture(fixture); // TODO check if fixtures can be updated. If yes, try to pool them instead of destroying
            } else {
              this.debugGraphics.beginPath();
              this.debugGraphics.moveTo(v1.x * defaultConfig.worldScale, v1.y * defaultConfig.worldScale);
              this.debugGraphics.lineTo(v2.x * defaultConfig.worldScale, v2.y * defaultConfig.worldScale);
              this.debugGraphics.strokePath();
            }
            break;
          }
          // case 'circle': {
          //   let position = body.getPosition();
          //   let angle = body.getAngle();
          //   this.debugDrawGraphics.fillStyle(0x00ff00, 0.5);
          //   this.debugDrawGraphics.fillCircle(position.x * gameOptions.worldScale, position.y * gameOptions.worldScale, shape.m_radius * gameOptions.worldScale);
          //   this.debugDrawGraphics.lineStyle(2, 0x00ff00);
          //   this.debugDrawGraphics.strokeCircle(position.x * gameOptions.worldScale, position.y * gameOptions.worldScale, shape.m_radius * gameOptions.worldScale);
          //   this.debugDrawGraphics.beginPath();
          //   this.debugDrawGraphics.moveTo(position.x * gameOptions.worldScale, position.y * gameOptions.worldScale);
          //   this.debugDrawGraphics.lineTo(position.x * gameOptions.worldScale + 30 * Math.cos(angle), position.y * gameOptions.worldScale + 30 * Math.sin(angle));
          //   this.debugDrawGraphics.strokePath();
          //   break;
          // }
        }
      }
    }

    // console.log('edges', edges);
  }
}

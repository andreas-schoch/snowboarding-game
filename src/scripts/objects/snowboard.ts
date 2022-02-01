import * as Ph from 'phaser';
import * as Pl from '@box2d/core';
import {Physics} from './physics';
import {WickedSnowman} from './wicked-snowman';


interface IRayCastResult {
  hit: boolean;
  point: Pl.b2Vec2 | null | undefined;
  normal: Pl.b2Vec2 | null | undefined;
  fraction: number;
  lastHitTime: number;
}


export interface ISegment {
  body: Pl.b2Body;

  groundRayDirection: Pl.b2Vec2;
  groundRayResult: IRayCastResult;
  groundRayCallback: Pl.b2RayCastCallback;

  crashRayDirection?: Pl.b2Vec2;
  crashRayResult?: IRayCastResult;
  crashRayCallback?: Pl.b2RayCastCallback;
}


export class WickedSnowboard {
  numSegments: number = 10;
  segmentLength: number = 8.4;
  segmentThickness: number = 3.375;
  nose?: ISegment;

  leftBinding?: Pl.b2Body;
  rightBinding?: Pl.b2Body;
  readonly segments: ISegment[] = [];

  private pointStart: Pl.b2Vec2 = new Pl.b2Vec2(0, 0);
  private pointEnd: Pl.b2Vec2 = new Pl.b2Vec2(0, 0);
  private debugGraphics: Ph.GameObjects.Graphics;

  private readonly player: WickedSnowman;
  private readonly scene: Ph.Scene;
  private readonly b2Physics: Physics;

  constructor(player: WickedSnowman, x: number = 250, y: number = 50) {
    this.player = player;
    this.scene = player.scene;
    this.b2Physics = player.b2Physics;

    this.debugGraphics = this.scene.add.graphics();
    this.generateSegments(x, y, this.b2Physics.worldScale / 2);
  }

  update() {
    this.player.debug && this.debugGraphics.clear();

    for (const segment of this.segments) {
      this.resetSegment(segment);
      segment.body.GetWorldPoint(Pl.b2Vec2.ZERO, this.pointStart);
      segment.body.GetWorldPoint(segment.groundRayDirection, this.pointEnd);
      this.b2Physics.world.RayCast(this.pointStart, this.pointEnd, segment.groundRayCallback);
      this.player.debug && this.drawDebug(segment.groundRayResult.hit ? 0x0000ff : 0x00ff00);

      if (segment.crashRayResult && segment.crashRayCallback && segment.crashRayDirection) {
        segment.body.GetWorldPoint(Pl.b2Vec2.ZERO, this.pointStart);
        segment.body.GetWorldPoint(segment.crashRayDirection, this.pointEnd);
        this.b2Physics.world.RayCast(this.pointStart, this.pointEnd, segment.crashRayCallback);
        this.player.debug && this.drawDebug(segment.crashRayResult.hit ? 0x0000ff : 0x00ff00);
      }
    }
  }

  getTimeInAir(): number {
    if (this.segments.some(s => s.groundRayResult.hit)) return -1;
    const mostRecentHit = Math.max(...this.segments.map(s => s.groundRayResult.lastHitTime));
    return this.scene.game.getTime() - mostRecentHit;
  }

  isInAir(): boolean {
    return this.getTimeInAir() !== -1;
  }

  private rayCallbackFactory(hitResult: IRayCastResult) {
    return (fixture, point, normal, fraction) => {
      hitResult.hit = true;
      hitResult.point = point;
      hitResult.normal = normal;
      hitResult.fraction = fraction;
      hitResult.lastHitTime = this.scene.game.getTime();
      return fraction;
    };
  }

  private resetSegment(segment: ISegment) {
    segment.groundRayResult.hit = false;
    segment.groundRayResult.point = null;
    segment.groundRayResult.normal = null;
    segment.groundRayResult.fraction = -1;

    if (segment.crashRayResult) {
      segment.crashRayResult.hit = false;
      segment.crashRayResult.point = null;
      segment.crashRayResult.normal = null;
      segment.crashRayResult.fraction = -1;
    }
  }

  private drawDebug(color: number) {
    this.debugGraphics.lineStyle(2, color, 1);
    const scale = this.b2Physics.worldScale;
    this.debugGraphics.lineBetween(
      this.pointStart.x * scale,
      this.pointStart.y * scale,
      this.pointEnd.x * scale,
      this.pointEnd.y * scale,
    );
  }

  private generateSegments(x: number, y: number, rayLength: number) {
    const {numSegments, segmentLength, segmentThickness} = this;
    // create segments...
    const color = 0xD5365E;
    const temp: IRayCastResult = {hit: false, point: null, normal: null, fraction: -1, lastHitTime: -1};
    for (let i = 1; i <= this.numSegments; i++) {
      const body = this.b2Physics.createBox(x + segmentLength * i, y, 0, segmentLength, segmentThickness, true, color);
      const isNose = i === this.numSegments;
      const groundHitResult = {...temp};
      const crashHitResult = {...temp};
      this.segments.push({
        body: body,
        groundRayDirection: new Pl.b2Vec2(0, rayLength / this.b2Physics.worldScale),
        groundRayResult: groundHitResult,
        groundRayCallback: this.rayCallbackFactory(groundHitResult),
        crashRayDirection: isNose ? new Pl.b2Vec2(rayLength / this.b2Physics.worldScale, 0) : undefined,
        crashRayResult: isNose ? crashHitResult : undefined,
        crashRayCallback: isNose ? this.rayCallbackFactory(crashHitResult) : undefined,
      });
    }

    this.nose = this.segments[this.segments.length - 1];
    this.leftBinding = this.segments[3].body;
    this.rightBinding = this.segments[6].body;

    const weldConfigs: { dampingRatio: number, frequencyHz: number, referenceAngle: number }[] = [
      {dampingRatio: 0.5, frequencyHz: 6, referenceAngle: -0.35},
      {dampingRatio: 0.5, frequencyHz: 6, referenceAngle: -0.25},
      {dampingRatio: 0.5, frequencyHz: 7, referenceAngle: -0.05},
      {dampingRatio: 0.5, frequencyHz: 8, referenceAngle: -0.025},
      {dampingRatio: 0.5, frequencyHz: 10, referenceAngle: 0},
      {dampingRatio: 0.5, frequencyHz: 8, referenceAngle: -0.025},
      {dampingRatio: 0.5, frequencyHz: 7, referenceAngle: -0.05},
      {dampingRatio: 0.5, frequencyHz: 6, referenceAngle: -0.25},
      {dampingRatio: 0.5, frequencyHz: 6, referenceAngle: -0.35},
    ];

    // ...weld them together TODO move creation of weld joint to Physics class
    for (let i = 0; i < numSegments - 1; i++) {
      const [a, b] = this.segments.slice(i, i + 2);
      const anchorAB = new Pl.b2Vec2((x + (segmentLength / 2) + segmentLength * (i + 1)) / this.b2Physics.worldScale, y / this.b2Physics.worldScale);
      const {dampingRatio, frequencyHz, referenceAngle} = weldConfigs[i];
      const jd = new Pl.b2WeldJointDef();
      jd.Initialize(a.body, b.body, anchorAB);
      jd.referenceAngle = referenceAngle;
      Pl.b2AngularStiffness(jd, frequencyHz, dampingRatio, jd.bodyA, jd.bodyB);
      this.b2Physics.world.CreateJoint(jd);
    }
  }
}

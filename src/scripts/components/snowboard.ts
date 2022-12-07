import * as Ph from 'phaser';
import * as Pl from '@box2d/core';
import {Physics} from './physics';
import GameScene from '../scenes/game.scene';
import {PlayerController} from './wicked-snowman';


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
  nose?: ISegment;

  isTailGrounded: boolean;
  isNoseGrounded: boolean;
  isCenterGrounded: boolean;

  readonly segments: ISegment[] = [];

  private pointStart: Pl.b2Vec2 = new Pl.b2Vec2(0, 0);
  private pointEnd: Pl.b2Vec2 = new Pl.b2Vec2(0, 0);
  private debugGraphics: Ph.GameObjects.Graphics;

  private readonly player: PlayerController;
  private readonly scene: GameScene;
  private readonly b2Physics: Physics;

  constructor(player: PlayerController) {
    this.player = player;
    this.scene = player.scene;
    this.b2Physics = player.b2Physics;

    this.debugGraphics = this.scene.add.graphics();
    this.initRays(this.b2Physics.worldScale / 4);

  }

  update(delta: number) {
    this.player.debug && this.debugGraphics.clear();
    const segments = this.segments;

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

    this.isTailGrounded = segments[0].groundRayResult.hit;
    this.isNoseGrounded = segments[segments.length - 1].groundRayResult.hit;
    this.isCenterGrounded = segments[2].groundRayResult.hit || segments[3].groundRayResult.hit || segments[4].groundRayResult.hit;
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
      this.b2Physics.rubeLoader.getCustomProperty(fixture, 'bool', 'phaserCrashSensorIgnore', false);
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
      -this.pointStart.y * scale,
      this.pointEnd.x * scale,
      -this.pointEnd.y * scale,
    );
  }

  private initRays(rayLength: number) {
    const temp: IRayCastResult = {hit: false, point: null, normal: null, fraction: -1, lastHitTime: -1};
    for (const segment of this.player.parts.boardSegments) {
      const segmentIndex = this.b2Physics.rubeLoader.getCustomProperty(segment, 'int', 'phaserBoardSegmentIndex', -1);
      const isNose = segmentIndex === this.player.parts.boardSegments.length - 1;
      const groundHitResult = {...temp};
      const crashHitResult = {...temp};
      this.segments.push({
        body: segment,
        groundRayDirection: new Pl.b2Vec2(0, -rayLength / this.b2Physics.worldScale),
        groundRayResult: groundHitResult,
        groundRayCallback: this.rayCallbackFactory(groundHitResult),
        crashRayDirection: isNose ? new Pl.b2Vec2((isNose ? rayLength * 2 : rayLength) / this.b2Physics.worldScale, 0) : undefined,
        crashRayResult: isNose ? crashHitResult : undefined,
        crashRayCallback: isNose ? this.rayCallbackFactory(crashHitResult) : undefined,
      });

      if (isNose) this.nose = this.segments[this.segments.length - 1];
    }

  }
}

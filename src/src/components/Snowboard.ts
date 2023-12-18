import * as Ph from 'phaser';
import { Physics } from './Physics';
import GameScene from '../scenes/GameScene';
import { PlayerController } from './PlayerController';
import { DEBUG, b2 } from '../index';
import { vec2Util } from '../util/RUBE/Vec2Math';


interface IRayCastResult {
  hit: boolean;
  point: Box2D.b2Vec2 | null | undefined;
  normal: Box2D.b2Vec2 | null | undefined;
  fraction: number;
  lastHitFrame: number;
}


export interface ISegment {
  body: Box2D.b2Body;

  groundRayDirection: Box2D.b2Vec2;
  groundRayResult: IRayCastResult;
  groundRayCallback: Box2D.b2RayCastCallback;
}


export class WickedSnowboard {
  nose?: ISegment;

  isTailGrounded: boolean;
  isNoseGrounded: boolean;
  isCenterGrounded: boolean;

  readonly segments: ISegment[] = [];

  private pointStart: Box2D.b2Vec2;
  private pointEnd: Box2D.b2Vec2;
  private ZERO: Box2D.b2Vec2;
  private debugGraphics: Ph.GameObjects.Graphics;

  private readonly player: PlayerController;
  private readonly scene: GameScene;
  private readonly b2Physics: Physics;

  constructor(player: PlayerController) {
    this.player = player;
    this.scene = player.scene;
    this.b2Physics = player.b2Physics;

    this.pointStart = new b2.b2Vec2(0, 0);
    this.pointEnd = new b2.b2Vec2(0, 0);
    this.ZERO = new b2.b2Vec2(0, 0);

    this.debugGraphics = this.scene.add.graphics().setDepth(10000000);
    this.initRays(this.b2Physics.worldScale / 4);

  }

  update() {
    const segments = this.segments;
    for (const segment of this.segments) {
      this.resetSegment(segment);
      // Raycast doesn't work without cloning vectors returned by GetWorldPoint()
      const pointStart = vec2Util.Clone(segment.body.GetWorldPoint(this.ZERO));
      const pointEnd = vec2Util.Clone(segment.body.GetWorldPoint(segment.groundRayDirection));
      this.b2Physics.world.RayCast(segment.groundRayCallback, pointStart, pointEnd);
    }

    this.isTailGrounded = segments[0].groundRayResult.hit;
    this.isNoseGrounded = segments[segments.length - 1].groundRayResult.hit;
    this.isCenterGrounded = segments[3].groundRayResult.hit;
  }

  getFramesInAir(): number {
    if (this.segments.some(s => s.groundRayResult.hit)) return -1;
    const mostRecentHit = Math.max(...this.segments.map(s => s.groundRayResult.lastHitFrame));
    return this.scene.game.getFrame() - mostRecentHit;
  }

  isInAir(): boolean {
    return this.getFramesInAir() !== -1;
  }

  private resetSegment(segment: ISegment) {
    segment.groundRayResult.hit = false;
    segment.groundRayResult.point = null;
    segment.groundRayResult.normal = null;
    segment.groundRayResult.fraction = -1;
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
    for (const segment of this.player.parts.boardSegments) {
      const index = this.b2Physics.rubeLoader.getCustomProperty(segment, 'int', 'phaserBoardSegmentIndex', -1);
      const result: IRayCastResult = { hit: false, point: null, normal: null, fraction: -1, lastHitFrame: -1 };

      const callback = Object.assign(new b2.JSRayCastCallback(), {
        ReportFixture: (fixturePtr: number, pointPtr: number, normalPtr: number, fraction: number): number => {
          const fixture = b2.wrapPointer(fixturePtr, b2.b2Fixture); // TODO Is this correct?
          if (fixture.IsSensor()) return -1; // coins and other sensors can mess with raycast leading to wrong trick score and rotation computation
          const point = b2.wrapPointer(pointPtr, b2.b2Vec2);
          const normal = b2.wrapPointer(normalPtr, b2.b2Vec2);
          result.hit = true;
          result.point = point;
          result.normal = normal;
          result.fraction = fraction;
          result.lastHitFrame = this.scene.game.getFrame();
          return fraction;
        }
      });

      this.segments.push({
        body: segment,
        groundRayDirection: new b2.b2Vec2(0, -rayLength / this.b2Physics.worldScale),
        groundRayResult: result,
        groundRayCallback: callback
      });


      if (index === this.player.parts.boardSegments.length - 1) this.nose = this.segments[this.segments.length - 1];
    }

  }
}

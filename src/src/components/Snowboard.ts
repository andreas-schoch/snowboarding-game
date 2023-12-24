import * as Ph from 'phaser';
import { IPostSolveEvent, Physics } from './Physics';
import GameScene from '../scenes/GameScene';
import { PlayerController } from './PlayerController';
import { b2 } from '../index';
import { vec2Util } from '../util/RUBE/Vec2Math';

interface IRayCastResult {
  hit: boolean;
  point: Box2D.b2Vec2;
  normal: Box2D.b2Vec2;
  fraction: number;
  lastHitFrame: number;
}

export interface ISegment {
  body: Box2D.b2Body;
  groundRayDirection: Box2D.b2Vec2;
  groundRayResult: IRayCastResult;
  groundRayCallback: Box2D.b2RayCastCallback;
}

export class Snowboard {
  isTailGrounded: boolean;
  isNoseGrounded: boolean;
  isCenterGrounded: boolean;
  readonly segments: ISegment[] = [];
  private ZERO: Box2D.b2Vec2;
  private debugGraphics: Ph.GameObjects.Graphics;

  private readonly player: PlayerController;
  private readonly scene: GameScene;
  private readonly b2Physics: Physics;
  particles: Ph.GameObjects.Particles.ParticleEmitter;

  constructor(player: PlayerController) {
    this.player = player;
    this.scene = player.scene;
    this.b2Physics = player.b2Physics;
    this.ZERO = new b2.b2Vec2(0, 0);

    this.debugGraphics = this.scene.add.graphics().setDepth(10000000);
    this.debugGraphics.fillStyle(0xffffff, 1);
    this.debugGraphics.fillCircle(8, 8, 8);
    this.debugGraphics.generateTexture('circle_01', 16, 16);
    this.debugGraphics.clear();

    this.initRays(this.b2Physics.worldScale / 4);


    this.particles = this.scene.add.particles(0, 0, 'circle_01', {
      active: true,
      visible: true,
      emitting: false,
      particleBringToTop: true,
      radial: true,
      blendMode: 0,
      gravityY: 100,
      delay: 100,
      frequency: 0,
      maxParticles: 0,
      timeScale: 1,
      alpha: 1,
      angle: { min: 0, max: 360 },
      lifespan: { min: 600, max: 1250 },
      quantity: { min: 2, max: 10 },
      scale: { ease: "Linear", min: 0.1, max: 0.25 },
      speed: { min: 25, max: 100 },
      // tint: [0x8d8da6]
    }).setDepth(-10);

    const customProps = this.b2Physics.rubeLoader.customPropertiesMapMap;
    const scale = this.b2Physics.worldScale;
    this.b2Physics.on('post_solve', ({ contact, impulse, bodyA, bodyB }: IPostSolveEvent) => {
      const propsBA = customProps.get(bodyA);
      const propsBB = customProps.get(bodyB);
      if (propsBA && propsBA['surfaceType'] !== 'snow' && propsBB && propsBB['surfaceType'] !== 'snow') return;

      const nonSurfaceBody = propsBA && propsBA['surfaceType'] !== 'snow' ? bodyA : bodyB;
      const velocityLength = nonSurfaceBody.GetLinearVelocity().Length();

      const manifold = new b2.b2WorldManifold();
      contact.GetWorldManifold(manifold);
      for (let i = 0; i < impulse.get_count(); i++) {
        const point = vec2Util.Scale(manifold.get_points(i), scale, -scale);
        const normalImpulse = impulse.get_normalImpulses(i);
        if (!this.scene.cameras.main.worldView.contains(point.x, point.y)) continue;
        if (normalImpulse < 4 || velocityLength < 0.5) continue;
        this.particles.emitParticleAt(point.x, point.y, Math.min(normalImpulse * 1.5, 25));

        if (propsBA && propsBA['phaserPlayerCharacterPart'] === 'boardSegment' || propsBB && propsBB['phaserPlayerCharacterPart'] === 'boardSegment') {
          const centerGrounded = this.segments[3].groundRayResult.hit;
          this.scene.observer.emit('surface_impact', normalImpulse, 'snow', false, centerGrounded, false);
        }
      }
    });
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
    let mostRecentHit = 0;
    for (const segment of this.segments) mostRecentHit = Math.max(mostRecentHit, segment.groundRayResult.lastHitFrame);
    return this.scene.game.getFrame() - mostRecentHit;
  }

  isInAir(): boolean {
    return this.getFramesInAir() !== -1;
  }

  private resetSegment(segment: ISegment) {
    segment.groundRayResult.hit = false;
    segment.groundRayResult.point.SetZero();
    segment.groundRayResult.normal.SetZero();
    segment.groundRayResult.fraction = -1;
  }

  private initRays(rayLength: number) {
    const groundRayDirection = new b2.b2Vec2(0, -rayLength / this.b2Physics.worldScale);
    for (const body of this.player.parts.boardSegments) {
      const groundRayResult: IRayCastResult = { hit: false, point: new b2.b2Vec2(0, 0), normal: new b2.b2Vec2(0, 0), fraction: -1, lastHitFrame: -1 };

      const groundRayCallback = new b2.JSRayCastCallback();
      groundRayCallback.ReportFixture = (fixturePtr: number, pointPtr: number, normalPtr: number, fraction: number) => {
        const fixture = b2.wrapPointer(fixturePtr, b2.b2Fixture); // TODO Is this correct?
        if (fixture.IsSensor()) return -1; // coins and other sensors can mess with raycast leading to wrong trick score and rotation computation
        const { x: pointX, y: pointY } = b2.wrapPointer(pointPtr, b2.b2Vec2);
        const { x: normalX, y: normalY } = b2.wrapPointer(normalPtr, b2.b2Vec2);
        groundRayResult.hit = true;
        groundRayResult.point.Set(pointX, pointY);
        groundRayResult.normal.Set(normalX, normalY);
        groundRayResult.fraction = fraction;
        groundRayResult.lastHitFrame = this.scene.game.getFrame();
        return fraction;
      };

      this.segments.push({ body, groundRayDirection, groundRayResult, groundRayCallback });
    }

  }
}

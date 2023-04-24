import * as Ph from 'phaser';
import * as Pl from '@box2d/core';
import {Physics} from '../components/Physics';
import {b2BodyType} from '@box2d/core';
import {getB2FixtureAtPoint} from "./getB2FixtureAtPoint";


export class DebugMouseJoint {
  private mouseJoint: Pl.b2MouseJoint | null;

  private context: Ph.Input.InputPlugin | Ph.GameObjects.DOMElement;
  private b2Physics: Physics;

  constructor(context: Ph.Input.InputPlugin | Ph.GameObjects.DOMElement, b2Physics: Physics) {
    this.context = context;
    this.b2Physics = b2Physics;

    const scale = this.b2Physics.worldScale;
    this.context.on('pointerdown', (p: Ph.Input.Pointer) => this.mouseDown({x: p.worldX / scale, y: -p.worldY / scale}));
    this.context.on('pointermove', (p: Ph.Input.Pointer) => this.mouseMove({x: p.worldX / scale, y: -p.worldY / scale}, true));
    this.context.on('pointerup', (p: Ph.Input.Pointer) => this.mouseUp());
  }

  mouseMove(p: Pl.XY, leftDrag: boolean): void {
    if (leftDrag && this.mouseJoint) {
      this.mouseJoint.SetTarget(p);
    }
  }

  mouseUp(): void {
    if (this.mouseJoint) {
      this.b2Physics.world.DestroyJoint(this.mouseJoint);
      this.mouseJoint = null;
    }
  }

  mouseDown(p: Pl.XY): void {
    if (this.mouseJoint) {
      this.b2Physics.world.DestroyJoint(this.mouseJoint);
      this.mouseJoint = null;
    }

    // Query the world for overlapping shapes.
    let body = getB2FixtureAtPoint(this.b2Physics.world, p, new Set([b2BodyType.b2_dynamicBody]))?.GetBody();
    if (!body) return;

    const jd = new Pl.b2MouseJointDef();
    jd.collideConnected = true;
    jd.damping = 0.1;
    jd.bodyA = this.b2Physics.rubeLoader.getBodiesByCustomProperty('bool', 'phaserTerrain', true)[0];
    jd.bodyB = body;
    jd.target.Copy(p);
    jd.maxForce = 1500 * body.GetMass();
    Pl.b2LinearStiffness(jd, 5, 0.5, jd.bodyA, jd.bodyB);

    this.mouseJoint = this.b2Physics.world.CreateJoint(jd) as Pl.b2MouseJoint;
    body.SetAwake(true);
  }
}

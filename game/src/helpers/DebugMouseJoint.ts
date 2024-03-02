import {b2, ppm, recordLeak} from '..';
import {XY} from '../Terrain';
import {Physics} from '../physics/Physics';

// TODO fix this
export class MouseJoint {
  private mouseJoint: Box2D.b2MouseJoint | null;

  constructor(private scene: Phaser.Scene, private b2Physics: Physics) {
    const {worldX, worldY} = scene.input.activePointer;
    addEventListener('pointerdown', () => this.MouseDown({x: worldX / ppm, y: -worldY / ppm}));
    addEventListener('pointerup', () => this.MouseUp());
    addEventListener('pointermove', () => this.MouseMove({x: worldX / ppm, y: -worldY / ppm}, true));

  }

  MouseMove(p: XY, leftDrag: boolean): void {
    if (leftDrag && this.mouseJoint) {
      console.log('mouseJoint exists, setting target');
      const point = recordLeak(new b2.b2Vec2(p.x, p.y));
      this.mouseJoint.SetTarget(point);
    }
  }

  MouseUp(): void {
    if (this.mouseJoint) {
      this.b2Physics.worldEntity.world.DestroyJoint(this.mouseJoint);
      console.log('mouseJoint destroyed');
      this.mouseJoint = null;
    }
  }

  MouseDown(p: XY): void {
    if (this.mouseJoint) {
      console.log('mouseJoint already exists, destroying it before creating a new one.');
      this.b2Physics.worldEntity.world.DestroyJoint(this.mouseJoint);
      this.mouseJoint = null;
    }

    const point = recordLeak(new b2.b2Vec2(p.x, p.y));

    // Query the world for overlapping shapes.
    let hit_fixture: Box2D.b2Fixture | undefined;
    const aabb = new b2.b2AABB();
    aabb.lowerBound.Set(point.x - 0.001, point.y - 0.001);
    aabb.upperBound.Set(point.x + 0.001, point.y + 0.001);

    const callback = new b2.JSQueryCallback();
    callback.ReportFixture = (fixture_ptr: number) => {
      const fixture = b2.wrapPointer(fixture_ptr, b2.b2Fixture);
      const body = fixture.GetBody();
      if (body.GetType() === b2.b2_dynamicBody && fixture.TestPoint(point)) {
        hit_fixture = fixture;
        return false; // We are done, terminate the query.
      }
      return true; // Continue the query.
    };

    this.b2Physics.worldEntity.world.QueryAABB(callback, aabb);

    if (hit_fixture) {
      const frequencyHz = 5;
      const dampingRatio = 0.5;

      const body = hit_fixture.GetBody();
      const jd = new b2.b2MouseJointDef();
      jd.collideConnected = true;
      jd.damping = 0.1;
      const fixture = this.b2Physics.loader.getFixturesByCustomProperty('surfaceType', 'snow')[0];
      jd.bodyA = fixture.GetBody();
      jd.bodyB = body;
      jd.target.Set(p.x, p.y);
      jd.maxForce = 700 * body.GetMass();
      this.setLinearStiffness(jd, frequencyHz, dampingRatio, jd.bodyA, jd.bodyB);

      const joint = this.b2Physics.worldEntity.world.CreateJoint(jd);
      this.mouseJoint = b2.castObject(joint, b2.b2MouseJoint);
      console.log('mouseJoint created');
      body.SetAwake(true);
      b2.destroy(jd);
      b2.destroy(point);
      b2.destroy(aabb);
      b2.destroy(callback);
    }
  }

  // TODO deduplicate. Copied from RubeLoader
  private setLinearStiffness(jd: {stiffness: number, damping: number}, frequency: number, dampingRatio: number, bodyA: Box2D.b2Body, bodyB: Box2D.b2Body) {
    // See comment for b2LinearStiffness to see why this is done in such a way
    const output_p = b2._malloc(Float32Array.BYTES_PER_ELEMENT * 2);
    b2.b2LinearStiffness(output_p, output_p + Float32Array.BYTES_PER_ELEMENT, frequency || 0, dampingRatio || 0, bodyA, bodyB);
    const [stiffness, damping] = b2.HEAPF32.subarray(output_p >> 2);
    b2._free(output_p);
    jd.stiffness = stiffness;
    jd.damping = damping;
  }
}

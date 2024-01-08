// import {Physics} from '../components/Physics';
// import * as Pl from '@box2d/core';
// import {b2BodyType} from '@box2d/core';
// import GameScene from '../scenes/GameScene';


// export class DebugMouseJoint {
//   private mouseJoint: Pl.b2MouseJoint | null;

//   private scene: GameScene;
//   private b2Physics: Physics;

//   constructor(scene: GameScene, b2Physics: Physics) {
//     this.scene = scene;
//     this.b2Physics = b2Physics;

//     this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.MouseDown({x: pointer.worldX / this.b2Physics.worldScale, y: -pointer.worldY / this.b2Physics.worldScale}));
//     this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => this.MouseUp({x: pointer.worldX / this.b2Physics.worldScale, y: -pointer.worldY / this.b2Physics.worldScale}));
//     this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => this.MouseMove({x: pointer.worldX / this.b2Physics.worldScale, y: -pointer.worldY / this.b2Physics.worldScale}, true));

//   }

//   MouseMove(p: Pl.XY, leftDrag: boolean): void {
//     if (leftDrag && this.mouseJoint) {
//       this.mouseJoint.SetTarget(p);
//     }
//   }

//   MouseUp(p: Pl.XY): void {
//     if (this.mouseJoint) {
//       this.b2Physics.world.DestroyJoint(this.mouseJoint);
//       this.mouseJoint = null;
//     }
//   }

//   MouseDown(p: Pl.XY): void {
//     if (this.mouseJoint) {
//       this.b2Physics.world.DestroyJoint(this.mouseJoint);
//       this.mouseJoint = null;
//     }

//     // Query the world for overlapping shapes.
//     let hit_fixture: Pl.b2Fixture | undefined;
//     this.b2Physics.world.QueryPointAABB(p, (fixture) => {
//       const body = fixture.GetBody();
//       if (body.GetType() === b2BodyType.b2_dynamicBody && fixture.TestPoint(p)) {
//         hit_fixture = fixture;
//         return false; // We are done, terminate the query.
//       }
//       return true; // Continue the query.
//     });

//     if (hit_fixture) {
//       const frequencyHz = 5;
//       const dampingRatio = 0.5;

//       const body = hit_fixture.GetBody();
//       const jd = new Pl.b2MouseJointDef();
//       jd.collideConnected = true;
//       jd.damping = 0.1;
//       jd.bodyA = this.b2Physics.loader.getBodiesByCustomProperty('bool', 'phaserTerrain', true)[0];
//       jd.bodyB = body;
//       jd.target.Copy(p);
//       jd.maxForce = 700 * body.GetMass();
//       Pl.b2LinearStiffness(jd, frequencyHz, dampingRatio, jd.bodyA, jd.bodyB);

//       this.mouseJoint = this.b2Physics.world.CreateJoint(jd) as Pl.b2MouseJoint;
//       body.SetAwake(true);
//     }
//   }
// }

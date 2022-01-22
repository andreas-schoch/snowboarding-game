import * as Ph from 'phaser';
import {b2} from '../index';

// TODO
//  - add mobile controls (use touchscreen areas to replace WASD. E.g If player touches left or right snowman leans left or right)
//  -

// interface IRayCastResult {
//   hit: boolean;
//   point: Box2D.b2Vec2 | null | undefined;
//   normal: Box2D.b2Vec2 | null | undefined;
//   fraction: number;
//   lastHitTime: number;
// }
//
//
class Segment {
  scene: Ph.Scene;
  world: Box2D.b2World;
  body: Box2D.b2Body;
//
//   rayLength: number;
//
//   direction: Box2D.b2Vec2 = new b2.b2Vec2(0, 1);
//   rayCastResult: IRayCastResult = {
//     hit: false,
//     point: null,
//     normal: null,
//     fraction: -1,
//     lastHitTime: -1,
//   };
//
//   rayCastCrashResult: IRayCastResult | null;
//
  constructor(body: Box2D.b2Body, scene: Ph.Scene, rayLength: number = 1, isNose: boolean = false) {
    this.body = body;
    this.scene = scene;
    this.world = body.GetWorld();
    // this.rayLength = rayLength;

    // if (isNose) {
    //   this.rayCastCrashResult = {
    //     hit: false,
    //     point: null,
    //     normal: null,
    //     fraction: -1,
    //     lastHitTime: -1,
    //   };
    // }
  }

//
//   update() {
//     this.reset();
//     const direction: Box2D.b2Vec2 = this.body.GetWorldVector(this.direction); // TODO check whether new reference
//     direction.op_mul(0.5)
//     const pointStart: Box2D.b2Vec2 = this.body.GetWorldPoint(new b2.b2Vec2());
//     const pointEnd: Box2D.b2Vec2 = new b2.b2Vec2(pointStart.x, pointStart.y)
//     pointEnd.op_add(direction);
//     this.world.RayCast(this.callback.bind(this), pointStart, pointEnd); // TODO implement callback class
//
//     if (this.rayCastCrashResult) {
//       const direction: Box2D.b2Vec2 = b2.b2Vec2(this.body.getWorldVector(b2.b2Vec2(1, 0)));
//       const pointStart: Box2D.b2Vec2 = this.body.getWorldPoint(b2.b2Vec2());
//       const pointEnd: Box2D.b2Vec2 = b2.b2Vec2.add(pointStart, b2.b2Vec2.mul(direction, 0.35));
//       this.world.rayCast(pointStart, pointEnd, this.callbackCrash.bind(this));
//     }
//   }
//
//   private callback(fixture, point, normal, fraction) {
//     this.rayCastResult.hit = true;
//     this.rayCastResult.point = point;
//     this.rayCastResult.normal = normal;
//     this.rayCastResult.fraction = fraction;
//     this.rayCastResult.lastHitTime = this.scene.game.getTime();
//     return fraction;
//   }
//
//   private callbackCrash(fixture, point, normal, fraction) {
//     if (!this.rayCastCrashResult) return;
//     this.rayCastCrashResult.hit = true;
//     this.rayCastCrashResult.point = point;
//     this.rayCastCrashResult.normal = normal;
//     this.rayCastCrashResult.fraction = fraction;
//     this.rayCastCrashResult.lastHitTime = this.scene.game.getTime();
//     return fraction;
//   }
//
//   private reset() {
//     this.rayCastResult.hit = false;
//     this.rayCastResult.point = null;
//     this.rayCastResult.normal = null;
//     this.rayCastResult.fraction = -1;
//
//     if (this.rayCastCrashResult) {
//       this.rayCastCrashResult.hit = false;
//       this.rayCastCrashResult.point = null;
//       this.rayCastCrashResult.normal = null;
//       this.rayCastCrashResult.fraction = -1;
//     }
//   }
}


interface ISnowboard {
  numSegments: number;
  segmentLength: number;
  segmentThickness: number;
  segments: Segment[];
  leftBinding?: Box2D.b2Body;
  rightBinding?: Box2D.b2Body;
}


// TODO Add a hat which gets lost once player touches the ground with it.
// TODO Try to add a scarf out of box2d chains and a phaser rope to display it. Could the scarf have some purpose like it does in alto?
// TODO Experiment with an "umbrella mechanic" which will slow down a fall. Could help player cross ravines or not land in other undesirable spots
//      It activates when pressing "up" twice after being in the air for at least 0.5 seconds
//      Maybe instead of umbrella it could be a high tech snowboard feature. Would also make the opposite more plausible when pressing "down"
//      Since we're at it why not add a force shield that player can activate in emergency.
//      Both could be actions which drain the snowboard energy. Player can replenish it by collecting energy packs along the way.
//      OR maybe the snowboard is fueled by "wickedness". It won't work if player stops doing wicked tricks and combos.
// TODO Try to fix the board segment problem by adding hidden Edges underneath board: __[]__[]__[]__
//      When keeping the rectangles there is always a chance that a corner will get stuck. Maybe collision response can be overridden?
//      ---
//      Alternatively try to change segments to circles and add edges connecting them --o--o--o--
//      Circles are probably more reliable. If obstacle hits between circles it will simply collide with the hidden edge.
//      circle bottom should probably not be perfectly aligned with edges, as we want circles to collide first and edges only as backup.
//      ---
//      Another alternative would be to replace rectangles with rectangular polygons with rounded edges.
//      Since the segments don't collide with their neighbours they can overlap. Only the problematic corners need to be rounded.
// TODO Try adjusting the friction depending on how many segments touch the ground. When only 1 segment touches the ground, it means that the snow
//      Is being compressed more and the friction at that point should be higher to motivate player to keep board flat.
//      Reason for this is that I want to introduce a "buttering" mechanic and there needs to be some downsides to constantly buttering around
// TODO Implement Combo System. There will probably be some class which listens to snowman state & actions to keep track of combo counter.
//      Once combo timer runs out. The combo score will be calculated and added to the total score.
// TODO Experiment with "drag". We might want to account for snowboard position in relation to velocity while in air.
interface IRevoluteJointConfig {
  lowerAngle?: number
  upperAngle?: number;
  enableLimit?: true;
}


interface IDistanceJointConfig {
  length?: number
  dampingRatio?: number,
  frequencyHz?: number
}


interface IBodyConfig {
  friction?: number;
  restitution?: number;
  density?: number;
  color?: number;
  linearDamping?: number;
  angularDamping?: number;
  type?: number;
}


//      Maybe airtime is increased while board is positioned correctly. Like an airplane wing. Same for the opposite (might make frontflips less fun)
export class WickedSnowman {
  body: Box2D.b2Body;
  isCrashed: boolean = false;
  lostHead: Boolean;

  jump: number = 280 * 1.0;
  boost: number = 30;

  readonly ZERO: Box2D.b2Vec2 = new b2.b2Vec2(0, 0);

  private cursors: Ph.Types.Input.Keyboard.CursorKeys;
  private readonly scene: Ph.Scene;

  private readonly worldScale: number;
  private readonly world: Box2D.b2World;

  private jointDistLeft: Box2D.b2DistanceJoint;
  private jointDistRight: Box2D.b2DistanceJoint;

  private bindingJointLeft: Box2D.b2DistanceJoint | null;
  private bindingJointRight: Box2D.b2DistanceJoint | null;

  // TODO Maybe create a dedicated Snowboard class for all the related code and logic?
  private board: ISnowboard = {
    numSegments: 10,
    segmentLength: 28 * 1,
    segmentThickness: 28 * 1 * 0.4,
    segments: [],
  };
  private neckJoint: Box2D.b2Joint;

  constructor(scene: Ph.Scene, world: Box2D.b2World, worldScale: number) {
    this.scene = scene;
    this.world = world;
    this.worldScale = worldScale;
  }

  async create() {
    this.cursors = this.scene.input.keyboard.createCursorKeys();

    this.body = this.createBox(0, 0, 0, 50, 50, true);
    this.createBox(100, 100, 0, 50, 50, false);

    const oX = 500;
    const oY = 100;
    const {numSegments, segmentLength, segmentThickness} = this.board;

    // generate board segments...
    const color = 0xD5365E;
    for (let i = 1; i <= this.board.numSegments; i++) {
      // FIXME investigate why thickness is too thin with box2d-wasm but was working with planck-js. Maybe scale everything up to 1m=100px?
      const body = this.createCircle(oX + segmentLength * i, oY, 0, segmentThickness, {color, friction: 0, restitution: 0.1, density: 1});
      // const body = this.createBox(oX + segmentLength * i, oY, 0, segmentLength * 0.9, segmentThickness * 3, true, color);
      this.board.segments.push(new Segment(body, this.scene, 0.5, i === this.board.numSegments));
      // body.GetFixtureList().GetNext().SetFriction(1);

    }
    this.board.leftBinding = this.board.segments[3].body;
    this.board.rightBinding = this.board.segments[6].body;

    const weldConfigs: { dampingRatio: number, frequencyHz: number, referenceAngle: number }[] = [
      {dampingRatio: 0.8, frequencyHz: 0.1, referenceAngle: -0.35},
      {dampingRatio: 0.8, frequencyHz: 0.1, referenceAngle: -0.25},
      {dampingRatio: 0.8, frequencyHz: 0.1, referenceAngle: 0},
      {dampingRatio: 0.8, frequencyHz: 0.1, referenceAngle: 0},
      {dampingRatio: 0.8, frequencyHz: 0.1, referenceAngle: 0},
      {dampingRatio: 0.8, frequencyHz: 0.1, referenceAngle: 0},
      {dampingRatio: 0.8, frequencyHz: 0.1, referenceAngle: 0},
      {dampingRatio: 0.8, frequencyHz: 0.1, referenceAngle: -0.25},
      {dampingRatio: 0.8, frequencyHz: 0.1, referenceAngle: -0.35},
    ];

    // ...weld them together
    for (let i = 0; i < numSegments - 1; i++) {
      const [a, b] = this.board.segments.slice(i, i + 2);
      const anchorAB = new b2.b2Vec2((oX + (segmentLength / 2) + segmentLength * (i + 1)) / this.worldScale, oY / this.worldScale);

      const {dampingRatio, frequencyHz, referenceAngle} = weldConfigs[i];
      const jd = new b2.b2WeldJointDef();
      jd.Initialize(a.body, b.body, anchorAB);
      jd.set_referenceAngle(referenceAngle);
      b2.b2AngularStiffness(jd.stiffness, jd.damping, frequencyHz, dampingRatio, jd.bodyA, jd.bodyB);
      this.world.CreateJoint(jd);

      b2.destroy(jd);
      b2.destroy(anchorAB);
    }

    // // TODO make everything adjust itself when changing bodyRadius. Get rid of hardcoded * 0.6 overrides
    const bodyRadius = 50 * 1;
    const headRadius = bodyRadius * 0.7;
    const legHeight = bodyRadius * 0.7;
    const legWidth = bodyRadius * 0.3;
    const legBodyRadians = 0.5;

    const armHeight = bodyRadius * 0.7;
    const armWidth = bodyRadius * 0.3;

    const bodyColor = 0xC8E1EB;
    const bodyPos = new Ph.Math.Vector2(oX + segmentLength * ((this.board.numSegments / 2) + legBodyRadians), oY - (bodyRadius * 2) - (bodyRadius / 2)); // TODO turn to phaser vec
    const head = this.createCircle(bodyPos.x, bodyPos.y - bodyRadius - headRadius, 0, headRadius, {color: bodyColor} );

    this.body = this.createCircle(bodyPos.x, bodyPos.y, 0, bodyRadius, {color: bodyColor});
    const anchorNeck = this.body.GetWorldPoint(new b2.b2Vec2(0, -1 * bodyRadius / this.worldScale));

    const jd = new b2.b2RevoluteJointDef();
    jd.Initialize(this.body, head, anchorNeck);
    jd.lowerAngle = -0.25;
    jd.upperAngle = 0.25;
    jd.enableLimit = true;
    this.neckJoint = this.world.CreateJoint(jd);

    // TODO implement callback class
    // this.world.on('post-solve', (contact, impulse) => {
    //   if (this.isCrashed && this.lostHead) return;
    //   if (contact.getFixtureA().getBody() === head || contact.getFixtureB().getBody() === head) {
    //     // @ts-ignore
    //     const maxImpulse = Math.max(...impulse.normalImpulses);
    //     if (maxImpulse > 7) {
    //       this.lostHead = true;
    //       this.isCrashed = true;
    //     }
    //   }
    // });
    //
    // -----------------------------------------------------------
    // Leg Left - Upper
    const offsetLengthLUL = (bodyRadius + (legHeight / 1.75));
    const legUpperLeftPos = new Ph.Math.Vector2(0, 1).rotate(legBodyRadians).multiply({x: offsetLengthLUL, y: offsetLengthLUL}).add(bodyPos);
    const legUpperLeft = this.createBox(legUpperLeftPos.x, legUpperLeftPos.y, legBodyRadians, legWidth, legHeight, true);
    const anchorHipLeft = new Ph.Math.Vector2(0, 1).rotate(legBodyRadians).multiply({x: bodyRadius, y: bodyRadius}).add(bodyPos);
    this.createRevoluteJoint(this.body, legUpperLeft, anchorHipLeft.x, anchorHipLeft.y, {lowerAngle: -0.2, upperAngle: 1, enableLimit: true});
    // Leg Left - Lower
    const legLowerLeftPos = new Ph.Math.Vector2(0, 1).rotate(legBodyRadians - 0.25).multiply({x: legHeight, y: legHeight}).add(legUpperLeftPos);
    const legLowerLeft = this.createBox(legLowerLeftPos.x, legLowerLeftPos.y, 0, legWidth, legHeight, true);
    const anchorKneeLeft = new Ph.Math.Vector2(legLowerLeftPos.x, legLowerLeftPos.y).add({x: 0, y: -legHeight / 2});
    this.createRevoluteJoint(legUpperLeft, legLowerLeft, anchorKneeLeft.x, anchorKneeLeft.y, {lowerAngle: -1.5, upperAngle: legBodyRadians * 0.75, enableLimit: true});
    // Leg Left - foot
    const anchorAnkleLeft = new Ph.Math.Vector2(legLowerLeftPos).add({x: 0, y: legHeight / 2});
    this.createRevoluteJoint(legLowerLeft, this.board.leftBinding, anchorAnkleLeft.x, anchorAnkleLeft.y, {});
    // -----------------------------------------------------------
    // Leg Right - Upper
    const offsetLUR = (bodyRadius + (legHeight / 1.75));
    const legUpperRightPos = new Ph.Math.Vector2(0, 1).rotate(-legBodyRadians).multiply({x: offsetLUR, y: offsetLUR}).add(bodyPos);
    const legUpperRight = this.createBox(legUpperRightPos.x, legUpperRightPos.y, -legBodyRadians, legWidth, legHeight, true);
    const anchorHipRight = new Ph.Math.Vector2(0, 1).rotate(-legBodyRadians).multiply({x: bodyRadius, y: bodyRadius}).add(bodyPos);
    this.createRevoluteJoint(this.body, legUpperRight, anchorHipRight.x, anchorHipRight.y, {lowerAngle: -1, upperAngle: 0.2, enableLimit: true});
    // Leg Right - Lower
    const legLowerRightPos = new Ph.Math.Vector2(0, 1).rotate(-legBodyRadians + 0.25).multiply({x: legHeight, y: legHeight}).add(legUpperRightPos);
    const legLowerRight = this.createBox(legLowerRightPos.x, legLowerRightPos.y, 0, legWidth, legHeight, true);
    const anchorKneeRight = new Ph.Math.Vector2(legLowerRightPos.x, legLowerRightPos.y).add({x: 0, y: -legHeight / 2});
    this.createRevoluteJoint(legUpperRight, legLowerRight, anchorKneeRight.x, anchorKneeRight.y, {lowerAngle: -legBodyRadians * 0.75, upperAngle: 1.5, enableLimit: true});
    // Leg Right - foot
    const anchorAnkleRight = new Ph.Math.Vector2(legLowerRightPos).add({x: 0, y: legHeight / 2});
    this.createRevoluteJoint(legLowerRight, this.board.rightBinding, anchorAnkleRight.x, anchorAnkleRight.y, {});
    // -----------------------------------------------------------
    // DISTANCE
    const distanceJointConfig: IDistanceJointConfig = {length: (65 * 1), frequencyHz: 15, dampingRatio: 10};
    // FIXME Since pre v0.1, I swapped left and right bindings accidentally without noticing. I kind of feel like it plays better while swapped. Compare behaviour in detail
    this.jointDistLeft = this.createDistanceJoint(this.body, this.board.rightBinding, anchorHipLeft.x, anchorHipLeft.y, anchorAnkleLeft.x, anchorAnkleLeft.y, distanceJointConfig);
    this.jointDistRight = this.createDistanceJoint(this.body, this.board.leftBinding, anchorHipRight.x, anchorHipRight.y, anchorAnkleRight.x, anchorAnkleRight.y, distanceJointConfig);
    // -----------------------------------------------------------
    // Arm Left - Upper
    const baseRotLeft = (Math.PI / 180) * 90;
    const armBodyLeftRadians = 0.5;
    const offsetAUL = (bodyRadius + (armHeight / 1.75));

    const armUpperLeftPos = new Ph.Math.Vector2(-1, 0).rotate(armBodyLeftRadians).multiply({x: offsetAUL, y: offsetAUL}).add(bodyPos);
    const anchorShoulderLeft = new Ph.Math.Vector2(-1, 0).rotate(armBodyLeftRadians).multiply({x: bodyRadius, y: bodyRadius}).add(bodyPos);
    const armUpperLeft = this.createBox(armUpperLeftPos.x, armUpperLeftPos.y, baseRotLeft + armBodyLeftRadians, armWidth, armHeight, true);
    this.createRevoluteJoint(this.body, armUpperLeft, anchorShoulderLeft.x, anchorShoulderLeft.y, {lowerAngle: -1.25, upperAngle: 0.75, enableLimit: true});
    // // Arm Left - Lower
    // const armLowerLeftDir = new Ph.Math.Vector2(0, 1).rotate(0);
    // const armLowerLeftPos = b2.b2Vec2(armUpperLeft.getWorldPoint(b2.b2Vec2(armLowerLeftDir.x, armLowerLeftDir.y).mul(armHeight / this.worldScale))).mul(this.worldScale);
    // const armLowerLeft = this.createBox(armLowerLeftPos.x, armLowerLeftPos.y, baseRotLeft + armBodyLeftRadians, armWidth, armHeight, true);
    // const anchorElbowLeft = b2.b2Vec2(armLowerLeftPos).add(b2.b2Vec2(armHeight / 1.75, 0)).mul(1 / this.worldScale);
    // this.world.createJoint(Pl.RevoluteJoint({lowerAngle: -0.75, upperAngle: 0.75, enableLimit: true}, armUpperLeft, armLowerLeft, anchorElbowLeft));
    // // -----------------------------------------------------------
    // // Arm Right - Upper
    const baseRotRight = -(Math.PI / 180) * 90;
    const armBodyRightRadians = -0.5;
    const offsetAUR = (bodyRadius + (armHeight / 1.75));

    const armUpperRightPos = new Ph.Math.Vector2(1, 0).rotate(armBodyRightRadians).multiply({x: offsetAUR, y: offsetAUR}).add(bodyPos);
    const anchorShoulderRight = new Ph.Math.Vector2(1, 0).rotate(armBodyRightRadians).multiply({x: bodyRadius, y: bodyRadius}).add(bodyPos);
    const armUpperRight = this.createBox(armUpperRightPos.x, armUpperRightPos.y, baseRotRight + armBodyRightRadians, armWidth, armHeight, true);
    this.createRevoluteJoint(this.body, armUpperRight, anchorShoulderRight.x, anchorShoulderRight.y, {lowerAngle: -0.75, upperAngle: 1.25, enableLimit: true});
    // // Arm Right - Lower
    // const armLowerRightDir = new Ph.Math.Vector2(0, 1).rotate(0);
    // const armLowerRightPos = b2.b2Vec2(armUpperRight.getWorldPoint(b2.b2Vec2(armLowerRightDir.x, armLowerRightDir.y).mul(armHeight / this.worldScale))).mul(this.worldScale);
    // const armLowerRight = this.createBox(armLowerRightPos.x, armLowerRightPos.y, baseRotRight + armBodyRightRadians, armWidth, armHeight, true);
    // const anchorElbowRight = b2.b2Vec2(armLowerRightPos).add(b2.b2Vec2(-armHeight / 1.75, 0)).mul(1 / this.worldScale);
    // this.world.createJoint(Pl.RevoluteJoint({lowerAngle: -0.75, upperAngle: 0.75, enableLimit: true}, armUpperRight, armLowerRight, anchorElbowRight));
    // // -----------------------------------------------------------
  }

  createRevoluteJoint(bodyA: Box2D.b2Body, bodyB: Box2D.b2Body, anchorX: number, anchorY: number, config: IRevoluteJointConfig = {}): Box2D.b2Joint {
    const rjd = new b2.b2RevoluteJointDef();
    const anchor = new b2.b2Vec2(anchorX / this.worldScale, anchorY / this.worldScale);
    rjd.Initialize(bodyA, bodyB, anchor);
    config.lowerAngle && rjd.set_lowerAngle(config.lowerAngle);
    config.upperAngle && rjd.set_upperAngle(config.upperAngle);
    config.enableLimit && rjd.set_enableLimit(config.enableLimit);
    const rj = this.world.CreateJoint(rjd);

    b2.destroy(rjd);
    b2.destroy(anchor);

    return rj;
  }

  createDistanceJoint(bodyA: Box2D.b2Body, bodyB: Box2D.b2Body, anchorAX: number, anchorAY: number, anchorBX: number, anchorBY: number, config: IDistanceJointConfig = {}) {
    const djd = new b2.b2DistanceJointDef();
    const anchorA = new b2.b2Vec2(anchorAX / this.worldScale, anchorAY / this.worldScale);
    const anchorB = new b2.b2Vec2(anchorBX / this.worldScale, anchorBY / this.worldScale);
    djd.Initialize(bodyA, bodyB, anchorA, anchorB);
    // djd.set_length(0);
    // djd.set_length(config.length ? config.length / this.worldScale / 2 : 0.01);
    b2.b2AngularStiffness(djd.stiffness, djd.damping, config.frequencyHz || 5, config.dampingRatio || 0.5, djd.bodyA, djd.bodyB);
    const j = this.world.CreateJoint(djd);

    b2.destroy(djd);
    b2.destroy(anchorA);
    b2.destroy(anchorB);

    const dj = b2.castObject(j, b2.b2DistanceJoint);
    // dj.SetLength(config.length ? config.length / this.worldScale : 0);
    return dj;
  }

  // TODO refactor into util function or turn physics as a whole into a plugin
  createBox(posX: number, posY: number, angle: number, width: number, height: number, isDynamic: boolean = true, color: number = 0xB68750): Box2D.b2Body {
    // (angle / 180) * Math.PI
    const bd = new b2.b2BodyDef();
    bd.set_type(isDynamic ? b2.b2_dynamicBody : b2.b2_staticBody);
    bd.set_position(new b2.b2Vec2(posX / this.worldScale, posY / this.worldScale));
    bd.set_linearDamping(0.15);
    bd.set_angularDamping(0.1);
    bd.set_angle(angle);
    const body = this.world.CreateBody(bd);

    // const shape = new b2.b2PolygonShape();
    // shape.SetAsBox(width / this.worldScale / 2, height / this.worldScale / 2);
    // body.CreateFixture(shape, 1); // TODO create from def

    const chainShape = new b2.b2ChainShape();
    const vtl = new b2.b2Vec2(posX - width / 2, posY - height / 2);
    const vtr = new b2.b2Vec2(posX + width / 2, posY - height / 2);
    const vbr = new b2.b2Vec2(posX + width / 2, posY + height / 2);
    const vbl = new b2.b2Vec2(posX - width / 2, posY + height / 2);
    // @ts-ignore
    // chainShape.CreateLoop([vtl, vtr, vbr, vbl], 4); // TODO type wrong
    chainShape.CreateLoop([vtl, vbl, vbr, vtr], 4); // TODO type wrong

    const fd = new b2.b2FixtureDef();
    fd.shape = chainShape;
    fd.density = 1;
    body.CreateFixture(fd);



    const massData = new b2.b2MassData();
    massData.set_mass(0.5);
    massData.set_center(this.ZERO);
    massData.set_I(1);
    body.SetMassData(massData);

    let userData = this.scene.add.graphics();
    userData.fillStyle(color);
    userData.fillRect(-width / 2, -height / 2, width, height);
    // @ts-ignore
    body.userData = userData;

    b2.destroy(bd);
    b2.destroy(chainShape);
    b2.destroy(massData);

    return body;
  }

  createCircle(posX: number, posY: number, angle: number, radius: number, config: IBodyConfig = {}): Box2D.b2Body {
    const bd = new b2.b2BodyDef();
    bd.set_type(config.type || b2.b2_dynamicBody);
    bd.set_position(new b2.b2Vec2(posX / this.worldScale, posY / this.worldScale));
    bd.set_linearDamping(config.linearDamping || 0.15);
    bd.set_angularDamping(config.angularDamping || 0.1);
    const body = this.world.CreateBody(bd);

    const circle = new b2.b2CircleShape();
    circle.set_m_radius(radius / this.worldScale);

    const fd = new b2.b2FixtureDef();
    fd.set_shape(circle);
    config.friction && fd.set_friction(0.5);
    config.restitution && fd.set_restitution(0.1);
    config.density && fd.set_density(1);

    body.CreateFixture(fd);

    const massData = new b2.b2MassData();
    massData.set_mass(1);
    massData.set_center(this.ZERO);
    massData.set_I(1);
    body.SetMassData(massData);

    const userData = this.scene.add.graphics();
    userData.fillStyle(config.color || 0xF3D9F4);
    userData.fillCircle(0, 0, radius);
    // @ts-ignore
    body.userData = userData;

    b2.destroy(bd);
    b2.destroy(fd);
    b2.destroy(circle);
    b2.destroy(massData);

    return body;
  }

  private setDistanceLegs(lengthLeft?: number, lengthRight?: number): void {
    if (this.jointDistLeft && lengthLeft) {
      console.log('set Distance left');
      this.jointDistLeft.SetLength(lengthLeft * 1 / this.worldScale);
    }

    if (this.jointDistRight && lengthRight) {
      console.log('set Distance right');
      this.jointDistRight.SetLength((lengthRight * 1) / this.worldScale);
    }
  }

  // TODO make update() method a bit more readable. Not sure whether to make the overall control flow event-based yet.
  update() {
    // this.board.segments.forEach(s => s.update());
    //
    // // TODO refactor to check for max impulse (similar for head) in addition to raycast result
    // const nose = this.board.segments[this.board.segments.length - 1];
    // if (nose.rayCastCrashResult?.hit) {
    //   this.bindingJointLeft && this.world.destroyJoint(this.bindingJointLeft);
    //   this.bindingJointRight && this.world.destroyJoint(this.bindingJointRight);
    //   this.jointDistLeft && this.world.destroyJoint(this.jointDistLeft);
    //   this.jointDistRight && this.world.destroyJoint(this.jointDistRight);
    //   nose.body.setLinearVelocity(b2.b2Vec2(-50, 0));
    //   this.isCrashed = true;
    // }
    //
    // if (this.lostHead && this.neckJoint) {
    //   this.world.destroyJoint(this.neckJoint);
    //   this.neckJoint = null;
    // }
    //
    // if (this.getTimeInAir() > 150) {
    //   this.setDistanceLegs({length: 50 / this.worldScale}, {length: 60 / this.worldScale});
    // }
    //
    // if (this.cursors.up.isDown && this.scene.game.getTime() - this.cursors.up.timeDown <= 300) {
    //   // TODO prevent player from mashing jump button rapidly by throttling it based on timeUp - timeDown
    //   // TODO verify whether we can get any info on how "loaded" the weld joints are and if they can be used as a variable for the jump strength
    //   this.setDistanceLegs({length: 80 / this.worldScale}, {length: 80 / this.worldScale});
    //   const hits = this.board.segments.map(s => s.rayCastResult.hit);
    //   const isTailGrounded = hits[0];
    //   const isNoseGrounded = hits[hits.length - 1];
    //   const isCenterGrounded = hits[4] || hits[5] || hits[6];
    //
    //   const mod = isCenterGrounded ? 0.6 : 1;
    //   let force: b2.b2Vec2 | null = null;
    //   if (isTailGrounded && !isNoseGrounded) force = b2.b2Vec2(0, -this.jump * mod);
    //   else if (isNoseGrounded && !isTailGrounded) force = this.body.getWorldVector(b2.b2Vec2(0, -this.jump * mod));
    //   else if (isCenterGrounded) force = b2.b2Vec2(0, -this.jump / 2.8);
    //   force && this.body.applyForceToCenter(force, true);
    // }
    //
    //       this.body.ApplyForceToCenter(new b2.b2Vec2(5, 0), true);

       if (this.cursors.left.isDown) {
      this.body.ApplyAngularImpulse(-40, true); // TODO add isInAir check back in
      this.setDistanceLegs(50, 80);
    }

    if (this.cursors.right.isDown) {
      this.body.ApplyAngularImpulse(40, true); // TODO add isInAir check back in
      this.setDistanceLegs(80, 50);
    }


    if (!this.isCrashed) {
      const mod = 4;
      // const mod = this.isInAir() ? 0.9 : 1;
      this.board.segments && this.board.segments[4].body.ApplyForceToCenter(new b2.b2Vec2(this.boost * mod, 0), true);
      this.body.ApplyForceToCenter(new b2.b2Vec2(this.boost * mod, 0), true); // TODO destroy vec2s
    }

    if (this.cursors.down.isDown) {
      console.log('down');
      // this.body.ApplyForceToCenter(new b2.b2Vec2(0, 10), true);
      this.setDistanceLegs(0.1, 0.1);
    }
  }

  //
  // getTimeInAir(): number {
  //   if (this.board.segments.some(s => s.rayCastResult.hit)) return -1;
  //   const mostRecentHit = Math.max(...this.board.segments.map(s => s.rayCastResult.lastHitTime));
  //   return this.scene.game.getTime() - mostRecentHit;
  // }
  //
  // isInAir(): boolean {
  //   return this.getTimeInAir() !== -1;
  // }
}



//     if (this.cursors.left.isDown) {
//       this.body.ApplyForceToCenter(new b2.b2Vec2(-35, 0), true);
//     }
//
//     if (this.cursors.right.isDown) {
//       this.body.ApplyForceToCenter(new b2.b2Vec2(35, 0), true);
//     }
//
//     if (this.cursors.down.isDown) {
//       this.body.ApplyForceToCenter(new b2.b2Vec2(0, 35), true);
//     }
//
//     if (this.cursors.up.isDown) {
//       this.body.ApplyForceToCenter(new b2.b2Vec2(0, -35), true);
//     }
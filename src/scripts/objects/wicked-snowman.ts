import * as Ph from 'phaser';
import * as Pl from 'planck-js';

// TODO
//  - add mobile controls (use touchscreen areas to replace WASD. E.g If player touches left or right snowman leans left or right)
//  -

interface IRayCastResult {
  hit: boolean;
  point: Pl.Vec2 | null | undefined;
  normal: Pl.Vec2 | null | undefined;
  fraction: number;
  lastHitTime: number;
}


class Segment {
  scene: Ph.Scene;
  world: Pl.World;
  body: Pl.Body;

  rayLength: number;

  direction: Pl.Vec2 = Pl.Vec2(0, 1);
  rayCastResult: IRayCastResult = {
    hit: false,
    point: null,
    normal: null,
    fraction: -1,
    lastHitTime: -1,
  };

  rayCastCrashResult: IRayCastResult | null;

  constructor(body: Pl.Body, scene: Ph.Scene, rayLength: number = 1, isNose: boolean = false) {
    this.body = body;
    this.scene = scene;
    this.world = body.getWorld();
    this.rayLength = rayLength;

    if (isNose) {
      this.rayCastCrashResult = {
        hit: false,
        point: null,
        normal: null,
        fraction: -1,
        lastHitTime: -1,
      };
    }
  }

  update() {
    this.reset();
    const direction: Pl.Vec2 = Pl.Vec2(this.body.getWorldVector(this.direction));
    const pointStart: Pl.Vec2 = this.body.getWorldPoint(Pl.Vec2());
    const pointEnd: Pl.Vec2 = Pl.Vec2.add(pointStart, Pl.Vec2.mul(direction, 0.5));
    this.world.rayCast(pointStart, pointEnd, this.callback.bind(this));

    if (this.rayCastCrashResult) {
      const direction: Pl.Vec2 = Pl.Vec2(this.body.getWorldVector(Pl.Vec2(1, 0)));
      const pointStart: Pl.Vec2 = this.body.getWorldPoint(Pl.Vec2());
      const pointEnd: Pl.Vec2 = Pl.Vec2.add(pointStart, Pl.Vec2.mul(direction, 0.35));
      this.world.rayCast(pointStart, pointEnd, this.callbackCrash.bind(this));
    }
  }

  private callback(fixture, point, normal, fraction) {
    this.rayCastResult.hit = true;
    this.rayCastResult.point = point;
    this.rayCastResult.normal = normal;
    this.rayCastResult.fraction = fraction;
    this.rayCastResult.lastHitTime = this.scene.game.getTime();
    return fraction;
  }

  private callbackCrash(fixture, point, normal, fraction) {
    if (!this.rayCastCrashResult) return;
    this.rayCastCrashResult.hit = true;
    this.rayCastCrashResult.point = point;
    this.rayCastCrashResult.normal = normal;
    this.rayCastCrashResult.fraction = fraction;
    this.rayCastCrashResult.lastHitTime = this.scene.game.getTime();
    return fraction;
  }

  private reset() {
    this.rayCastResult.hit = false;
    this.rayCastResult.point = null;
    this.rayCastResult.normal = null;
    this.rayCastResult.fraction = -1;

    if (this.rayCastCrashResult) {
      this.rayCastCrashResult.hit = false;
      this.rayCastCrashResult.point = null;
      this.rayCastCrashResult.normal = null;
      this.rayCastCrashResult.fraction = -1;
    }
  }
}


interface ISnowboard {
  numSegments: number;
  segmentLength: number;
  segmentThickness: number;
  segments: Segment[];
  leftBinding?: Pl.Body;
  rightBinding?: Pl.Body;
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
//      Maybe airtime is increased while board is positioned correctly. Like an airplane wing. Same for the opposite (might make frontflips less fun)
export class WickedSnowman {
  body: Pl.Body;
  isCrashed: boolean = false;
  lostHead: Boolean;

  jump: number = 180;
  boost: number = 27.5;

  private cursors: Ph.Types.Input.Keyboard.CursorKeys;
  private readonly scene: Ph.Scene;

  private readonly worldScale: number;
  private readonly world: Pl.World;

  private jointDistLeft: Pl.DistanceJoint | null;
  private jointDistRight: Pl.DistanceJoint | null;

  private bindingJointLeft: Pl.RevoluteJoint | null;
  private bindingJointRight: Pl.RevoluteJoint | null;

  // TODO Maybe create a dedicated Snowboard class for all the related code and logic?
  private board: ISnowboard = {
    numSegments: 10,
    segmentLength: 8.4,
    segmentThickness: 3.375,
    segments: [],
  };
  private neckJoint: Pl.RevoluteJoint | null;

  constructor(scene: Ph.Scene, world: Pl.World, worldScale: number) {
    this.scene = scene;
    this.world = world;
    this.worldScale = worldScale;
  }

  async create() {
    this.cursors = this.scene.input.keyboard.createCursorKeys();

    const oX = 250;
    const oY = 50;
    const {numSegments, segmentLength, segmentThickness} = this.board;

    // generate board segments...
    const color = 0xD5365E;
    for (let i = 1; i <= this.board.numSegments; i++) {
      const body = this.createBox(oX + segmentLength * i, oY, 0, segmentLength, segmentThickness, true, color);
      this.board.segments.push(new Segment(body, this.scene, 0.5, i === this.board.numSegments));
      body.getFixtureList()?.getNext()?.setFriction(1);

    }
    this.board.leftBinding = this.board.segments[3].body;
    this.board.rightBinding = this.board.segments[6].body;

    const weldConfigs: Pl.WeldJointOpt[] = [
      {dampingRatio: 0.5, frequencyHz: 5, referenceAngle: -0.35},
      {dampingRatio: 0.5, frequencyHz: 5, referenceAngle: -0.25},
      {dampingRatio: 0.5, frequencyHz: 6, referenceAngle: 0},
      {dampingRatio: 0.5, frequencyHz: 7, referenceAngle: 0},
      {dampingRatio: 0.5, frequencyHz: 10, referenceAngle: 0},
      {dampingRatio: 0.5, frequencyHz: 7, referenceAngle: 0},
      {dampingRatio: 0.5, frequencyHz: 6, referenceAngle: 0},
      {dampingRatio: 0.5, frequencyHz: 5, referenceAngle: -0.25},
      {dampingRatio: 0.5, frequencyHz: 5, referenceAngle: -0.35},
    ];

    // ...weld them together
    for (let i = 0; i < numSegments - 1; i++) {
      const [a, b] = this.board.segments.slice(i, i + 2);
      const anchorAB = Pl.Vec2((oX + (segmentLength / 2) + segmentLength * (i + 1)) / this.worldScale, oY / this.worldScale);
      this.world.createJoint(Pl.WeldJoint(weldConfigs[i], a.body, b.body, anchorAB));
    }

    const bodyRadius = this.worldScale;
    const headRadius = bodyRadius * 0.7;
    const legHeight = bodyRadius * 0.7;
    const legWidth = bodyRadius * 0.3;
    const legBodyRadians = 0.5;

    const armHeight = legHeight;
    const armWidth = legWidth;

    const bodyPos = Pl.Vec2(oX + segmentLength * ((this.board.numSegments / 2) + legBodyRadians), oY - (bodyRadius * 2) - (bodyRadius / 2));
    const head = this.createCircle(bodyPos.x, bodyPos.y - bodyRadius - headRadius, 0, headRadius, true, 0xC8E1EB);

    this.body = this.createCircle(bodyPos.x, bodyPos.y, 0, bodyRadius, true, 0xC8E1EB);
    const anchorNeck = this.body.getWorldPoint(Pl.Vec2(0, -1).mul(bodyRadius / this.worldScale));
    this.neckJoint = this.world.createJoint(Pl.RevoluteJoint({lowerAngle: -0.25, upperAngle: 0.25, enableLimit: true}, this.body, head, anchorNeck));

    this.world.on('post-solve', (contact, impulse) => {
      if (this.isCrashed && this.lostHead) return;
      if (contact.getFixtureA().getBody() === head || contact.getFixtureB().getBody() === head) {
        // @ts-ignore
        const maxImpulse = Math.max(...impulse.normalImpulses);
        if (maxImpulse > 7) {
          this.lostHead = true;
          this.isCrashed = true;
        }
      }
    });

    // -----------------------------------------------------------
    // Leg Left - Upper
    const legUpperLeftDir = new Ph.Math.Vector2(0, 1).rotate(legBodyRadians);
    const legUpperLeftPos = this.body.getWorldPoint(Pl.Vec2(legUpperLeftDir.x, legUpperLeftDir.y).mul((bodyRadius + (legHeight / 1.75)) / this.worldScale)).mul(this.worldScale);
    const legUpperLeft = this.createBox(legUpperLeftPos.x, legUpperLeftPos.y, legBodyRadians, legWidth, legHeight, true);
    const anchorHipLeft = this.body.getWorldPoint(Pl.Vec2(legUpperLeftDir.x, legUpperLeftDir.y).mul(bodyRadius / this.worldScale));
    this.world.createJoint(Pl.RevoluteJoint({lowerAngle: -0.2, upperAngle: 1, enableLimit: true}, this.body, legUpperLeft, anchorHipLeft));
    // Leg Left - Lower
    const legLowerLeftDir = new Ph.Math.Vector2(0, 1).rotate(-0.25);
    const legLowerLeftPos = Pl.Vec2(legUpperLeft.getWorldPoint(Pl.Vec2(legLowerLeftDir.x, legLowerLeftDir.y).mul(legHeight / this.worldScale))).mul(this.worldScale);
    const legLowerLeft = this.createBox(legLowerLeftPos.x, legLowerLeftPos.y, 0, legWidth, legHeight, true);
    const anchorKneeLeft = Pl.Vec2(legLowerLeftPos).add(Pl.Vec2(0, -legHeight / 2)).mul(1 / this.worldScale);
    this.world.createJoint(Pl.RevoluteJoint({lowerAngle: -1.5, upperAngle: legBodyRadians * 0.75, enableLimit: true}, legUpperLeft, legLowerLeft, anchorKneeLeft));
    // Leg Left - foot
    const anchorAnkleLeft = Pl.Vec2(legLowerLeftPos).add(Pl.Vec2(0, legHeight / 2)).mul(1 / this.worldScale);
    this.bindingJointLeft = this.world.createJoint(Pl.RevoluteJoint({}, legLowerLeft, this.board.leftBinding, anchorAnkleLeft));
    // -----------------------------------------------------------
    // Leg Right - Upper
    const legUpperRightDir = new Ph.Math.Vector2(0, 1).rotate(-legBodyRadians);
    const legUpperRightPos = this.body.getWorldPoint(Pl.Vec2(legUpperRightDir.x, legUpperRightDir.y).mul((bodyRadius + (legHeight / 1.75)) / this.worldScale)).mul(this.worldScale);
    const legUpperRight = this.createBox(legUpperRightPos.x, legUpperRightPos.y, -legBodyRadians, legWidth, legHeight, true);
    const anchorHipRight = this.body.getWorldPoint(Pl.Vec2(legUpperRightDir.x, legUpperRightDir.y).mul(bodyRadius / this.worldScale));
    this.world.createJoint(Pl.RevoluteJoint({lowerAngle: -1, upperAngle: 0.2, enableLimit: true}, this.body, legUpperRight, anchorHipRight));
    // Leg Right - Lower
    const LegLowerRightDir = new Ph.Math.Vector2(0, 1).rotate(0.25);
    const legLowerRightPos = Pl.Vec2(legUpperRight.getWorldPoint(Pl.Vec2(LegLowerRightDir.x, LegLowerRightDir.y).mul(legHeight / this.worldScale))).mul(this.worldScale);
    const legLowerRight = this.createBox(legLowerRightPos.x, legLowerRightPos.y, 0, legWidth, legHeight, true);
    const anchorKneeRight = Pl.Vec2(legLowerRightPos).add(Pl.Vec2(0, -legHeight / 2)).mul(1 / this.worldScale);
    this.world.createJoint(Pl.RevoluteJoint({lowerAngle: -legBodyRadians * 0.75, upperAngle: 1.5, enableLimit: true}, legUpperRight, legLowerRight, anchorKneeRight));
    // Leg Right - foot
    const anchorAnkleRight = Pl.Vec2(legLowerRightPos).add(Pl.Vec2(0, legHeight / 2)).mul(1 / this.worldScale);
    this.bindingJointRight = this.world.createJoint(Pl.RevoluteJoint({}, legLowerRight, this.board.rightBinding, anchorAnkleRight));
    // -----------------------------------------------------------
    // DISTANCE
    // FIXME Since pre v0.1, I swapped left and right bindings accidentally without noticing. I kind of feel like it plays better while swapped. Compare behaviour in detail
    this.jointDistLeft = this.world.createJoint(Pl.DistanceJoint({length: (this.worldScale * 1.3) / this.worldScale, frequencyHz: 15, dampingRatio: 10}, this.body, this.board.rightBinding, anchorHipLeft, anchorAnkleLeft));
    this.jointDistRight = this.world.createJoint(Pl.DistanceJoint({length: (this.worldScale * 1.3) / this.worldScale, frequencyHz: 15, dampingRatio: 10}, this.body, this.board.leftBinding, anchorHipRight, anchorAnkleRight));
    // -----------------------------------------------------------
    // Arm Left - Upper
    const baseRotLeft = (Math.PI / 180) * 90;
    const armBodyLeftRadians = 0.5;
    const armUpperLeftDir = new Ph.Math.Vector2(-1, 0).rotate(armBodyLeftRadians);
    const armUpperLeftPos = this.body.getWorldPoint(Pl.Vec2(armUpperLeftDir.x, armUpperLeftDir.y).mul((bodyRadius + (armHeight / 1.75)) / this.worldScale)).mul(this.worldScale);
    const armUpperLeft = this.createBox(armUpperLeftPos.x, armUpperLeftPos.y, baseRotLeft + armBodyLeftRadians, armWidth, armHeight, true);
    const anchorShoulderLeft = this.body.getWorldPoint(Pl.Vec2(armUpperLeftDir.x, armUpperLeftDir.y).mul(bodyRadius / this.worldScale));
    this.world.createJoint(Pl.RevoluteJoint({lowerAngle: -1.25, upperAngle: 0.75, enableLimit: true}, this.body, armUpperLeft, anchorShoulderLeft));
    // Arm Left - Lower
    const armLowerLeftDir = new Ph.Math.Vector2(0, 1).rotate(0);
    const armLowerLeftPos = Pl.Vec2(armUpperLeft.getWorldPoint(Pl.Vec2(armLowerLeftDir.x, armLowerLeftDir.y).mul(armHeight / this.worldScale))).mul(this.worldScale);
    const armLowerLeft = this.createBox(armLowerLeftPos.x, armLowerLeftPos.y, baseRotLeft + armBodyLeftRadians, armWidth, armHeight, true);
    const anchorElbowLeft = Pl.Vec2(armLowerLeftPos).add(Pl.Vec2(armHeight / 1.75, 0)).mul(1 / this.worldScale);
    this.world.createJoint(Pl.RevoluteJoint({lowerAngle: -0.75, upperAngle: 0.75, enableLimit: true}, armUpperLeft, armLowerLeft, anchorElbowLeft));
    // -----------------------------------------------------------
    // Arm Right - Upper
    const baseRotRight = -(Math.PI / 180) * 90;
    const armBodyRightRadians = -0.5;
    const armUpperRightDir = new Ph.Math.Vector2(1, 0).rotate(armBodyRightRadians);
    const armUpperRightPos = this.body.getWorldPoint(Pl.Vec2(armUpperRightDir.x, armUpperRightDir.y).mul((bodyRadius + (armHeight / 1.75)) / this.worldScale)).mul(this.worldScale);
    const armUpperRight = this.createBox(armUpperRightPos.x, armUpperRightPos.y, baseRotRight + armBodyRightRadians, armWidth, armHeight, true);
    const anchorShoulderRight = this.body.getWorldPoint(Pl.Vec2(armUpperRightDir.x, armUpperRightDir.y).mul(bodyRadius / this.worldScale));
    this.world.createJoint(Pl.RevoluteJoint({lowerAngle: -0.75, upperAngle: 1.25, enableLimit: true}, this.body, armUpperRight, anchorShoulderRight));
    // Arm Right - Lower
    const armLowerRightDir = new Ph.Math.Vector2(0, 1).rotate(0);
    const armLowerRightPos = Pl.Vec2(armUpperRight.getWorldPoint(Pl.Vec2(armLowerRightDir.x, armLowerRightDir.y).mul(armHeight / this.worldScale))).mul(this.worldScale);
    const armLowerRight = this.createBox(armLowerRightPos.x, armLowerRightPos.y, baseRotRight + armBodyRightRadians, armWidth, armHeight, true);
    const anchorElbowRight = Pl.Vec2(armLowerRightPos).add(Pl.Vec2(-armHeight / 1.75, 0)).mul(1 / this.worldScale);
    this.world.createJoint(Pl.RevoluteJoint({lowerAngle: -0.75, upperAngle: 0.75, enableLimit: true}, armUpperRight, armLowerRight, anchorElbowRight));
    // -----------------------------------------------------------
  }

  // TODO refactor into util function or turn physics as a whole into a plugin
  createBox(posX: number, posY: number, angle: number, width: number, height: number, isDynamic: boolean, color: number = 0xB68750): Pl.Body {
    // (angle / 180) * Math.PI
    const body = this.world.createBody({angle: angle, linearDamping: 0.15, angularDamping: 0.1});
    if (isDynamic) body.setDynamic();
    body.createFixture(Pl.Box(width / 2 / this.worldScale, height / 2 / this.worldScale), {friction: 0.001, restitution: 0.005, density: 0.1, isSensor: false});
    body.setPosition(Pl.Vec2(posX / this.worldScale, posY / this.worldScale));
    body.setMassData({mass: 0.5, center: Pl.Vec2(), I: 1});

    let userData = this.scene.add.graphics();
    userData.fillStyle(color);
    userData.fillRect(-width / 2, -height / 2, width, height);
    body.setUserData(userData);
    return body;
  }

  // TODO introduce the concept of "materials" (metal, wood, Flesh, balloon) with different properties
  createCircle(posX: number, posY: number, angle: number, radius: number, isDynamic: boolean, color: number = 0xF3D9F4): Pl.Body {
    const body = this.world.createBody({angle: (angle / 360) * Math.PI, linearDamping: 0.15, angularDamping: 0.1});
    if (isDynamic) body.setDynamic();
    body.createFixture(Pl.Circle(radius / this.worldScale), {friction: 0.5, restitution: 0.1, density: 1});
    body.setPosition(Pl.Vec2(posX / this.worldScale, posY / this.worldScale));
    body.setMassData({mass: 1, center: Pl.Vec2(), I: 1});

    const userData = this.scene.add.graphics();
    userData.fillStyle(color);
    userData.fillCircle(0, 0, radius);
    body.setUserData(userData);
    return body;
  }

  private setDistanceLegs(optionsLeft?: Pl.DistanceJointOpt, optionsRight?: Pl.DistanceJointOpt): void {
    if (this.jointDistLeft && optionsLeft) {
      const {length, frequencyHz, dampingRatio} = optionsLeft;
      length && this.jointDistLeft?.setLength(length * 0.6);
      frequencyHz && this.jointDistLeft?.setFrequency(frequencyHz);
      dampingRatio && this.jointDistLeft?.setDampingRatio(dampingRatio);
    }

    if (this.jointDistRight && optionsRight) {
      const {length, frequencyHz, dampingRatio} = optionsRight;
      length && this.jointDistRight?.setLength(length * 0.6);
      frequencyHz && this.jointDistRight?.setFrequency(frequencyHz);
      dampingRatio && this.jointDistRight?.setDampingRatio(dampingRatio);
    }
  }

  // TODO make update() method a bit more readable. Not sure whether to make the overall control flow event-based yet.
  update() {
    this.board.segments.forEach(s => s.update());

    // TODO refactor to check for max impulse (similar for head) in addition to raycast result
    const nose = this.board.segments[this.board.segments.length - 1];
    if (nose.rayCastCrashResult?.hit) {
      this.bindingJointLeft && this.world.destroyJoint(this.bindingJointLeft);
      this.bindingJointRight && this.world.destroyJoint(this.bindingJointRight);
      this.jointDistLeft && this.world.destroyJoint(this.jointDistLeft);
      this.jointDistRight && this.world.destroyJoint(this.jointDistRight);
      nose.body.setLinearVelocity(Pl.Vec2(-50, 0));
      this.isCrashed = true;
    }

    if (this.lostHead && this.neckJoint) {
      this.world.destroyJoint(this.neckJoint);
      this.neckJoint = null;
    }

    if (this.getTimeInAir() > 150) {
      this.setDistanceLegs({length: 25 / this.worldScale}, {length: 30 / this.worldScale});
    }

    if (this.cursors.up.isDown && this.scene.game.getTime() - this.cursors.up.timeDown <= 300) {
      // TODO prevent player from mashing jump button rapidly by throttling it based on timeUp - timeDown
      // TODO verify whether we can get any info on how "loaded" the weld joints are and if they can be used as a variable for the jump strength
      this.setDistanceLegs({length: 40 / this.worldScale}, {length: 40 / this.worldScale});
      const hits = this.board.segments.map(s => s.rayCastResult.hit);
      const isTailGrounded = hits[0];
      const isNoseGrounded = hits[hits.length - 1];
      const isCenterGrounded = hits[4] || hits[5] || hits[6];

      const mod = isCenterGrounded ? 0.6 : 1;
      let force: Pl.Vec2 | null = null;
      if (isTailGrounded && !isNoseGrounded) force = Pl.Vec2(0, -this.jump * mod);
      else if (isNoseGrounded && !isTailGrounded) force = this.body.getWorldVector(Pl.Vec2(0, -this.jump * mod));
      else if (isCenterGrounded) force = Pl.Vec2(0, -this.jump / 2.8);
      force && this.body.applyForceToCenter(force, true);
    }

    if (this.cursors.left.isDown) {
      this.body.applyAngularImpulse(this.isInAir() ? -3 : -4);
      this.setDistanceLegs({length: 27.5 / this.worldScale}, {length: 40 / this.worldScale});
    }

    if (this.cursors.right.isDown) {
      this.body.applyAngularImpulse(this.isInAir() ? 3 : 4);
      this.setDistanceLegs({length: 40 / this.worldScale}, {length: 27.5 / this.worldScale});
    }

    if (!this.isCrashed) {
      const mod = this.isInAir() ? 0.9 : 1;
      this.board.segments && this.board.segments[4].body.applyForceToCenter(Pl.Vec2(this.boost * mod, 0), true);
      this.body.applyForceToCenter(Pl.Vec2(this.boost * mod, 0), true);
    }

    if (this.cursors.down.isDown) {
      this.body.applyForceToCenter(Pl.Vec2(0, 10));
      this.setDistanceLegs({length: 25 / this.worldScale}, {length: 25 / this.worldScale});
    }
  }

  getTimeInAir(): number {
    if (this.board.segments.some(s => s.rayCastResult.hit)) return -1;
    const mostRecentHit = Math.max(...this.board.segments.map(s => s.rayCastResult.lastHitTime));
    return this.scene.game.getTime() - mostRecentHit;
  }

  isInAir(): boolean {
    return this.getTimeInAir() !== -1;
  }
}

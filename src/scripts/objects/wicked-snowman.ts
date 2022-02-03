import * as Ph from 'phaser';
import * as Pl from '@box2d/core';
import {IDistanceJointConfig, Physics} from './physics';
import {ComboComponent} from './combo-system';
import {WickedSnowboard} from './snowboard';


export class WickedSnowman {
  debug: boolean = false; // TODO make this toggleable
  body: Pl.b2Body;
  isCrashed: boolean = false;
  lostHead: Boolean;

  crashIgnoredBodies: Pl.b2Body[] = [];
  readonly scene: Ph.Scene;
  readonly b2Physics: Physics;
  private readonly cursors: Ph.Types.Input.Keyboard.CursorKeys;

  private readonly boostForce: number = 27.5;
  private readonly jumpForce: number = 300;
  private readonly boostVector: Pl.b2Vec2 = new Pl.b2Vec2(0, 0);
  private readonly jumpVector: Pl.b2Vec2 = new Pl.b2Vec2(0, 0);

  readonly bodyRadius: number;
  private readonly legMinLength;
  private readonly legMaxLength;

  private neckJoint: Pl.b2RevoluteJoint | null;
  private jointDistLeft: Pl.b2DistanceJoint | null;
  private jointDistRight: Pl.b2DistanceJoint | null;
  private bindingJointLeft: Pl.b2RevoluteJoint | null;
  private bindingJointRight: Pl.b2RevoluteJoint | null;

  private board: WickedSnowboard;

  private readonly comboComponent: ComboComponent;

  constructor(scene: Ph.Scene, b2Physics: Physics) {
    this.scene = scene;
    this.b2Physics = b2Physics;
    this.bodyRadius = b2Physics.worldScale;
    this.legMinLength = this.bodyRadius;
    this.legMaxLength = this.legMinLength * 1.6;

    this.cursors = this.scene.input.keyboard.createCursorKeys();

    const oX = 250;
    const oY = 50;
    this.board = new WickedSnowboard(this, oX, oY);
    this.generateSnowmanBody(oX, oY);
    this.comboComponent = new ComboComponent(this);
  }

  update() {
    this.comboComponent.update();
    this.isCrashed && this.detachBoard(); // joints cannot be destroyed within post-solve callback
    this.lostHead && this.detachHead(); // joints cannot be destroyed within post-solve callback
    this.getTimeInAir() > 100 && this.resetLegs();

    if (!this.isCrashed) {
      this.board.update();

      // Touch/Mouse input
      if (this.scene.input.activePointer?.isDown) {
        const pointer = this.scene.input.activePointer; // activePointer undefined until after first touch input
        pointer.motionFactor = 0.2;
        this.scene.input.activePointer.x < this.scene.cameras.main.width / 2 ? this.leanBackward() : this.leanForward();
        pointer.velocity.y < -30 && this.scene.game.getTime() - pointer.moveTime <= 300 && this.jump();
      } else {
        this.scene.input.activePointer.motionFactor = 0.8;
      }

      // Keyboard input
      this.cursors.up.isDown && this.scene.game.getTime() - this.cursors.up.timeDown <= 300 && this.jump();
      this.cursors.left.isDown && this.leanBackward();
      this.cursors.right.isDown && this.leanForward();
      this.cursors.down.isDown && this.leanCenter();
      this.boost();
    }
  }

  getTimeInAir(): number {
    return this.board.getTimeInAir();
  }

  isInAir(): boolean {
    return this.board.isInAir();
  }

  private detachBoard() {
    this.bindingJointLeft && this.b2Physics.world.DestroyJoint(this.bindingJointLeft);
    this.bindingJointRight && this.b2Physics.world.DestroyJoint(this.bindingJointRight);
    this.jointDistLeft && this.b2Physics.world.DestroyJoint(this.jointDistLeft);
    this.jointDistRight && this.b2Physics.world.DestroyJoint(this.jointDistRight);
    this.jointDistRight && this.board.segments[this.board.segments.length - 1].body.SetLinearVelocity(Pl.b2Vec2.ZERO);
  }

  private detachHead() {
    this.neckJoint && this.b2Physics.world.DestroyJoint(this.neckJoint);
    this.neckJoint = null;
  }

  private boost() {
    const mod = this.isInAir() ? 0.6 : 0.9;
    const boostVector = this.boostVector;
    boostVector.Set(this.boostForce * mod + this.comboComponent.comboBoost, 0);
    this.board.segments && this.board.segments[4].body.ApplyForceToCenter(boostVector, true);
    this.body.ApplyForceToCenter(boostVector, true);
  }

  private resetLegs() {
    this.setDistanceLegs(this.legMinLength, this.legMinLength);
  }

  private leanBackward() {
    this.body.ApplyAngularImpulse(this.isInAir() ? -3 : -5);
    this.setDistanceLegs(this.legMinLength, this.legMaxLength);
  }

  private leanForward() {
    this.body.ApplyAngularImpulse(this.isInAir() ? 3 : 5);
    this.setDistanceLegs(this.legMaxLength, this.legMinLength);
  }

  private leanCenter() {
    // TODO if wicked meter isn't empty, consume boost similar to SSX
    this.body.ApplyForceToCenter(new Pl.b2Vec2(0, 10));
    this.setDistanceLegs(this.legMinLength, this.legMinLength);
  }

  private jump() {
    this.setDistanceLegs(this.legMaxLength, this.legMaxLength);
    const hits = this.board.segments.map(s => s.groundRayResult.hit);
    const isTailGrounded = hits[0];
    const isNoseGrounded = hits[hits.length - 1];
    const isCenterGrounded = hits[4] || hits[5] || hits[6];

    const mod = isCenterGrounded ? 0.6 : 1;
    const jumpVector = this.jumpVector;
    jumpVector.Set(this.boostForce * mod, 0);
    if (isTailGrounded && !isNoseGrounded) jumpVector.y = -this.jumpForce * mod;
    else if (isNoseGrounded && !isTailGrounded) this.body.GetWorldVector({x: 0, y: -this.jumpForce * mod}, jumpVector);
    else if (isCenterGrounded) jumpVector.y = -this.jumpForce / 2.8;
    this.body.ApplyForceToCenter(jumpVector, true);
  }

  private setDistanceLegs(lengthLeft: number, lengthRight: number): void {
    this.jointDistLeft && this.b2Physics.setDistanceJointLength(this.jointDistLeft, lengthLeft, this.legMinLength, this.legMaxLength);
    this.jointDistRight && this.b2Physics.setDistanceJointLength(this.jointDistRight, lengthRight, this.legMinLength, this.legMaxLength);
  }

  // TODO try to automate the creation of bodies to make them swappable using an external editor such as:
  //  - R.U.B.E: https://www.iforce2d.net/rube/ (seems old, not free, phaser2 had a RUBE-loader plugin but probably need to write loader for phaser3)
  //  - box2d-editor: https://github.com/MovingBlocks/box2d-editor (seems old, free, exports to JSON need to write loader)
  private generateSnowmanBody(oX: number, oY: number) {
    if (!this.board.leftBinding || !this.board.rightBinding) return;
    const headRadius = this.bodyRadius * 0.7;
    const legHeight = this.bodyRadius * 0.7;
    const legWidth = this.bodyRadius * 0.3;
    const legBodyRadians = 0.5;

    const armHeight = legHeight;
    const armWidth = legWidth;

    const bodyPos = new Pl.b2Vec2(oX + this.board.segmentLength * ((this.board.numSegments / 2) + legBodyRadians), oY - (this.bodyRadius * 2) - (this.bodyRadius / 2));
    const head = this.b2Physics.createCircle(bodyPos.x, bodyPos.y - this.bodyRadius - headRadius, 0, headRadius, {color: 0xC8E1EB, type: Pl.b2BodyType.b2_dynamicBody, linearDamping: 0.15, angularDamping: 0.15});

    this.body = this.b2Physics.createCircle(bodyPos.x, bodyPos.y, 0, this.bodyRadius, {color: 0xC8E1EB, type: Pl.b2BodyType.b2_dynamicBody, linearDamping: 0.15, angularDamping: 0.15});
    this.crashIgnoredBodies.push(this.body);
    const anchorNeck = new Ph.Math.Vector2(0, -1).multiply({x: 0, y: this.bodyRadius}).add(bodyPos);
    this.neckJoint = this.b2Physics.createRevoluteJoint({bodyA: this.body, bodyB: head, anchor: anchorNeck, lowerAngle: -0.25, upperAngle: 0.25, enableLimit: true});

    this.b2Physics.on('post-solve', (contact: Pl.b2Contact, impulse: Pl.b2ContactImpulse) => {
        if (this.isCrashed && this.lostHead) return;
        const bodyA = contact.GetFixtureA().GetBody();
        const bodyB = contact.GetFixtureB().GetBody();
        if (this.crashIgnoredBodies.includes(bodyA) || this.crashIgnoredBodies.includes(bodyB)) return;

        const boardNose = this.board.nose;
        if (bodyA === head || bodyB === head) {
          const maxImpulse = Math.max(...impulse.normalImpulses);
          if (maxImpulse > 7) {
            this.lostHead = true;
            this.isCrashed = true;
          }
        } else if (boardNose && (bodyA === boardNose.body || bodyB === boardNose.body)) {
          const maxImpulse = Math.max(...impulse.normalImpulses);
          if (maxImpulse > 7 && boardNose.crashRayResult?.hit) this.isCrashed = true;
        }
      },
    );

    // Leg Left - Upper
    const offsetLengthLUL = (this.bodyRadius + (legHeight / 1.75));
    const legUpperLeftPos = new Ph.Math.Vector2(0, 1).rotate(legBodyRadians).multiply({x: offsetLengthLUL, y: offsetLengthLUL}).add(bodyPos);
    const legUpperLeft = this.b2Physics.createBox(legUpperLeftPos.x, legUpperLeftPos.y, legBodyRadians, legWidth, legHeight, true);
    const anchorHipLeft = new Ph.Math.Vector2(0, 1).rotate(legBodyRadians).multiply({x: this.bodyRadius, y: this.bodyRadius}).add(bodyPos);
    this.b2Physics.createRevoluteJoint({bodyA: this.body, bodyB: legUpperLeft, anchor: anchorHipLeft, lowerAngle: -0.2, upperAngle: 1, enableLimit: true});
    // Leg Left - Lower
    const legLowerLeftPos = new Ph.Math.Vector2(0, 1).rotate(legBodyRadians - 0.25).multiply({x: legHeight, y: legHeight}).add(legUpperLeftPos);
    const legLowerLeft = this.b2Physics.createBox(legLowerLeftPos.x, legLowerLeftPos.y, 0, legWidth, legHeight, true);
    const anchorKneeLeft = new Ph.Math.Vector2(legLowerLeftPos.x, legLowerLeftPos.y).add({x: 0, y: -legHeight / 2});
    this.b2Physics.createRevoluteJoint({bodyA: legUpperLeft, bodyB: legLowerLeft, anchor: anchorKneeLeft, lowerAngle: -1.5, upperAngle: legBodyRadians * 0.75, enableLimit: true});
    // Leg Left - foot
    const anchorAnkleLeft = new Ph.Math.Vector2(legLowerLeftPos).add({x: 0, y: legHeight / 2});
    this.bindingJointLeft = this.b2Physics.createRevoluteJoint({bodyA: legLowerLeft, bodyB: this.board.leftBinding, anchor: anchorAnkleLeft});
    // -----------------------------------------------------------
    // Leg Right - Upper
    const offsetLUR = (this.bodyRadius + (legHeight / 1.75));
    const legUpperRightPos = new Ph.Math.Vector2(0, 1).rotate(-legBodyRadians).multiply({x: offsetLUR, y: offsetLUR}).add(bodyPos);
    const legUpperRight = this.b2Physics.createBox(legUpperRightPos.x, legUpperRightPos.y, -legBodyRadians, legWidth, legHeight, true);
    const anchorHipRight = new Ph.Math.Vector2(0, 1).rotate(-legBodyRadians).multiply({x: this.bodyRadius, y: this.bodyRadius}).add(bodyPos);
    this.b2Physics.createRevoluteJoint({bodyA: this.body, bodyB: legUpperRight, anchor: anchorHipRight, lowerAngle: -1, upperAngle: 0.2, enableLimit: true});
    // Leg Right - Lower
    const legLowerRightPos = new Ph.Math.Vector2(0, 1).rotate(-legBodyRadians + 0.25).multiply({x: legHeight, y: legHeight}).add(legUpperRightPos);
    const legLowerRight = this.b2Physics.createBox(legLowerRightPos.x, legLowerRightPos.y, 0, legWidth, legHeight, true);
    const anchorKneeRight = new Ph.Math.Vector2(legLowerRightPos.x, legLowerRightPos.y).add({x: 0, y: -legHeight / 2});
    this.b2Physics.createRevoluteJoint({bodyA: legUpperRight, bodyB: legLowerRight, anchor: anchorKneeRight, lowerAngle: -legBodyRadians * 0.75, upperAngle: 1.5, enableLimit: true});
    // Leg Right - foot
    const anchorAnkleRight = new Ph.Math.Vector2(legLowerRightPos).add({x: 0, y: legHeight / 2});
    this.bindingJointRight = this.b2Physics.createRevoluteJoint({bodyA: legLowerRight, bodyB: this.board.rightBinding, anchor: anchorAnkleRight});
    // -----------------------------------------------------------
    // DISTANCE
    const distanceJointConfig: IDistanceJointConfig = {length: this.legMinLength, minLength: this.legMinLength, maxLength: this.legMaxLength, frequencyHz: 8, dampingRatio: 5};
    // Note swapping bindings was initially an accident but IMO it simply plays better like this, so leaving it for now
    this.jointDistLeft = this.b2Physics.createDistanceJoint(this.body, this.board.rightBinding, anchorHipLeft, anchorAnkleLeft, distanceJointConfig);
    this.jointDistRight = this.b2Physics.createDistanceJoint(this.body, this.board.leftBinding, anchorHipRight, anchorAnkleRight, distanceJointConfig);
    // // -----------------------------------------------------------
    // Arm Left - Upper
    const baseRotLeft = (Math.PI / 180) * 90;
    const armBodyLeftRadians = 0.5;
    const offsetAUL = (this.bodyRadius + (armHeight / 1.75));
    const armUpperLeftPos = new Ph.Math.Vector2(-1, 0).rotate(armBodyLeftRadians).multiply({x: offsetAUL, y: offsetAUL}).add(bodyPos);
    const anchorShoulderLeft = new Ph.Math.Vector2(-1, 0).rotate(armBodyLeftRadians).multiply({x: this.bodyRadius, y: this.bodyRadius}).add(bodyPos);
    const armUpperLeft = this.b2Physics.createBox(armUpperLeftPos.x, armUpperLeftPos.y, baseRotLeft + armBodyLeftRadians, armWidth, armHeight, true);
    this.b2Physics.createRevoluteJoint({bodyA: this.body, bodyB: armUpperLeft, anchor: anchorShoulderLeft, lowerAngle: -1.25, upperAngle: 0.75, enableLimit: true});
    // // Arm Left - Lower
    const armLowerLeftPos = new Ph.Math.Vector2(-1, 0).rotate(armBodyLeftRadians).multiply({x: armHeight, y: armHeight}).add(armUpperLeftPos);
    const armLowerLeft = this.b2Physics.createBox(armLowerLeftPos.x, armLowerLeftPos.y, baseRotLeft + armBodyLeftRadians, armWidth, armHeight, true);
    const anchorElbowLeft = new Ph.Math.Vector2(armLowerLeftPos).add(new Ph.Math.Vector2(armHeight / 2, 0).rotate(armBodyLeftRadians));
    this.b2Physics.createRevoluteJoint({bodyA: armUpperLeft, bodyB: armLowerLeft, anchor: anchorElbowLeft, lowerAngle: -0.75, upperAngle: 0.75, enableLimit: true});
    this.crashIgnoredBodies.push(armLowerLeft);
    // -----------------------------------------------------------
    // // Arm Right - Upper
    const baseRotRight = -(Math.PI / 180) * 90;
    const armBodyRightRadians = -0.5;
    const offsetAUR = (this.bodyRadius + (armHeight / 1.75));
    const armUpperRightPos = new Ph.Math.Vector2(1, 0).rotate(armBodyRightRadians).multiply({x: offsetAUR, y: offsetAUR}).add(bodyPos);
    const anchorShoulderRight = new Ph.Math.Vector2(1, 0).rotate(armBodyRightRadians).multiply({x: this.bodyRadius, y: this.bodyRadius}).add(bodyPos);
    const armUpperRight = this.b2Physics.createBox(armUpperRightPos.x, armUpperRightPos.y, baseRotRight + armBodyRightRadians, armWidth, armHeight, true);
    this.b2Physics.createRevoluteJoint({bodyA: this.body, bodyB: armUpperRight, anchor: anchorShoulderRight, lowerAngle: -0.75, upperAngle: 1.25, enableLimit: true});
    // // Arm Right - Lower
    const armLowerRightPos = new Ph.Math.Vector2(1, 0).rotate(armBodyRightRadians).multiply({x: armHeight, y: armHeight}).add(armUpperRightPos);
    const armLowerRight = this.b2Physics.createBox(armLowerRightPos.x, armLowerRightPos.y, baseRotRight + armBodyRightRadians, armWidth, armHeight, true);
    const anchorElbowRight = new Ph.Math.Vector2(armLowerRightPos).add(new Ph.Math.Vector2(-armHeight / 2, 0).rotate(armBodyRightRadians));
    this.b2Physics.createRevoluteJoint({bodyA: armUpperRight, bodyB: armLowerRight, anchor: anchorElbowRight, lowerAngle: -0.75, upperAngle: 0.75, enableLimit: true});
    this.crashIgnoredBodies.push(armLowerRight);
  }
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

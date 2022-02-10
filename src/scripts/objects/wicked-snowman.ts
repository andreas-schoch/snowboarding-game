import * as Ph from 'phaser';
import * as Pl from '@box2d/core';
import {IDistanceJointConfig, Physics} from './physics';
import {StateComponent} from './state-component';
import {WickedSnowboard} from './snowboard';
import {stats} from '../index';


export class WickedSnowman {
  debug: boolean = false; // TODO make this toggleable
  readonly stateComponent: StateComponent;
  readonly board: WickedSnowboard;
  readonly parts: IBodyParts;
  readonly scene: Ph.Scene;
  readonly b2Physics: Physics;
  private readonly cursors: Ph.Types.Input.Keyboard.CursorKeys;

  private readonly boostForce: number = 27.5 * 60;
  private readonly jumpForce: number = 300 * 60;
  private leanForce: number = 5 * 60;
  private readonly boostVector: Pl.b2Vec2 = new Pl.b2Vec2(0, 0);
  private readonly jumpVector: Pl.b2Vec2 = new Pl.b2Vec2(0, 0);

  readonly bodyRadius: number;
  private readonly legMinLength;
  private readonly legMaxLength;

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
    this.parts = this.generateBodyParts(oX, oY);
    this.stateComponent = new StateComponent(this);
  }

  update() {
    stats.begin('snowman');
    this.stateComponent.update();
    this.stateComponent.isCrashed && this.detachBoard(); // joints cannot be destroyed within post-solve callback
    this.stateComponent.lostHead && this.detachHead(); // joints cannot be destroyed within post-solve callback
    this.getTimeInAir() > 100 && this.resetLegs();

    if (!this.stateComponent.isCrashed) {
      this.board.update();
      const delta = this.scene.game.loop.delta / 1000; // TODO take bulletTime into account

      // Touch/Mouse input
      if (this.scene.input.activePointer?.isDown) {
        const pointer = this.scene.input.activePointer; // activePointer undefined until after first touch input
        pointer.motionFactor = 0.2;
        this.scene.input.activePointer.x < this.scene.cameras.main.width / 2 ? this.leanBackward(delta) : this.leanForward(delta);
        pointer.velocity.y < -30 && this.scene.game.getTime() - pointer.moveTime <= 300 && this.jump(delta);
      } else {
        this.scene.input.activePointer.motionFactor = 0.8;
      }

      // Keyboard input
      this.cursors.up.isDown && this.scene.game.getTime() - this.cursors.up.timeDown <= 300 && this.jump(delta);
      this.cursors.left.isDown && this.leanBackward(delta);
      this.cursors.right.isDown && this.leanForward(delta);
      this.cursors.down.isDown && this.leanCenter();
      this.boost(delta);
    }
    stats.end('snowman');
  }

  getTimeInAir(): number {
    return this.board.getTimeInAir();
  }

  isInAir(): boolean {
    return this.board.isInAir();
  }

  private detachBoard() {
    this.parts.jointBindingLeft && this.b2Physics.world.DestroyJoint(this.parts.jointBindingLeft);
    this.parts.jointBindingRight && this.b2Physics.world.DestroyJoint(this.parts.jointBindingRight);
    this.parts.jointDistanceLeft && this.b2Physics.world.DestroyJoint(this.parts.jointDistanceLeft);
    this.parts.jointDistanceRight && this.b2Physics.world.DestroyJoint(this.parts.jointDistanceRight);
    this.parts.jointDistanceRight && this.board.segments[this.board.segments.length - 1].body.SetLinearVelocity(Pl.b2Vec2.ZERO);
  }

  private detachHead() {
    this.parts.jointNeck && this.b2Physics.world.DestroyJoint(this.parts.jointNeck);
    this.parts.jointNeck = null;
  }

  private boost(delta: number) {
    const mod = this.isInAir() ? 0.6 : 1;
    const boostVector = this.boostVector;
    boostVector.Set((this.boostForce * delta * mod) + this.stateComponent.comboBoost, 0);
    this.board.segments && this.board.segments[4].body.ApplyForceToCenter(boostVector, true);
    this.parts.body.ApplyForceToCenter(boostVector, true);
  }

  private resetLegs() {
    this.setDistanceLegs(this.legMinLength, this.legMinLength);
  }

  private leanBackward(delta: number) {
    const mod = this.isInAir() ? 0.6 : 1;
    this.parts.body.ApplyAngularImpulse(-this.leanForce * delta);
    this.setDistanceLegs(this.legMinLength, this.legMaxLength);
  }

  private leanForward(delta: number) {
    const mod = this.isInAir() ? 0.6 : 1;
    this.parts.body.ApplyAngularImpulse(this.leanForce * delta);
    this.setDistanceLegs(this.legMaxLength, this.legMinLength);
  }

  private leanCenter() {
    this.b2Physics.enterBulletTime(1000, 0.5);
    this.parts.body.ApplyForceToCenter(new Pl.b2Vec2(0, 10));
    this.setDistanceLegs(this.legMinLength, this.legMinLength);
  }

  private jump(delta: number) {
    this.setDistanceLegs(this.legMaxLength, this.legMaxLength);
    const {isTailGrounded, isCenterGrounded, isNoseGrounded} = this.board;

    const mod = isCenterGrounded ? 0.6 : 1;
    const force = this.jumpForce * delta;
    const jumpVector = this.jumpVector;
    jumpVector.Set(0, 0);
    if (isTailGrounded && !isNoseGrounded) jumpVector.y = -force * mod;
    else if (isNoseGrounded && !isTailGrounded) this.parts.body.GetWorldVector({x: 0, y: -force * mod}, jumpVector);
    else if (isCenterGrounded) jumpVector.y = -force / 2.8;
    this.parts.body.ApplyForceToCenter(jumpVector, true);
  }

  private setDistanceLegs(lengthLeft: number, lengthRight: number) {
    this.parts.jointDistanceLeft && this.b2Physics.setDistanceJointLength(this.parts.jointDistanceLeft, lengthLeft, this.legMinLength, this.legMaxLength);
    this.parts.jointDistanceRight && this.b2Physics.setDistanceJointLength(this.parts.jointDistanceRight, lengthRight, this.legMinLength, this.legMaxLength);
  }

  // TODO try to automate the creation of bodies to make them swappable using an external editor such as:
  //  - R.U.B.E: https://www.iforce2d.net/rube/ (seems old, not free, phaser2 had a RUBE-loader plugin but probably need to write loader for phaser3)
  //  - box2d-editor: https://github.com/MovingBlocks/box2d-editor (seems old, free, exports to JSON need to write loader)
  //  - Physics Editor: https://www.codeandweb.com/physicseditor (already bought it, can draw fixtures with metadata, using it for this purpose seems a bit hacky)
  //  - Physics Editor: https://github.com/amuTBKT/Physics-Editor (MIT license, browser based, demo works perfectly, seems to use box2d.js)
  private generateBodyParts(oX: number, oY: number): IBodyParts {
    const parts: Partial<IBodyParts> = {};

    const headRadius = this.bodyRadius * 0.7;
    const legHeight = this.bodyRadius * 0.7;
    const legWidth = this.bodyRadius * 0.3;
    const legBodyRadians = 0.5;

    const armHeight = legHeight;
    const armWidth = legWidth;

    const bodyPos = new Pl.b2Vec2(oX + this.board.segmentLength * ((this.board.numSegments / 2) + legBodyRadians), oY - (this.bodyRadius * 2) - (this.bodyRadius / 2));
    const anchorNeck = new Ph.Math.Vector2(0, -1).multiply({x: 0, y: this.bodyRadius}).add(bodyPos);
    parts.head = this.b2Physics.createCircle(bodyPos.x, bodyPos.y - this.bodyRadius - headRadius, 0, headRadius, {color: 0xC8E1EB, type: Pl.b2BodyType.b2_dynamicBody, linearDamping: 0.15, angularDamping: 0.15});
    parts.body = this.b2Physics.createCircle(bodyPos.x, bodyPos.y, 0, this.bodyRadius, {color: 0xC8E1EB, type: Pl.b2BodyType.b2_dynamicBody, linearDamping: 0.15, angularDamping: 0.15});
    parts.jointNeck = this.b2Physics.createRevoluteJoint({bodyA: parts.body, bodyB: parts.head, anchor: anchorNeck, lowerAngle: -0.25, upperAngle: 0.25, enableLimit: true});

    const offsetLengthLUL = (this.bodyRadius + (legHeight / 1.75));
    const legUpperLeftPos = new Ph.Math.Vector2(0, 1).rotate(legBodyRadians).multiply({x: offsetLengthLUL, y: offsetLengthLUL}).add(bodyPos);
    const anchorHipLeft = new Ph.Math.Vector2(0, 1).rotate(legBodyRadians).multiply({x: this.bodyRadius, y: this.bodyRadius}).add(bodyPos);
    const legLowerLeftPos = new Ph.Math.Vector2(0, 1).rotate(legBodyRadians - 0.25).multiply({x: legHeight, y: legHeight}).add(legUpperLeftPos);
    const anchorKneeLeft = new Ph.Math.Vector2(legLowerLeftPos.x, legLowerLeftPos.y).add({x: 0, y: -legHeight / 2});
    const anchorAnkleLeft = new Ph.Math.Vector2(legLowerLeftPos).add({x: 0, y: legHeight / 2});
    parts.legUpperLeft = this.b2Physics.createBox(legUpperLeftPos.x, legUpperLeftPos.y, legBodyRadians, legWidth, legHeight, true);
    parts.legLowerLeft = this.b2Physics.createBox(legLowerLeftPos.x, legLowerLeftPos.y, 0, legWidth, legHeight, true);
    parts.jointHipLeft = this.b2Physics.createRevoluteJoint({bodyA: parts.body, bodyB: parts.legUpperLeft, anchor: anchorHipLeft, lowerAngle: -0.2, upperAngle: 1, enableLimit: true});
    parts.jointKneeLeft = this.b2Physics.createRevoluteJoint({bodyA: parts.legUpperLeft, bodyB: parts.legLowerLeft, anchor: anchorKneeLeft, lowerAngle: -1.5, upperAngle: legBodyRadians * 0.75, enableLimit: true});
    parts.jointBindingLeft = this.b2Physics.createRevoluteJoint({bodyA: parts.legLowerLeft, bodyB: this.board.leftBinding, anchor: anchorAnkleLeft});

    const offsetLUR = (this.bodyRadius + (legHeight / 1.75));
    const legUpperRightPos = new Ph.Math.Vector2(0, 1).rotate(-legBodyRadians).multiply({x: offsetLUR, y: offsetLUR}).add(bodyPos);
    const anchorHipRight = new Ph.Math.Vector2(0, 1).rotate(-legBodyRadians).multiply({x: this.bodyRadius, y: this.bodyRadius}).add(bodyPos);
    const legLowerRightPos = new Ph.Math.Vector2(0, 1).rotate(-legBodyRadians + 0.25).multiply({x: legHeight, y: legHeight}).add(legUpperRightPos);
    const anchorKneeRight = new Ph.Math.Vector2(legLowerRightPos.x, legLowerRightPos.y).add({x: 0, y: -legHeight / 2});
    const anchorAnkleRight = new Ph.Math.Vector2(legLowerRightPos).add({x: 0, y: legHeight / 2});
    parts.legUpperRight = this.b2Physics.createBox(legUpperRightPos.x, legUpperRightPos.y, -legBodyRadians, legWidth, legHeight, true);
    parts.legLowerRight = this.b2Physics.createBox(legLowerRightPos.x, legLowerRightPos.y, 0, legWidth, legHeight, true);
    parts.jointHipRight = this.b2Physics.createRevoluteJoint({bodyA: parts.body, bodyB: parts.legUpperRight, anchor: anchorHipRight, lowerAngle: -1, upperAngle: 0.2, enableLimit: true});
    parts.jointKneeRight = this.b2Physics.createRevoluteJoint({bodyA: parts.legUpperRight, bodyB: parts.legLowerRight, anchor: anchorKneeRight, lowerAngle: -legBodyRadians * 0.75, upperAngle: 1.5, enableLimit: true});
    parts.jointBindingRight = this.b2Physics.createRevoluteJoint({bodyA: parts.legLowerRight, bodyB: this.board.rightBinding, anchor: anchorAnkleRight});

    // Note swapping bindings was initially an accident but IMO it simply plays better like this, so leaving it for now
    const distanceJointConfig: IDistanceJointConfig = {length: this.legMinLength, minLength: this.legMinLength, maxLength: this.legMaxLength, frequencyHz: 8, dampingRatio: 5};
    parts.jointDistanceLeft = this.b2Physics.createDistanceJoint(parts.body, this.board.rightBinding, anchorHipLeft, anchorAnkleLeft, distanceJointConfig);
    parts.jointDistanceRight = this.b2Physics.createDistanceJoint(parts.body, this.board.leftBinding, anchorHipRight, anchorAnkleRight, distanceJointConfig);

    const baseRotLeft = (Math.PI / 180) * 90;
    const armBodyLeftRadians = 0.5;
    const offsetAUL = (this.bodyRadius + (armHeight / 1.75));
    const armUpperLeftPos = new Ph.Math.Vector2(-1, 0).rotate(armBodyLeftRadians).multiply({x: offsetAUL, y: offsetAUL}).add(bodyPos);
    const anchorShoulderLeft = new Ph.Math.Vector2(-1, 0).rotate(armBodyLeftRadians).multiply({x: this.bodyRadius, y: this.bodyRadius}).add(bodyPos);
    const armLowerLeftPos = new Ph.Math.Vector2(-1, 0).rotate(armBodyLeftRadians).multiply({x: armHeight, y: armHeight}).add(armUpperLeftPos);
    const anchorElbowLeft = new Ph.Math.Vector2(armLowerLeftPos).add(new Ph.Math.Vector2(armHeight / 2, 0).rotate(armBodyLeftRadians));
    parts.armUpperLeft = this.b2Physics.createBox(armUpperLeftPos.x, armUpperLeftPos.y, baseRotLeft + armBodyLeftRadians, armWidth, armHeight, true);
    parts.armLowerLeft = this.b2Physics.createBox(armLowerLeftPos.x, armLowerLeftPos.y, baseRotLeft + armBodyLeftRadians, armWidth, armHeight, true);
    parts.jointShoulderLeft = this.b2Physics.createRevoluteJoint({bodyA: parts.body, bodyB: parts.armUpperLeft, anchor: anchorShoulderLeft, lowerAngle: -1.25, upperAngle: 0.75, enableLimit: true});
    parts.jointElbowLeft = this.b2Physics.createRevoluteJoint({bodyA: parts.armUpperLeft, bodyB: parts.armLowerLeft, anchor: anchorElbowLeft, lowerAngle: -0.75, upperAngle: 0.75, enableLimit: true});

    const baseRotRight = -baseRotLeft;
    const armBodyRightRadians = -armBodyLeftRadians;
    const offsetAUR = offsetAUL;
    const armUpperRightPos = new Ph.Math.Vector2(1, 0).rotate(armBodyRightRadians).multiply({x: offsetAUR, y: offsetAUR}).add(bodyPos);
    const anchorShoulderRight = new Ph.Math.Vector2(1, 0).rotate(armBodyRightRadians).multiply({x: this.bodyRadius, y: this.bodyRadius}).add(bodyPos);
    const armLowerRightPos = new Ph.Math.Vector2(1, 0).rotate(armBodyRightRadians).multiply({x: armHeight, y: armHeight}).add(armUpperRightPos);
    const anchorElbowRight = new Ph.Math.Vector2(armLowerRightPos).add(new Ph.Math.Vector2(-armHeight / 2, 0).rotate(armBodyRightRadians));
    parts.armUpperRight = this.b2Physics.createBox(armUpperRightPos.x, armUpperRightPos.y, baseRotRight + armBodyRightRadians, armWidth, armHeight, true);
    parts.jointShoulderRight = this.b2Physics.createRevoluteJoint({bodyA: parts.body, bodyB: parts.armUpperRight, anchor: anchorShoulderRight, lowerAngle: -0.75, upperAngle: 1.25, enableLimit: true});
    parts.armLowerRight = this.b2Physics.createBox(armLowerRightPos.x, armLowerRightPos.y, baseRotRight + armBodyRightRadians, armWidth, armHeight, true);
    parts.jointElbowRight = this.b2Physics.createRevoluteJoint({bodyA: parts.armUpperRight, bodyB: parts.armLowerRight, anchor: anchorElbowRight, lowerAngle: -0.75, upperAngle: 0.75, enableLimit: true});

    return <IBodyParts>parts;
  }
}


export interface IBodyParts {
  head: Pl.b2Body;
  body: Pl.b2Body;

  armUpperLeft: Pl.b2Body;
  armLowerLeft: Pl.b2Body;
  armUpperRight: Pl.b2Body;
  armLowerRight: Pl.b2Body;

  legUpperLeft: Pl.b2Body;
  legLowerLeft: Pl.b2Body;
  legUpperRight: Pl.b2Body;
  legLowerRight: Pl.b2Body;

  jointNeck: Pl.b2RevoluteJoint | null;

  jointShoulderLeft: Pl.b2RevoluteJoint;
  jointElbowLeft: Pl.b2RevoluteJoint;
  jointShoulderRight: Pl.b2RevoluteJoint;
  jointElbowRight: Pl.b2RevoluteJoint;

  jointHipLeft: Pl.b2RevoluteJoint;
  jointKneeLeft: Pl.b2RevoluteJoint;
  jointHipRight: Pl.b2RevoluteJoint;
  jointKneeRight: Pl.b2RevoluteJoint;

  jointBindingLeft: Pl.b2RevoluteJoint | null;
  jointBindingRight: Pl.b2RevoluteJoint | null;

  jointDistanceLeft: Pl.b2DistanceJoint | null;
  jointDistanceRight: Pl.b2DistanceJoint | null;
}

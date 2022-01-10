import * as Ph from 'phaser';
import * as Pl from 'planck-js';

// TODO
//  - add mobile controls (use touchscreen areas to replace WASD. E.g If player touches left or right snowman leans left or right)
//  -
export class WickedSnowman {
  body: Pl.Body;

  private cursors: Ph.Types.Input.Keyboard.CursorKeys;
  private scene: Ph.Scene;

  private readonly worldScale: number;
  private readonly world: Pl.World;
  // private mouseJoint: Pl.MouseJoint | null;

  private jointDistLeft: Pl.DistanceJoint | null;
  private jointDistRight: Pl.DistanceJoint | null;
  private board: Pl.Body; // TODO create snowboard class (public method to get 2 anchor points)

  constructor(scene: Ph.Scene, world: Pl.World, worldScale: number) {
    this.scene = scene;
    this.world = world;
    this.worldScale = worldScale;
  }

  async create() {
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    // @ts-ignore
    this.cursors = this.scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      shift: Phaser.Input.Keyboard.KeyCodes.SHIFT,
    });

    const numBoardSegments = 10;
    const boardSegmentLength = 28 * 0.6;
    const boardSegmentThickness = boardSegmentLength * 0.4;
    const oX = 700;
    const oY = 300;

    // TODO generate snowboard iteratively
    const box1 = this.createBox(oX + boardSegmentLength * 1, oY, 0, boardSegmentLength, boardSegmentThickness, true, 0x46B6C9);
    const box2 = this.createBox(oX + boardSegmentLength * 2, oY, 0, boardSegmentLength, boardSegmentThickness, true, 0x46B6C9);
    const box3 = this.createBox(oX + boardSegmentLength * 3, oY, 0, boardSegmentLength, boardSegmentThickness, true, 0x46B6C9);
    const box4 = this.createBox(oX + boardSegmentLength * 4, oY, 0, boardSegmentLength, boardSegmentThickness, true, 0x46B6C9);
    const box5 = this.createBox(oX + boardSegmentLength * 5, oY, 0, boardSegmentLength, boardSegmentThickness, true, 0x46B6C9);
    this.board = box5;
    const box6 = this.createBox(oX + boardSegmentLength * 6, oY, 0, boardSegmentLength, boardSegmentThickness, true, 0x46B6C9);
    const box7 = this.createBox(oX + boardSegmentLength * 7, oY, 0, boardSegmentLength, boardSegmentThickness, true, 0x46B6C9);
    const box8 = this.createBox(oX + boardSegmentLength * 8, oY, 0, boardSegmentLength, boardSegmentThickness, true, 0x46B6C9);
    const box9 = this.createBox(oX + boardSegmentLength * 9, oY, 0, boardSegmentLength, boardSegmentThickness, true, 0x46B6C9);
    const box10 = this.createBox(oX + boardSegmentLength * 10, oY, 0, boardSegmentLength, boardSegmentThickness, true, 0x46B6C9);
    const anchor12 = Pl.Vec2((oX + (boardSegmentLength / 2) + boardSegmentLength * 1) / this.worldScale, oY / this.worldScale);
    const anchor23 = Pl.Vec2((oX + (boardSegmentLength / 2) + boardSegmentLength * 2) / this.worldScale, oY / this.worldScale);
    const anchor34 = Pl.Vec2((oX + (boardSegmentLength / 2) + boardSegmentLength * 3) / this.worldScale, oY / this.worldScale);
    const anchor45 = Pl.Vec2((oX + (boardSegmentLength / 2) + boardSegmentLength * 4) / this.worldScale, oY / this.worldScale);
    const anchor56 = Pl.Vec2((oX + (boardSegmentLength / 2) + boardSegmentLength * 5) / this.worldScale, oY / this.worldScale);
    const anchor67 = Pl.Vec2((oX + (boardSegmentLength / 2) + boardSegmentLength * 6) / this.worldScale, oY / this.worldScale);
    const anchor78 = Pl.Vec2((oX + (boardSegmentLength / 2) + boardSegmentLength * 7) / this.worldScale, oY / this.worldScale);
    const anchor89 = Pl.Vec2((oX + (boardSegmentLength / 2) + boardSegmentLength * 8) / this.worldScale, oY / this.worldScale);
    const anchor910 = Pl.Vec2((oX + (boardSegmentLength / 2) + boardSegmentLength * 9) / this.worldScale, oY / this.worldScale);
    this.world.createJoint(Pl.WeldJoint({dampingRatio: 0.5, frequencyHz: 5, referenceAngle: -0.35}, box1, box2, anchor12));
    this.world.createJoint(Pl.WeldJoint({dampingRatio: 0.5, frequencyHz: 5, referenceAngle: -0.25}, box2, box3, anchor23));
    this.world.createJoint(Pl.WeldJoint({dampingRatio: 0.5, frequencyHz: 6}, box3, box4, anchor34));
    this.world.createJoint(Pl.WeldJoint({dampingRatio: 0.5, frequencyHz: 8}, box4, box5, anchor45));
    this.world.createJoint(Pl.WeldJoint({dampingRatio: 0.5, frequencyHz: 12}, box5, box6, anchor56));
    this.world.createJoint(Pl.WeldJoint({dampingRatio: 0.5, frequencyHz: 8}, box6, box7, anchor67));
    this.world.createJoint(Pl.WeldJoint({dampingRatio: 0.5, frequencyHz: 6}, box7, box8, anchor78));
    this.world.createJoint(Pl.WeldJoint({dampingRatio: 0.5, frequencyHz: 5, referenceAngle: -0.25}, box8, box9, anchor89));
    this.world.createJoint(Pl.WeldJoint({dampingRatio: 0.5, frequencyHz: 5, referenceAngle: -0.35}, box9, box10, anchor910));

    const bodyRadius = 50 * 0.6;
    const headRadius = bodyRadius * 0.7;
    const legHeight = bodyRadius * 0.7;
    const legWidth = bodyRadius * 0.3;
    const legBodyRadians = 0.5;

    const armHeight = bodyRadius * 0.7;
    const armWidth = bodyRadius * 0.3;

    const bodyPos = Pl.Vec2(oX + boardSegmentLength * ((numBoardSegments / 2) + legBodyRadians), oY - (bodyRadius * 2) - (bodyRadius / 2));
    const head = this.createCircle(bodyPos.x, bodyPos.y - bodyRadius - headRadius, 0, headRadius, true);
    this.body = this.createCircle(bodyPos.x, bodyPos.y, 0, bodyRadius, true);
    const anchorNeck = this.body.getWorldPoint(Pl.Vec2(0, -1).mul(bodyRadius / this.worldScale));
    this.world.createJoint(Pl.RevoluteJoint({lowerAngle: -0.1, upperAngle: 0.1, enableLimit: true}, head, this.body, anchorNeck));
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
    this.world.createJoint(Pl.RevoluteJoint({}, legLowerLeft, box4, anchorAnkleLeft));
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
    this.world.createJoint(Pl.RevoluteJoint({}, legLowerRight, box7, anchorAnkleRight));
    // -----------------------------------------------------------
    // DISTANCE
    this.jointDistLeft = this.world.createJoint(Pl.DistanceJoint({length: (80 * 0.6) / this.worldScale, frequencyHz: 15, dampingRatio: 10}, this.body, box7, anchorHipLeft, anchorAnkleLeft));
    this.jointDistRight = this.world.createJoint(Pl.DistanceJoint({length: (80 * 0.6) / this.worldScale, frequencyHz: 15, dampingRatio: 10}, this.body, box4, anchorHipRight, anchorAnkleRight));
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

    // this.box1 = box5;
    // const def = new Pl.MouseJoint({}, this.terrainFixtures, this.box1, this.box1.getPosition());
    // def.m_collideConnected = true;
    // def.setMaxForce(this.box1.getMass() * 1500);
    // def.setDampingRatio(0);
    // this.box1.setAngularDamping(0.05);
    // this.mouseJoint = this.world.createJoint(def);
    // this.box1.setAwake(true);
  }

  // TODO refactor into util function or turn physics as a whole into a plugin
  createBox(posX, posY, angle, width, height, isDynamic, color: number = 0xB68750): Pl.Body {
    // (angle / 180) * Math.PI
    const body = this.world.createBody({angle: angle, linearDamping: 0.15, angularDamping: 0.1});
    if (isDynamic) body.setDynamic();
    body.createFixture(Pl.Box(width / 2 / this.worldScale, height / 2 / this.worldScale), {friction: 0.001, restitution: 0.005, density: 0.1});
    body.setPosition(Pl.Vec2(posX / this.worldScale, posY / this.worldScale));
    body.setMassData({mass: 0.5, center: Pl.Vec2(), I: 1});

    let userData = this.scene.add.graphics();
    userData.fillStyle(color);
    userData.fillRect(-width / 2, -height / 2, width, height);
    body.setUserData(userData);
    return body;
  }

  createCircle(posX, posY, angle, radius, isDynamic, color: number = 0xF3D9F4): Pl.Body {
    const body = this.world.createBody({angle: (angle / 360) * Math.PI, linearDamping: 0.15, angularDamping: 0.2});
    if (isDynamic) body.setDynamic();
    body.createFixture(Pl.Circle(radius / this.worldScale), {friction: 0.5, restitution: 0.1, density: 1});
    body.setPosition(Pl.Vec2(posX / this.worldScale, posY / this.worldScale));
    body.setMassData({mass: 1, center: Pl.Vec2(), I: 1});

    const userData = this.scene.add.graphics();
    // userData.fillGradientStyle(0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 1);
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

  update() {
    // const mousePosScaled = Pl.Vec2(this.scene.game.input.mousePointer.worldX / this.worldScale, this.scene.game.input.mousePointer.worldY / this.worldScale);
    // this.mouseJoint?.setTarget(mousePosScaled);

    if (this.cursors.left.isDown) {
      this.body.applyAngularImpulse(-3.5);
      this.setDistanceLegs({length: 60 / this.worldScale}, {length: 80 / this.worldScale});
    }

    if (this.cursors.right.isDown) {
      // TODO limit the amount of momentum player can generate while not touching the ground
      this.body.applyAngularImpulse(3.5);
      this.setDistanceLegs({length: 80 / this.worldScale}, {length: 60 / this.worldScale});
    }

    if (this.cursors.space.isDown) {
      this.setDistanceLegs({length: 80 / this.worldScale, dampingRatio: 0.1, frequencyHz: 6}, {dampingRatio: 0.1, frequencyHz: 6, length: 80 / this.worldScale});
      // TODO improvements:
      //  - player should only be able to jump if board touches the ground (add a ~0.2s grace period for better UX)
      //  - make jump force and direction depend on which leg is extended and overall center of mass
      //  - the flex of the board isn't well simulated yet (e.g in RL before a jump on flat surface you would shift your center towards the tail and use it as a spring)
      const force = this.body.getWorldVector(Pl.Vec2(0.0, -50.0)).add(Pl.Vec2(0, -100));
      this.body.applyForceToCenter(force, true);
    }

    if (this.cursors.up.isDown) {
      this.setDistanceLegs({length: 80 / this.worldScale, dampingRatio: 0.2, frequencyHz: 10}, {dampingRatio: 0.2, frequencyHz: 10, length: 80 / this.worldScale});
    }

    // TODO Probably wont be necessary once terrain has a constant downhill slope.
    //  Need to see it in action with real gravity. Current prototype gameplay feels nice with constant force applied
    // if (this.cursors.shift.isDown) {
    this.board.applyForceToCenter(Pl.Vec2(30, 0), true);
    this.body.applyForceToCenter(Pl.Vec2(30, 0), true);
    // }

    if (this.cursors.down.isDown) {
      // TODO while pressed it should absorb bumps a bit better.
      //  Maybe even correct body rotation based on surface normal vector while in air
      // this.body.applyForceToCenter(Pl.Vec2(0, 25));
      this.setDistanceLegs({length: 50 / this.worldScale}, {length: 50 / this.worldScale});
    }
  }
}

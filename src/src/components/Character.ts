import { b2 } from "..";
import GameScene from "../scenes/GameScene";
import { vec2Util } from "../util/RUBE/Vec2Math";
import { Physics } from "./Physics";
import { Snowboard } from "./Snowboard";
import { State } from "./State";

export class Character {
  head: Box2D.b2Body;
  body: Box2D.b2Body;
  armUpperLeft: Box2D.b2Body;
  armLowerLeft: Box2D.b2Body;
  armUpperRight: Box2D.b2Body;
  armLowerRight: Box2D.b2Body;
  boardSegments: (Box2D.b2Body)[];

  headImage: Phaser.GameObjects.Image;
  bodyImage: Phaser.GameObjects.Image;
  armUpperLeftImage: Phaser.GameObjects.Image;
  armLowerLeftImage: Phaser.GameObjects.Image;
  armUpperRightImage: Phaser.GameObjects.Image;
  armLowerRightImage: Phaser.GameObjects.Image;

  armUpperLeftDepth: number;
  armLowerLeftDepth: number;
  armUpperRightDepth: number;
  armLowerRightDepth: number;

  bindingLeft: Box2D.b2RevoluteJoint | null;
  bindingRight: Box2D.b2RevoluteJoint | null;
  distanceLegLeft: Box2D.b2DistanceJoint | null;
  distanceLegRight: Box2D.b2DistanceJoint | null;
  weldCenter: Box2D.b2WeldJoint | null;
  prismatic: Box2D.b2PrismaticJoint | null;

  legLengthExtended: number;
  legLengthRelaxed: number;
  legLengthBent: number;

  jumpForce: number;
  leanForce: number;
  jumpCooldown: number // in num frames. Prevents player from jumping too quickly after a landing

  readonly scene: GameScene;
  readonly b2Physics: Physics;
  private readonly FORWARD: Box2D.b2Vec2 = new b2.b2Vec2(1, 0);
  private readonly ZERO: Box2D.b2Vec2 = new b2.b2Vec2(0, 0);
  private readonly UP: Box2D.b2Vec2 = new b2.b2Vec2(0, 1);
  private alreadyDetached: boolean = false;
  private currentBodyFlipDot: number = 1;
  board: Snowboard;
  state: State;

  constructor(scene: GameScene) {
    this.scene = scene;
    this.b2Physics = scene.b2Physics;
    this.initBodyParts();
    this.board = new Snowboard(this);
    this.state = new State(this);
  }

  private resetLegs() {
    const { legLengthRelaxed } = this;
    this.distanceLegLeft?.SetLength(legLengthRelaxed);
    this.distanceLegRight?.SetLength(legLengthRelaxed);
  }

  leanBackward() {
    const { legLengthBent, legLengthExtended } = this;
    this.distanceLegLeft?.SetLength(legLengthBent);
    this.distanceLegRight?.SetLength(legLengthExtended);
    this.body.ApplyAngularImpulse(this.leanForce, true);
  }

  leanForward() {
    const { legLengthBent, legLengthExtended } = this;
    this.distanceLegLeft?.SetLength(legLengthExtended);
    this.distanceLegRight?.SetLength(legLengthBent);
    this.body.ApplyAngularImpulse(-this.leanForce, true);
  }

  leanCenter() {
    const { legLengthBent } = this;

    this.distanceLegLeft?.SetLength(legLengthBent);
    this.distanceLegRight?.SetLength(legLengthBent);
  }

  leanUp() {
    const { legLengthExtended } = this;
    this.distanceLegLeft?.SetLength(legLengthExtended);
    this.distanceLegRight?.SetLength(legLengthExtended);
  }

  jump() {
    // prevents player from jumping too quickly after a landing
    if (this.scene.game.getFrame() - this.state.timeGrounded < 6) return; // TODO change to numStepsGrounded

    const { isTailGrounded, isCenterGrounded, isNoseGrounded } = this.board;
    if (isCenterGrounded || isTailGrounded || isNoseGrounded) {
      // TODO these kind of values should come from the RUBE export.
      //  That would make the game somewhat moddable once players can create and download custom levels and characters.
      const jumpVector = isCenterGrounded
        ? vec2Util.Add(this.body.GetWorldVector(new b2.b2Vec2(0, this.jumpForce * 0.35)), new b2.b2Vec2(0, this.jumpForce * 1.2))
        : vec2Util.Add(this.body.GetWorldVector(new b2.b2Vec2(0, this.jumpForce * 0.55)), new b2.b2Vec2(0, this.jumpForce * 0.8));

      // const velocity = this.body.GetLinearVelocity();
      // const perpendicular = new b2.b2Vec2(-velocity.y, velocity.x);
      // const bodyUp = vec2Util.Clone(this.body.GetWorldVector(this.UP));
      // bodyUp.Normalize();
      // perpendicular.Normalize();
      // if (isCenterGrounded) {
      //   vec2Util.Scale(perpendicular, this.jumpForce * 1.25);
      //   vec2Util.Scale(bodyUp, this.jumpForce * 0.3);
      // } else {
      //   vec2Util.Scale(perpendicular, this.jumpForce * 0.5);
      //   vec2Util.Scale(bodyUp, this.jumpForce * 0.85);
      // }
      // let jumpVector = vec2Util.Add(perpendicular, bodyUp);

      this.body.ApplyLinearImpulseToCenter(jumpVector, true);
    }
  }

  update() {
    this.state.update();
    if (this.board.getFramesInAir() > 6) this.resetLegs();
    if (this.state.isCrashed && !this.alreadyDetached) this.detachBoard(); // joints cannot be destroyed within post-solve callback
    if (this.state.isCrashed || this.state.isLevelFinished) return;
    this.board.update();

    this.updateLookAtDirection();
    if (this.state.isCrashed && !this.alreadyDetached) this.detachBoard(); // joints cannot be destroyed within post-solve callback
  }

  private updateLookAtDirection() {
    const userDataMap = this.b2Physics.loader.bodyUserDataMap;
    const velocityDirection = vec2Util.Normalize(vec2Util.Clone(this.body.GetLinearVelocity()));
    const bodyXDirection = vec2Util.Normalize(this.body.GetWorldVector(this.FORWARD));
    // slow down change while in air to jitter while doing flips
    const lerpFactor = this.board.isInAir() ? 0.005 : 0.03;
    const targetFlip = vec2Util.Dot(bodyXDirection, velocityDirection) < 0 ? -1 : 1;
    this.currentBodyFlipDot = this.currentBodyFlipDot + lerpFactor * (targetFlip - this.currentBodyFlipDot);

    if (this.currentBodyFlipDot < 0) {
      this.headImage.flipX = true;
      this.bodyImage.flipX = true;
      this.armUpperLeftImage.setDepth(this.armUpperRightDepth);
      this.armUpperRightImage.setDepth(this.armUpperLeftDepth);
      this.armLowerLeftImage.setDepth(this.armLowerRightDepth);
      this.armLowerRightImage.setDepth(this.armLowerLeftDepth);
    } else {
      this.headImage.flipX = false;
      this.bodyImage.flipX = false;
      this.armUpperLeftImage.setDepth(this.armUpperLeftDepth);
      this.armUpperRightImage.setDepth(this.armUpperRightDepth);
      this.armLowerLeftImage.setDepth(this.armLowerLeftDepth);
      this.armLowerRightImage.setDepth(this.armLowerRightDepth);
    }
  }

  private detachBoard() {
    this.bindingLeft && this.b2Physics.world.DestroyJoint(b2.getPointer(this.bindingLeft));
    this.bindingRight && this.b2Physics.world.DestroyJoint(b2.getPointer(this.bindingRight));
    this.distanceLegLeft && this.b2Physics.world.DestroyJoint(b2.getPointer(this.distanceLegLeft));
    this.distanceLegRight && this.b2Physics.world.DestroyJoint(b2.getPointer(this.distanceLegRight));
    this.weldCenter && this.b2Physics.world.DestroyJoint(b2.getPointer(this.weldCenter));
    this.prismatic && this.b2Physics.world.DestroyJoint(b2.getPointer(this.prismatic));
    this.alreadyDetached = true;
  }

  private initBodyParts() {
    const propName = 'phaserPlayerCharacterPart';
    const propSpringName = 'phaserPlayerCharacterSpring';
    const propSegmentIndex = 'phaserBoardSegmentIndex';
    const head = this.b2Physics.loader.getBodiesByCustomProperty(propName, CharacterPartId.HEAD)[0];
    const body = this.b2Physics.loader.getBodiesByCustomProperty(propName, CharacterPartId.BODY)[0];
    const armUpperLeft = this.b2Physics.loader.getBodiesByCustomProperty(propName, CharacterPartId.ARM_UPPER_LEFT)[0];
    const armLowerLeft = this.b2Physics.loader.getBodiesByCustomProperty(propName, CharacterPartId.ARM_LOWER_LEFT)[0];
    const armUpperRight = this.b2Physics.loader.getBodiesByCustomProperty(propName, CharacterPartId.ARM_UPPER_RIGHT)[0];
    const armLowerRight = this.b2Physics.loader.getBodiesByCustomProperty(propName, CharacterPartId.ARM_LOWER_RIGHT)[0];

    const headImage = this.b2Physics.loader.bodyUserDataMap.get(head)!.image;
    const bodyImage = this.b2Physics.loader.bodyUserDataMap.get(body)!.image;
    const armUpperLeftImage = this.b2Physics.loader.bodyUserDataMap.get(armUpperLeft)!.image;
    const armLowerLeftImage = this.b2Physics.loader.bodyUserDataMap.get(armLowerLeft)!.image;
    const armUpperRightImage = this.b2Physics.loader.bodyUserDataMap.get(armUpperRight)!.image;
    const armLowerRightImage = this.b2Physics.loader.bodyUserDataMap.get(armLowerRight)!.image;

    const legLengthExtended: number = this.b2Physics.loader.customPropertiesMap.get(body)!['legLengthExtended'] as number;
    const legLengthRelaxed: number = this.b2Physics.loader.customPropertiesMap.get(body)!['legLengthRelaxed'] as number;
    const legLengthBent: number = this.b2Physics.loader.customPropertiesMap.get(body)!['legLengthBent'] as number;
    const jumpForce: number = this.b2Physics.loader.customPropertiesMap.get(body)!['jumpForce'] as number;
    const leanForce: number = this.b2Physics.loader.customPropertiesMap.get(body)!['leanForce'] as number;
    const jumpCooldown: number = this.b2Physics.loader.customPropertiesMap.get(body)!['jumpCooldown'] as number;

    if (!head || !body || !armUpperLeft || !armLowerLeft || !armUpperRight || !armLowerRight) throw new Error('Player character b2Bodies not found');
    if (!headImage || !bodyImage || !armUpperLeftImage || !armLowerLeftImage || !armUpperRightImage || !armLowerRightImage) throw new Error('Player character images not found');
    if (!legLengthExtended || !legLengthRelaxed || !legLengthBent) throw new Error('Player character leg lengths not found. Need to be set on character torso body');
    if (!jumpForce || !leanForce || !jumpCooldown) throw new Error('Player character jump/lean properties not found. Need to be set on character torso body');

    const segments = this.b2Physics.loader.getBodiesByCustomProperty(propName, CharacterPartId.BOARD_SEGMENT);
    if (segments.length !== 7) throw new Error('Player character board segments missing');
    segments.sort((a, b) => {
      const aIndex = Number(this.b2Physics.loader.customPropertiesMap.get(a)![propSegmentIndex]);
      const bIndex = Number(this.b2Physics.loader.customPropertiesMap.get(b)![propSegmentIndex]);
      return aIndex - bIndex;
    });

    this.head = head;
    this.body = body;
    this.armUpperLeft = armUpperLeft;
    this.armLowerLeft = armLowerLeft;
    this.armUpperRight = armUpperRight;
    this.armLowerRight = armLowerRight;
    this.headImage = headImage;
    this.bodyImage = bodyImage;
    this.armUpperLeftImage = armUpperLeftImage;
    this.armLowerLeftImage = armLowerLeftImage;
    this.armUpperRightImage = armUpperRightImage;
    this.armLowerRightImage = armLowerRightImage;
    this.armUpperLeftDepth = armUpperLeftImage.depth;
    this.armLowerLeftDepth = armLowerLeftImage.depth;
    this.armUpperRightDepth = armUpperRightImage.depth;
    this.armLowerRightDepth = armLowerRightImage.depth;
    this.boardSegments = segments;
    this.bindingLeft = b2.castObject(this.b2Physics.loader.getJointsByCustomProperty(propSpringName, CharacterPartId.BINDING_LEFT)[0], b2.b2RevoluteJoint);
    this.bindingRight = b2.castObject(this.b2Physics.loader.getJointsByCustomProperty(propSpringName, CharacterPartId.BINDING_RIGHT)[0], b2.b2RevoluteJoint);
    this.distanceLegLeft = b2.castObject(this.b2Physics.loader.getJointsByCustomProperty(propSpringName, CharacterPartId.DISTANCE_LEG_LEFT)[0], b2.b2DistanceJoint);
    this.distanceLegRight = b2.castObject(this.b2Physics.loader.getJointsByCustomProperty(propSpringName, CharacterPartId.DISTANCE_LEG_RIGHT)[0], b2.b2DistanceJoint);
    this.weldCenter = b2.castObject(this.b2Physics.loader.getJointsByCustomProperty(propSpringName, CharacterPartId.WELD_CENTER)[0], b2.b2WeldJoint);
    this.prismatic = b2.castObject(this.b2Physics.loader.getJointsByCustomProperty(propSpringName, CharacterPartId.PRISMATIC)[0], b2.b2PrismaticJoint);
    this.legLengthExtended = legLengthExtended;
    this.legLengthRelaxed = legLengthRelaxed;
    this.legLengthBent = legLengthBent;
    this.jumpForce = jumpForce;
    this.leanForce = leanForce;
    this.jumpCooldown = jumpCooldown;
  }
}

export const enum CharacterPartId {
  HEAD = 'head',
  BODY = 'body',
  ARM_UPPER_LEFT = 'armUpperLeft',
  ARM_LOWER_LEFT = 'armLowerLeft',
  ARM_UPPER_RIGHT = 'armUpperRight',
  ARM_LOWER_RIGHT = 'armLowerRight',
  BOARD_SEGMENT = 'boardSegment',
  BINDING_LEFT = 'bindingLeft',
  BINDING_RIGHT = 'bindingRight',
  DISTANCE_LEG_LEFT = 'distanceLegLeft',
  DISTANCE_LEG_RIGHT = 'distanceLegRight',
  WELD_CENTER = 'weldCenter',
  PRISMATIC = 'prismatic',
}

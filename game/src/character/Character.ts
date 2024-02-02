import {b2} from '..';
import {vec2Util} from '../physics/RUBE/Vec2Math';
import {LoadedScene} from '../physics/RUBE/otherTypes';
import {GameScene} from '../scenes/GameScene';
import {Snowboard} from './Snowboard';
import {State} from './State';

export class Character {
  static instances: Character[] = [];

  head: Box2D.b2Body;
  body: Box2D.b2Body;
  armUpperLeft: Box2D.b2Body;
  armLowerLeft: Box2D.b2Body;
  armUpperRight: Box2D.b2Body;
  armLowerRight: Box2D.b2Body;

  bindingLeft: Box2D.b2RevoluteJoint | null;
  bindingRight: Box2D.b2RevoluteJoint | null;
  distanceLegLeft: Box2D.b2DistanceJoint | null;
  distanceLegRight: Box2D.b2DistanceJoint | null;
  weldCenter: Box2D.b2WeldJoint | null;
  prismatic: Box2D.b2PrismaticJoint | null;

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

  legLengthExtended: number;
  legLengthRelaxed: number;
  legLengthBent: number;
  jumpCooldown: number; // in num frames. Prevents player from jumping too quickly after a landing
  jumpForce: number;
  leanForce: number;

  id: string;
  board: Snowboard;
  state: State;
  private readonly FORWARD: Box2D.b2Vec2 = new b2.b2Vec2(1, 0);
  private readonly ZERO: Box2D.b2Vec2 = new b2.b2Vec2(0, 0);
  private readonly UP: Box2D.b2Vec2 = new b2.b2Vec2(0, 1);
  private alreadyDetached: boolean = false;
  private currentBodyFlipDot: number = 1;

  constructor(public scene: GameScene, private rubeScene: LoadedScene) {
    this.id = rubeScene.id;
    this.initBodyParts();
    this.state = new State(this);
    this.board = new Snowboard(this);
    Character.instances.push(this);
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

  leanBackward() {
    const {legLengthBent, legLengthExtended, leanForce} = this;
    this.setLegLength(legLengthBent, legLengthExtended);
    this.body.ApplyAngularImpulse(leanForce, true);
  }

  leanForward() {
    const {legLengthBent, legLengthExtended, leanForce} = this;
    this.setLegLength(legLengthExtended, legLengthBent);
    this.body.ApplyAngularImpulse(-leanForce, true);
  }

  leanCenter() {
    const {legLengthBent} = this;
    this.setLegLength(legLengthBent, legLengthBent);
  }

  leanUp() {
    const {legLengthExtended} = this;
    this.setLegLength(legLengthExtended, legLengthExtended);
  }

  jump() {
    // prevents player from jumping too quickly after a landing
    if (this.scene.game.getFrame() - this.state.numFramesGrounded < 12) return;

    const {isTailGrounded, isCenterGrounded, isNoseGrounded} = this.board;
    if (isCenterGrounded || isTailGrounded || isNoseGrounded) {
      const jumpVector = isCenterGrounded
        ? vec2Util.Add(this.body.GetWorldVector(new b2.b2Vec2(0, this.jumpForce * 0.35)), {x: 0, y: this.jumpForce * 1.2})
        : vec2Util.Add(this.body.GetWorldVector(new b2.b2Vec2(0, this.jumpForce * 0.55)), {x: 0, y: this.jumpForce * 0.8});

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

  isPartOfMe(body: Box2D.b2Body): boolean {
    return Boolean(this.rubeScene.entityData.get(body));
  }

  private setLegLength(left: number, right: number) {
    this.distanceLegLeft?.SetLength(left);
    this.distanceLegRight?.SetLength(right);
  }

  private resetLegs() {
    const {legLengthRelaxed} = this;
    this.distanceLegLeft?.SetLength(legLengthRelaxed);
    this.distanceLegRight?.SetLength(legLengthRelaxed);
  }

  private updateLookAtDirection() {
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
    const world = this.scene.b2Physics.worldEntity.world;
    if (this.bindingLeft) world.DestroyJoint(b2.getPointer(this.bindingLeft));
    if (this.bindingRight) world.DestroyJoint(b2.getPointer(this.bindingRight));
    if (this.distanceLegLeft) world.DestroyJoint(b2.getPointer(this.distanceLegLeft));
    if (this.distanceLegRight) world.DestroyJoint(b2.getPointer(this.distanceLegRight));
    if (this.weldCenter) world.DestroyJoint(b2.getPointer(this.weldCenter));
    if (this.prismatic) world.DestroyJoint(b2.getPointer(this.prismatic));
    this.alreadyDetached = true;
  }

  private initBodyParts() {
    const rubeScene = this.rubeScene;

    function getBodyByProp(partId: CharacterPartId) {
      const bodyEntities = rubeScene.bodies.filter(e => e.customProps['phaserPlayerCharacterPart'] === partId);
      if (!bodyEntities.length) throw new Error(`Player character body not found: ${partId}`);
      if (bodyEntities.length > 1) throw new Error(`Player character multiple bodies found for part id: ${partId}`);
      return bodyEntities[0].body;
    }

    function getJointByProp(partId: CharacterPartId, type: unknown) {
      const jointEntities = rubeScene.joints.filter(e => e.customProps['phaserPlayerCharacterSpring'] === partId);
      if (!jointEntities.length) throw new Error(`Player character joint not found: ${partId}`);
      if (jointEntities.length > 1) throw new Error(`Player character multiple joints found for part id: ${partId}`);
      // @ts-expect-error type is unknown gives lint error but it's fine here
      return b2.castObject(jointEntities[0].joint, type);
    }

    const getBodyImage = (body: Box2D.b2Body): Phaser.GameObjects.Image => {
      const bodyEntity = rubeScene.entityData.get(body);
      if (bodyEntity && bodyEntity.type !== 'body') throw new Error('Expected bodyEntity to be of type "body"');
      const imageEntity = bodyEntity?.image;
      if (!imageEntity || imageEntity.type !== 'image') throw new Error('Expected imageEntity to be of type "image"');
      return imageEntity.image as Phaser.GameObjects.Image;
    };

    const getBodyCustomProp = (body: Box2D.b2Body, prop: BodyCustomProps) => {
      const customProp = rubeScene.entityData.get(body)?.customProps[prop];
      if (!customProp) throw new Error(`Player character custom prop not found: ${body}`);
      return customProp;
    };

    // Bodies
    this.head = getBodyByProp('head');
    this.body = getBodyByProp('body');
    this.armUpperLeft = getBodyByProp('armUpperLeft');
    this.armLowerLeft = getBodyByProp('armLowerLeft');
    this.armUpperRight = getBodyByProp('armUpperRight');
    this.armLowerRight = getBodyByProp('armLowerRight');
    // Joints
    this.bindingLeft = getJointByProp('bindingLeft', b2.b2RevoluteJoint);
    this.bindingRight = getJointByProp('bindingRight', b2.b2RevoluteJoint);
    this.distanceLegLeft = getJointByProp('distanceLegLeft', b2.b2DistanceJoint);
    this.distanceLegRight = getJointByProp('distanceLegRight', b2.b2DistanceJoint);
    this.weldCenter = getJointByProp('weldCenter', b2.b2WeldJoint);
    this.prismatic = getJointByProp('prismatic', b2.b2PrismaticJoint);
    // Images
    this.headImage = getBodyImage(this.head);
    this.bodyImage = getBodyImage(this.body);
    this.armUpperLeftImage = getBodyImage(this.armUpperLeft);
    this.armLowerLeftImage = getBodyImage(this.armLowerLeft);
    this.armUpperRightImage = getBodyImage(this.armUpperRight);
    this.armLowerRightImage = getBodyImage(this.armLowerRight);
    // IMAGE DEPTH
    this.armUpperLeftDepth = this.armUpperLeftImage.depth;
    this.armLowerLeftDepth = this.armLowerLeftImage.depth;
    this.armUpperRightDepth = this.armUpperRightImage.depth;
    this.armLowerRightDepth = this.armLowerRightImage.depth;
    // Custom Props
    this.legLengthExtended = getBodyCustomProp(this.body, 'legLengthExtended') as number;
    this.legLengthRelaxed = getBodyCustomProp(this.body, 'legLengthRelaxed') as number;
    this.legLengthBent = getBodyCustomProp(this.body, 'legLengthBent') as number;
    this.jumpForce = getBodyCustomProp(this.body, 'jumpForce') as number;
    this.leanForce = getBodyCustomProp(this.body, 'leanForce') as number;
    this.jumpCooldown = getBodyCustomProp(this.body, 'jumpCooldown') as number;
  }
}

export type CharacterPartId = 'head' | 'body' | 'armUpperLeft' | 'armLowerLeft' | 'armUpperRight' | 'armLowerRight' | 'boardSegment' | 'bindingLeft' | 'bindingRight' | 'distanceLegLeft' | 'distanceLegRight' | 'weldCenter' | 'prismatic';
type BodyCustomProps = 'legLengthExtended' | 'legLengthRelaxed' | 'legLengthBent' | 'jumpForce' | 'leanForce' | 'jumpCooldown';

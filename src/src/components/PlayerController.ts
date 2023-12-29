import { Physics } from './Physics';
import { b2 } from '../index';
import GameScene from '../scenes/GameScene';
import { Snowboard } from './Snowboard';
import { State } from './State';
import { PanelIds } from '../scenes/GameUIScene';
import { vec2Util } from '../util/RUBE/Vec2Math';


export class PlayerController {
  readonly scene: GameScene;
  readonly b2Physics: Physics;

  parts: IBodyParts;
  board: Snowboard;
  state: State;

  private readonly jumpForce: number = 13;
  private readonly leanForce: number = 2.75;
  private readonly jumpCooldown: number = 15; // in num frames. Prevents player from jumping too quickly after a landing
  private keyW: Phaser.Input.Keyboard.Key;
  private keyA: Phaser.Input.Keyboard.Key;
  private keyS: Phaser.Input.Keyboard.Key;
  private keyD: Phaser.Input.Keyboard.Key;
  private keyArrowUp: Phaser.Input.Keyboard.Key;
  private keyArrowLeft: Phaser.Input.Keyboard.Key;
  private keyArrowDown: Phaser.Input.Keyboard.Key;
  private keyArrowRight: Phaser.Input.Keyboard.Key;
  private keySpace: Phaser.Input.Keyboard.Key;
  private jumpKeyDownStartFrame: number = 0;
  private jumpKeyDown: boolean;
  private alreadyDetached = false;
  private currentBodyFlipDot = 1;
  private readonly ZERO: Box2D.b2Vec2 = new b2.b2Vec2(0, 0);
  private readonly UP: Box2D.b2Vec2 = new b2.b2Vec2(0, 1);
  private readonly FORWARD: Box2D.b2Vec2 = new b2.b2Vec2(1, 0);

  constructor(scene: GameScene, b2Physics: Physics) {
    this.scene = scene;
    this.b2Physics = b2Physics;
    this.scene.observer.on('pause_game_icon_pressed', () => this.pauseGame());
    this.scene.observer.on('how_to_play_icon_pressed', () => this.pauseGame(PanelIds.PANEL_HOW_TO_PLAY));
    this.scene.observer.on('resume_game', () => this.b2Physics.isPaused = false);

    this.initBodyParts();
    this.board = new Snowboard(this);
    this.state = new State(this);
    this.initKeyboardInputs();
  }

  private initKeyboardInputs() {
    if (!this.scene.input.keyboard) throw new Error('Keyboard input not available. No touch input supported yet.');
    this.keySpace = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyW = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyArrowUp = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.keyArrowLeft = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.keyArrowRight = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.keyArrowDown = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

    this.keySpace.onDown = () => this.pauseGame();
    const onJump = () => {
      this.jumpKeyDown = true;
      if (!this.state.isCrashed && !this.state.levelFinished && !this.b2Physics.isPaused && this.state.getState() === 'grounded') {
        this.jumpKeyDownStartFrame = this.scene.game.getFrame();
        this.scene.observer.emit('jump_start');
      }
    };
    this.keyW.onDown = onJump;
    this.keyArrowUp.onDown = onJump;
    this.keyW.onUp = () => this.jumpKeyDown = false;
    this.keyArrowUp.onUp = () => this.jumpKeyDown = false;

  }

  private pauseGame(activePanel: PanelIds = PanelIds.PANEL_PAUSE_MENU) {
    if (this.state.isCrashed || this.state.levelFinished) return; // can only pause during an active run. After crash or finish, the "Your score" panel is shown.
    this.b2Physics.isPaused = !this.b2Physics.isPaused;
    this.state.updateComboLeeway(); // otherwise it continues during pause.
    this.scene.observer.emit('toggle_pause', this.b2Physics.isPaused, activePanel);
  }

  update() {
    // TODO create a command data structure from which runs can be repeated instead of using the raw keyboard input states to determine when to do anything input related
    //  This has the advantage that:
    //  - we can test how deterministic the physics are
    //  - we can replay runs IF they are deterministic (I think box2d isn't 100% deterministic across Operating systems due to floating point implementation differences)
    //  - we can serialize and save the commands for each frame 
    if (this.b2Physics.isPaused) return;
    this.state.update();
    if (this.board.getFramesInAir() > 6 && !this.jumpKeyDown) this.resetLegs();
    if (this.state.isCrashed && !this.alreadyDetached) this.detachBoard(); // joints cannot be destroyed within post-solve callback
    if (this.state.isCrashed || this.state.levelFinished) return;
    this.board.update();
    this.applyInputs();
    this.updateLookAtDirection();
  }

  private applyInputs() {
    if (this.jumpKeyDown && this.scene.game.getFrame() - this.jumpKeyDownStartFrame <= this.jumpCooldown) this.jump();
    if (this.jumpKeyDown) this.leanUp();
    if (this.keyArrowLeft.isDown || this.keyA.isDown) this.leanBackward();
    if (this.keyArrowRight.isDown || this.keyD.isDown) this.leanForward();
    if (this.keyArrowDown.isDown || this.keyS.isDown) this.leanCenter(); // needs to be last to override leanForward and leanBackward and speed up rotation
  }

  private updateLookAtDirection() {
    const userDataMap = this.b2Physics.loader.bodyUserDataMap;
    const velocityDirection = vec2Util.Normalize(vec2Util.Clone(this.parts.body.GetLinearVelocity()));
    const bodyXDirection = vec2Util.Normalize(this.parts.body.GetWorldVector(this.FORWARD));
    // slow down change while in air to jitter while doing flips
    const lerpFactor = this.state.getState() === 'grounded' ? 0.03 : 0.005;
    const targetFlip = vec2Util.Dot(bodyXDirection, velocityDirection) < 0 ? -1 : 1;
    this.currentBodyFlipDot = this.currentBodyFlipDot + lerpFactor * (targetFlip - this.currentBodyFlipDot);

    if (this.currentBodyFlipDot < 0) {
      this.parts.headImage.flipX = true;
      this.parts.bodyImage.flipX = true;
      this.parts.armUpperLeftImage.setDepth(this.parts.armUpperRightDepth);
      this.parts.armUpperRightImage.setDepth(this.parts.armUpperLeftDepth);
      this.parts.armLowerLeftImage.setDepth(this.parts.armLowerRightDepth);
      this.parts.armLowerRightImage.setDepth(this.parts.armLowerLeftDepth);
    } else {
      this.parts.headImage.flipX = false;
      this.parts.bodyImage.flipX = false;
      this.parts.armUpperLeftImage.setDepth(this.parts.armUpperLeftDepth);
      this.parts.armUpperRightImage.setDepth(this.parts.armUpperRightDepth);
      this.parts.armLowerLeftImage.setDepth(this.parts.armLowerLeftDepth);
      this.parts.armLowerRightImage.setDepth(this.parts.armLowerRightDepth);
    }
  }

  private detachBoard() {
    this.parts.bindingLeft && this.b2Physics.world.DestroyJoint(b2.getPointer(this.parts.bindingLeft));
    this.parts.bindingRight && this.b2Physics.world.DestroyJoint(b2.getPointer(this.parts.bindingRight));
    this.parts.distanceLegLeft && this.b2Physics.world.DestroyJoint(b2.getPointer(this.parts.distanceLegLeft));
    this.parts.distanceLegRight && this.b2Physics.world.DestroyJoint(b2.getPointer(this.parts.distanceLegRight));
    this.parts.weldCenter && this.b2Physics.world.DestroyJoint(b2.getPointer(this.parts.weldCenter));
    this.parts.prismatic && this.b2Physics.world.DestroyJoint(b2.getPointer(this.parts.prismatic));
    this.alreadyDetached = true;
  }

  private jump() {
    // prevents player from jumping too quickly after a landing
    if (this.scene.game.getFrame() - this.state.timeGrounded < 6) return; // TODO change to numStepsGrounded

    const { isTailGrounded, isCenterGrounded, isNoseGrounded } = this.board;
    if (isCenterGrounded || isTailGrounded || isNoseGrounded) {
      // TODO these kind of values should come from the RUBE export.
      //  That would make the game somewhat moddable once players can create and download custom levels and characters.
      const jumpVector = isCenterGrounded
        ? vec2Util.Add(this.parts.body.GetWorldVector(new b2.b2Vec2(0, this.jumpForce * 0.3)), new b2.b2Vec2(0, this.jumpForce * 1.25))
        : vec2Util.Add(this.parts.body.GetWorldVector(new b2.b2Vec2(0, this.jumpForce * 0.5)), new b2.b2Vec2(0, this.jumpForce * 0.85));

      // const velocity = this.parts.body.GetLinearVelocity();
      // const perpendicular = new b2.b2Vec2(-velocity.y, velocity.x);
      // const bodyUp = vec2Util.Clone(this.parts.body.GetWorldVector(this.UP));
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

      this.parts.body.ApplyLinearImpulseToCenter(jumpVector, true);
    }
  }

  private resetLegs() {
    this.parts.distanceLegLeft?.SetLength(0.65);
    this.parts.distanceLegRight?.SetLength(0.65);
  }

  private leanBackward() {
    this.parts.distanceLegLeft?.SetLength(0.5);
    this.parts.distanceLegRight?.SetLength(0.8);
    this.parts.body.ApplyAngularImpulse(this.leanForce, true);
  }

  private leanForward() {
    this.parts.distanceLegLeft?.SetLength(0.8);
    this.parts.distanceLegRight?.SetLength(0.5);
    this.parts.body.ApplyAngularImpulse(-this.leanForce, true);
  }

  private leanCenter() {
    this.parts.distanceLegLeft?.SetLength(0.5);
    this.parts.distanceLegRight?.SetLength(0.5);
  }

  private leanUp() {
    this.parts.distanceLegLeft?.SetLength(0.8);
    this.parts.distanceLegRight?.SetLength(0.8);
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

    if (!head || !body || !armUpperLeft || !armLowerLeft || !armUpperRight || !armLowerRight) throw new Error('Player character b2Bodies not found');
    if (!headImage || !bodyImage || !armUpperLeftImage || !armLowerLeftImage || !armUpperRightImage || !armLowerRightImage) throw new Error('Player character images not found');

    const segments = this.b2Physics.loader.getBodiesByCustomProperty(propName, CharacterPartId.BOARD_SEGMENT);
    segments.sort((a, b) => {
      const aIndex = Number(this.b2Physics.loader.customPropertiesMap.get(a)![propSegmentIndex]);
      const bIndex = Number(this.b2Physics.loader.customPropertiesMap.get(b)![propSegmentIndex]);
      return aIndex - bIndex;
    });

    this.parts = {
      head,
      body,
      armUpperLeft,
      armLowerLeft,
      armUpperRight,
      armLowerRight,
      headImage,
      bodyImage,
      armUpperLeftImage,
      armLowerLeftImage,
      armUpperRightImage,
      armLowerRightImage,
      armUpperLeftDepth: armUpperLeftImage.depth,
      armLowerLeftDepth: armLowerLeftImage.depth,
      armUpperRightDepth: armUpperRightImage.depth,
      armLowerRightDepth: armLowerRightImage.depth,
      boardSegments: segments,
      bindingLeft: b2.castObject(this.b2Physics.loader.getJointsByCustomProperty(propSpringName, CharacterPartId.BINDING_LEFT)[0], b2.b2RevoluteJoint),
      bindingRight: b2.castObject(this.b2Physics.loader.getJointsByCustomProperty(propSpringName, CharacterPartId.BINDING_RIGHT)[0], b2.b2RevoluteJoint),
      distanceLegLeft: b2.castObject(this.b2Physics.loader.getJointsByCustomProperty(propSpringName, CharacterPartId.DISTANCE_LEG_LEFT)[0], b2.b2DistanceJoint),
      distanceLegRight: b2.castObject(this.b2Physics.loader.getJointsByCustomProperty(propSpringName, CharacterPartId.DISTANCE_LEG_RIGHT)[0], b2.b2DistanceJoint),
      weldCenter: b2.castObject(this.b2Physics.loader.getJointsByCustomProperty(propSpringName, CharacterPartId.WELD_CENTER)[0], b2.b2WeldJoint),
      prismatic: b2.castObject(this.b2Physics.loader.getJointsByCustomProperty(propSpringName, CharacterPartId.PRISMATIC)[0], b2.b2PrismaticJoint),
    };
  }
}

export interface IBodyParts {
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

import * as Ph from 'phaser';
import { Physics } from './Physics';
import { DEBUG, b2 } from '../index';
import GameScene from '../scenes/GameScene';
import { WickedSnowboard } from './Snowboard';
import { State } from './State';
import { PanelIds } from '../scenes/GameUIScene';
import { vec2Util } from '../util/RUBE/Vec2Math';


export class PlayerController {
  readonly scene: GameScene;
  readonly b2Physics: Physics;
  private readonly cursors: Ph.Types.Input.Keyboard.CursorKeys | undefined;

  parts: IBodyParts;
  board: WickedSnowboard;
  state: State;

  private readonly jumpForce: number = 750 * 60;
  private leanForce: number = 3 * 60;
  private debugControls: Phaser.Cameras.Controls.SmoothedKeyControl;
  private debugKeyLeft: Phaser.Input.Keyboard.Key | undefined;
  private debugKeyRight: Phaser.Input.Keyboard.Key | undefined;
  private debugKeyUp: Phaser.Input.Keyboard.Key | undefined;
  private debugKeyDown: Phaser.Input.Keyboard.Key | undefined;

  constructor(scene: GameScene, b2Physics: Physics) {
    this.scene = scene;
    this.b2Physics = b2Physics;
    this.cursors = this.scene.input.keyboard?.createCursorKeys();
    this.scene.observer.on('pause_game_icon_pressed', () => this.pauseGame());
    this.scene.observer.on('how_to_play_icon_pressed', () => this.pauseGame(PanelIds.PANEL_HOW_TO_PLAY));
    this.scene.input.keyboard?.on('keydown-ESC', () => this.pauseGame());
    this.cursors?.space.on('down', () => this.pauseGame());
    this.scene.observer.on('resume_game', () => this.b2Physics.isPaused = false);

    this.cursors?.up.on('down', () => {
      // TODO simplify
      if (this.cursors && !this.state.isCrashed && !this.state.levelFinished && this.state.getState() === 'grounded' && this.scene.game.getTime() - this.cursors.up.timeDown <= 250 && !this.b2Physics.isPaused) {
        this.scene.observer.emit('jump_start');
      }
    });

    this.initBodyParts();
    this.board = new WickedSnowboard(this);
    this.state = new State(this);
  }

  private pauseGame(activePanel: PanelIds = PanelIds.PANEL_PAUSE_MENU) {
    if (this.state.isCrashed || this.state.levelFinished) return; // can only pause during an active run. After crash or finish, the "Your score" panel is shown.
    this.b2Physics.isPaused = !this.b2Physics.isPaused;
    this.state.updateComboLeeway(); // otherwise it continues during pause.
    this.scene.observer.emit('toggle_pause', this.b2Physics.isPaused, activePanel);
  }

  update(delta: number) {
    if (this.b2Physics.isPaused) return;

    if (DEBUG) {
      this.debugControls && this.debugControls.update(delta);
      if (this.debugKeyLeft?.isDown) this.scene.cameras.main.scrollX -= 300 * delta;
      if (this.debugKeyRight?.isDown) this.scene.cameras.main.scrollX += 300 * delta;
      if (this.debugKeyUp?.isDown) this.scene.cameras.main.scrollY -= 300 * delta;
      if (this.debugKeyDown?.isDown) this.scene.cameras.main.scrollY += 300 * delta;
    }

    this.state.update(delta);
    // this.state.isCrashed && this.detachBoard(); // joints cannot be destroyed within post-solve callback
    this.board.getTimeInAir() > 100 && this.resetLegs();

    if (!this.state.isCrashed && !this.state.levelFinished) {
      this.board.update(delta);

      // Touch/Mouse input
      if (this.scene.input.activePointer?.isDown && this.scene.input.activePointer.wasTouch) {
        const pointer = this.scene.input.activePointer; // activePointer undefined until after first touch input
        pointer.motionFactor = 0.2;
        this.scene.input.activePointer.x < this.scene.cameras.main.width / 2 ? this.leanBackward(delta) : this.leanForward(delta);
        pointer.velocity.y < -30 && this.scene.game.getTime() - pointer.moveTime <= 250 && this.jump(delta);
      } else {
        this.scene.input.activePointer.motionFactor = 0.8;
      }

      // Keyboard input
      if (this.cursors) {
        this.cursors.up.isDown && this.leanUp(delta);
        this.cursors.left.isDown && this.leanBackward(delta);
        this.cursors.right.isDown && this.leanForward(delta);
        this.cursors.down.isDown && this.leanCenter(delta);
        this.cursors.up.isDown && this.scene.game.getTime() - this.cursors.up.timeDown <= 250 && this.jump(delta);
      }
    }
  }

  private detachBoard() {
    this.parts.bindingLeft && this.b2Physics.world.DestroyJoint(this.parts.bindingLeft);
    this.parts.bindingRight && this.b2Physics.world.DestroyJoint(this.parts.bindingRight);
    this.parts.distanceLegLeft && this.b2Physics.world.DestroyJoint(this.parts.distanceLegLeft);
    this.parts.distanceLegRight && this.b2Physics.world.DestroyJoint(this.parts.distanceLegRight);
    this.parts.weldCenter && this.b2Physics.world.DestroyJoint(this.parts.weldCenter);
    this.parts.prismatic && this.b2Physics.world.DestroyJoint(this.parts.prismatic);
  }

  private jump(delta: number) {
    // prevents player from jumping too quickly after a landing
    if (this.scene.game.getTime() - this.state.timeGrounded < 100) return; // TODO change to numStepsGrounded

    this.leanUp(delta);

    const { isTailGrounded, isCenterGrounded, isNoseGrounded } = this.board;
    if (isCenterGrounded || isTailGrounded || isNoseGrounded) {
      const force = this.jumpForce * delta;
      // TODO these kind of values should come from the RUBE export.
      //  That would make the game somewhat moddable once players can create and download custom levels and characters.
      const jumpVector = isCenterGrounded
        ? vec2Util.Add(this.parts.body.GetWorldVector(new b2.b2Vec2(0, force * 0.3)), new b2.b2Vec2(0, force * 1.25))
        : vec2Util.Add(this.parts.body.GetWorldVector(new b2.b2Vec2(0, force * 0.5)), new b2.b2Vec2(0, force * 0.85));
      this.parts.body.ApplyForceToCenter(jumpVector, true);
    }
  }

  private resetLegs() {
    this.parts.distanceLegLeft?.SetLength(0.65);
    this.parts.distanceLegRight?.SetLength(0.65);
  }

  private leanBackward(delta: number) {
    this.parts.distanceLegLeft?.SetLength(0.55);
    this.parts.distanceLegRight?.SetLength(0.8);
    // @ts-ignore
    this.parts.weldCenter.m_referenceAngle = Math.PI / 180 * -10;
    this.parts.body.ApplyAngularImpulse(this.leanForce * delta, true);
  }

  private leanForward(delta: number) {
    this.parts.distanceLegLeft?.SetLength(0.8);
    this.parts.distanceLegRight?.SetLength(0.55);
    // @ts-ignore
    this.parts.weldCenter.m_referenceAngle = Math.PI / 180 * 10;
    this.parts.body.ApplyAngularImpulse(-this.leanForce * delta, true);
  }

  private leanCenter(delta: number) {
    this.parts.distanceLegLeft?.SetLength(0.55);
    this.parts.distanceLegRight?.SetLength(0.55);
    // @ts-ignore
    this.parts.weldCenter.m_referenceAngle = 0;
  }

  private leanUp(delta: number) {
    this.parts.distanceLegLeft?.SetLength(0.8);
    this.parts.distanceLegRight?.SetLength(0.8);
    // @ts-ignore
    this.parts.weldCenter.m_referenceAngle = 0;
  }

  private initBodyParts() {
    this.parts = {
      head: this.b2Physics.rubeLoader.getBodiesByCustomProperty('string', 'phaserPlayerCharacterPart', 'head')[0],
      body: this.b2Physics.rubeLoader.getBodiesByCustomProperty('string', 'phaserPlayerCharacterPart', 'body')[0],
      boardSegments: this.b2Physics.rubeLoader.getBodiesByCustomProperty('string', 'phaserPlayerCharacterPart', 'boardSegment'),

      bindingLeft: b2.castObject(this.b2Physics.rubeLoader.getJointsByCustomProperty('string', 'phaserPlayerCharacterSpring', 'bindingLeft')[0], b2.b2RevoluteJoint),
      bindingRight: b2.castObject(this.b2Physics.rubeLoader.getJointsByCustomProperty('string', 'phaserPlayerCharacterSpring', 'bindingRight')[0], b2.b2RevoluteJoint),
      distanceLegLeft: b2.castObject(this.b2Physics.rubeLoader.getJointsByCustomProperty('string', 'phaserPlayerCharacterSpring', 'distanceLegLeft')[0], b2.b2DistanceJoint),
      distanceLegRight: b2.castObject(this.b2Physics.rubeLoader.getJointsByCustomProperty('string', 'phaserPlayerCharacterSpring', 'distanceLegRight')[0], b2.b2DistanceJoint),
      weldCenter: b2.castObject(this.b2Physics.rubeLoader.getJointsByCustomProperty('string', 'phaserPlayerCharacterSpring', 'weldCenter')[0], b2.b2WeldJoint),
      prismatic: b2.castObject(this.b2Physics.rubeLoader.getJointsByCustomProperty('string', 'phaserPlayerCharacterSpring', 'prismatic')[0], b2.b2PrismaticJoint),
    };

    // debugger;
  }
}


export interface IBodyParts {
  head: Box2D.b2Body;
  body: Box2D.b2Body;
  boardSegments: (Box2D.b2Body)[];

  bindingLeft: Box2D.b2RevoluteJoint | null;
  bindingRight: Box2D.b2RevoluteJoint | null;
  distanceLegLeft: Box2D.b2DistanceJoint | null;
  distanceLegRight: Box2D.b2DistanceJoint | null;
  weldCenter: Box2D.b2WeldJoint | null;
  prismatic: Box2D.b2PrismaticJoint | null;
}

import * as Ph from 'phaser';
import * as Pl from '@box2d/core';
import {Physics} from './Physics';
import {DEBUG, stats} from '../index';
import {WickedSnowboard} from './Snowboard';
import {State} from './State';
import {RubeEntity} from '../util/RUBE/RubeLoaderInterfaces';
import {PanelIds} from '../scenes/GameUIScene';
import {Observer} from "../util/observer";


export class PlayerController {
  readonly scene: Ph.Scene;
  readonly b2Physics: Physics;
  private readonly cursors: Ph.Types.Input.Keyboard.CursorKeys | undefined;

  parts: IBodyParts;
  board: WickedSnowboard;
  state: State;

  private readonly jumpForce: number = 650;
  private leanForce: number = 2.5;
  private readonly jumpVector: Pl.b2Vec2 = new Pl.b2Vec2(0, 0);
  private debugControls: Phaser.Cameras.Controls.SmoothedKeyControl;
  private debugKeyLeft: Phaser.Input.Keyboard.Key | undefined;
  private debugKeyRight: Phaser.Input.Keyboard.Key | undefined;
  private debugKeyUp: Phaser.Input.Keyboard.Key | undefined;
  private debugKeyDown: Phaser.Input.Keyboard.Key | undefined;

  constructor(scene: Ph.Scene, b2Physics: Physics) {
    this.scene = scene;
    this.b2Physics = b2Physics;
    this.cursors = this.scene.input.keyboard?.createCursorKeys();
    Observer.instance.on('pause_game_icon_pressed', () => this.pauseGame());
    Observer.instance.on('how_to_play_icon_pressed', () => this.pauseGame(PanelIds.PANEL_HOW_TO_PLAY));
    this.scene.input.keyboard?.on('keydown-ESC', () => this.pauseGame());
    this.cursors?.space.on('down', () => this.pauseGame());
    Observer.instance.on('resume_game', () => this.b2Physics.isPaused = false);

    this.cursors?.up.on('down', () => {
      // TODO simplify
      if (this.cursors && !this.state.isCrashed && !this.state.levelFinished && this.state.getState() === 'grounded' && this.scene.game.getTime() - this.cursors.up.timeDown <= 250 && !this.b2Physics.isPaused) {
        Observer.instance.emit('jump_start');
      }
    });

    this.initBodyParts();
    this.board = new WickedSnowboard(this);
    this.state = new State(this);

    if (DEBUG) {
      this.debugKeyLeft = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.debugKeyRight = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      this.debugKeyUp = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.debugKeyDown = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S);
      this.debugControls = new Phaser.Cameras.Controls.SmoothedKeyControl({
        camera: this.scene.cameras.main,
        zoomIn: this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
        zoomOut: this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.E),
        acceleration: 0.05,
        drag: 0.0015,
        maxSpeed: 1.0,
        zoomSpeed: 0.02,
      });
    }
  }

  private pauseGame(activePanel: PanelIds = PanelIds.PANEL_PAUSE_MENU) {
    if (this.state.isCrashed || this.state.levelFinished) return; // can only pause during an active run. After crash or finish, the "Your score" panel is shown.
    this.b2Physics.isPaused = !this.b2Physics.isPaused;
    this.state.updateComboLeeway(); // otherwise it continues during pause.
    Observer.instance.emit('toggle_pause', this.b2Physics.isPaused, activePanel);
  }

  update() {
    if (this.b2Physics.isPaused) return;
    stats.begin('snowman');

    this.state.update();
    this.state.isCrashed && this.detachBoard(); // joints cannot be destroyed within post-solve callback
    this.board.getTimeInAir() > 100 && this.resetLegs();

    if (!this.state.isCrashed && !this.state.levelFinished) {
      this.board.update();

      // Touch/Mouse input
      if (this.scene.input.activePointer?.isDown && this.scene.input.activePointer.wasTouch) {
        const pointer = this.scene.input.activePointer; // activePointer undefined until after first touch input
        pointer.motionFactor = 0.2;
        this.scene.input.activePointer.x < this.scene.cameras.main.width / 2 ? this.leanBackward() : this.leanForward();
        pointer.velocity.y < -30 && this.scene.game.getTime() - pointer.moveTime <= 250 && this.jump();
      } else {
        this.scene.input.activePointer.motionFactor = 0.8;
      }

      // Keyboard input
      if (this.cursors) {
        this.cursors.up.isDown && this.leanUp();
        this.cursors.left.isDown && this.leanBackward();
        this.cursors.right.isDown && this.leanForward();
        this.cursors.down.isDown && this.leanCenter();
        this.cursors.up.isDown && this.scene.game.getTime() - this.cursors.up.timeDown <= 250 && this.jump();
      }
    }
    stats.end('snowman');
  }

  private detachBoard() {
    this.parts.bindingLeft && this.b2Physics.world.DestroyJoint(this.parts.bindingLeft);
    this.parts.bindingRight && this.b2Physics.world.DestroyJoint(this.parts.bindingRight);
    this.parts.distanceLegLeft && this.b2Physics.world.DestroyJoint(this.parts.distanceLegLeft);
    this.parts.distanceLegRight && this.b2Physics.world.DestroyJoint(this.parts.distanceLegRight);
    this.parts.weldCenter && this.b2Physics.world.DestroyJoint(this.parts.weldCenter);
    this.parts.prismatic && this.b2Physics.world.DestroyJoint(this.parts.prismatic);
  }

  private jump() {
    // prevents player from jumping too quickly after a landing
    if (this.scene.game.getTime() - this.state.timeGrounded < 100) return; // TODO change to numStepsGrounded

    this.leanUp();

    const {isTailGrounded, isCenterGrounded, isNoseGrounded} = this.board;
    if (isCenterGrounded || isTailGrounded || isNoseGrounded) {
      const force = this.jumpForce;
      const jumpVector = this.jumpVector.Set(0, 0);
      // TODO these kind of values should come from the RUBE export.
      //  That would make the game somewhat moddable once players can create and download custom levels and characters.
      isCenterGrounded
        ? this.parts.body.GetWorldVector({x: 0, y: force * 0.3}, jumpVector).Add({x: 0, y: force * 1.25})
        : this.parts.body.GetWorldVector({x: 0, y: force * 0.5}, jumpVector).Add({x: 0, y: force * 0.85});
      this.parts.body.ApplyForceToCenter(jumpVector, true);
    }
  }

  private resetLegs() {
    this.parts.distanceLegLeft?.SetLength(0.65);
    this.parts.distanceLegRight?.SetLength(0.65);
  }

  private leanBackward() {
    this.parts.distanceLegLeft?.SetLength(0.55);
    this.parts.distanceLegRight?.SetLength(0.8);
    // @ts-ignore
    this.parts.weldCenter.m_referenceAngle = Math.PI / 180 * -10;
    this.parts.body.ApplyAngularImpulse(this.leanForce);
  }

  private leanForward() {
    this.parts.distanceLegLeft?.SetLength(0.8);
    this.parts.distanceLegRight?.SetLength(0.55);
    // @ts-ignore
    this.parts.weldCenter.m_referenceAngle = Math.PI / 180 * 10;
    this.parts.body.ApplyAngularImpulse(-this.leanForce);
  }

  private leanCenter() {
    this.parts.distanceLegLeft?.SetLength(0.55);
    this.parts.distanceLegRight?.SetLength(0.55);
    // @ts-ignore
    this.parts.weldCenter.m_referenceAngle = 0;
  }

  private leanUp() {
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

      bindingLeft: this.b2Physics.rubeLoader.getJointsByCustomProperty('string', 'phaserPlayerCharacterSpring', 'bindingLeft')[0] as Pl.b2RevoluteJoint,
      bindingRight: this.b2Physics.rubeLoader.getJointsByCustomProperty('string', 'phaserPlayerCharacterSpring', 'bindingRight')[0] as Pl.b2RevoluteJoint,
      distanceLegLeft: this.b2Physics.rubeLoader.getJointsByCustomProperty('string', 'phaserPlayerCharacterSpring', 'distanceLegLeft')[0] as Pl.b2DistanceJoint,
      distanceLegRight: this.b2Physics.rubeLoader.getJointsByCustomProperty('string', 'phaserPlayerCharacterSpring', 'distanceLegRight')[0] as Pl.b2DistanceJoint,
      weldCenter: this.b2Physics.rubeLoader.getJointsByCustomProperty('string', 'phaserPlayerCharacterSpring', 'weldCenter')[0] as Pl.b2WeldJoint,
      prismatic: this.b2Physics.rubeLoader.getJointsByCustomProperty('string', 'phaserPlayerCharacterSpring', 'prismatic')[0] as Pl.b2PrismaticJoint,
    };
  }
}


export interface IBodyParts {
  head: Pl.b2Body & RubeEntity;
  body: Pl.b2Body & RubeEntity;
  boardSegments: (Pl.b2Body & RubeEntity)[];

  bindingLeft: Pl.b2RevoluteJoint & RubeEntity | null;
  bindingRight: Pl.b2RevoluteJoint & RubeEntity | null;
  distanceLegLeft: Pl.b2DistanceJoint & RubeEntity | null;
  distanceLegRight: Pl.b2DistanceJoint & RubeEntity | null;
  weldCenter: Pl.b2WeldJoint & RubeEntity | null;
  prismatic: Pl.b2PrismaticJoint & RubeEntity | null;
}

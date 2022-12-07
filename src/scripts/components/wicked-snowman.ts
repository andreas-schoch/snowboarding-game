import * as Ph from 'phaser';
import * as Pl from '@box2d/core';
import {Physics} from './physics';
import {stats} from '../index';
import GameScene from '../scenes/game.scene';
import {b2BodyType} from '@box2d/core';
import {WickedSnowboard} from './snowboard';
import {State} from './state';
import {RubeEntity} from '../util/RUBE/RubeLoaderInterfaces';
import {DebugMouseJoint} from '../util/DebugMouseJoint';


export class PlayerController {
  readonly scene: GameScene;
  readonly b2Physics: Physics;
  private readonly cursors: Ph.Types.Input.Keyboard.CursorKeys;
  private readonly debugCursors: Ph.Types.Input.Keyboard.CursorKeys;

  parts: IBodyParts;
  board: WickedSnowboard;
  state: State;

  private readonly jumpForce: number = 650 * 60;
  private leanForce: number = 2.5 * 60;
  private readonly jumpVector: Pl.b2Vec2 = new Pl.b2Vec2(0, 0);
  debug = false;

  constructor(scene: GameScene, b2Physics: Physics) {
    this.scene = scene;
    this.b2Physics = b2Physics;
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    // this.cursorsWASD = this.scene.input.keyboard.addKeys({
    //   'up': Phaser.Input.Keyboard.KeyCodes.W,
    //   'left': Phaser.Input.Keyboard.KeyCodes.A,
    //   'down': Phaser.Input.Keyboard.KeyCodes.S,
    //   'right': Phaser.Input.Keyboard.KeyCodes.D,
    //   // 'shift': Phaser.Input.Keyboard.KeyCodes.SHIFT,
    //   // 'space': Phaser.Input.Keyboard.KeyCodes.SPACE,
    // });

    this.cursors.up.on('down', () => {
      console.log('up down');
      this.state.getState() === 'grounded' && this.scene.game.getTime() - this.cursors.up.timeDown <= 250 && this.scene.observer.emit('jump_start');
    });

    this.initBodyParts();
    this.board = new WickedSnowboard(this);
    this.state = new State(this);
    this.debug && new DebugMouseJoint(scene, b2Physics);
  }

  update(delta: number) {
    stats.begin('snowman');

    this.state.update(delta);
    this.state.isCrashed && this.detachBoard(); // joints cannot be destroyed within post-solve callback
        this.board.getTimeInAir() > 100 && this.resetLegs();


    // Debug input
    // this.cursors.up.isDown && (this.scene.cameras.main.scrollY -= 15);
    // this.cursors.left.isDown && (this.scene.cameras.main.scrollX -= 15);
    // this.cursors.right.isDown && (this.scene.cameras.main.scrollX += 15);
    // this.cursors.down.isDown && (this.scene.cameras.main.scrollY += 15);

    if (!this.state.isCrashed) {
      this.board.update(delta);
      // Touch/Mouse input
      // if (this.scene.input.activePointer?.isDown) {
      //   const pointer = this.scene.input.activePointer; // activePointer undefined until after first touch input
      //   pointer.motionFactor = 0.2;
      //   this.scene.input.activePointer.x < this.scene.cameras.main.width / 2 ? this.leanBackward(delta) : this.leanForward(delta);
      //   pointer.velocity.y < -30 && this.scene.game.getTime() - pointer.moveTime <= 300 && this.jump(delta);
      // } else {
      //   this.scene.input.activePointer.motionFactor = 0.8;
      // }

      // Keyboard input
      this.cursors.up.isDown && this.scene.game.getTime() - this.cursors.up.timeDown <= 250 && this.jump(delta);
      this.cursors.left.isDown && this.leanBackward(delta);
      this.cursors.right.isDown && this.leanForward(delta);
      this.cursors.down.isDown && this.leanCenter(delta);
    }
    stats.end('snowman');
  }

  private detachBoard() {
    this.parts.bindingLeft && this.b2Physics.world.DestroyJoint(this.parts.bindingLeft);
    this.parts.bindingRight && this.b2Physics.world.DestroyJoint(this.parts.bindingRight);
    this.parts.distanceLegLeft && this.b2Physics.world.DestroyJoint(this.parts.distanceLegLeft);
    this.parts.distanceLegRight && this.b2Physics.world.DestroyJoint(this.parts.distanceLegRight);
    this.parts.weldCenter && this.b2Physics.world.DestroyJoint(this.parts.weldCenter);
  }

  private jump(delta: number) {
    // prevents player from jumping too quickly after a landing
    if (this.scene.game.getTime() - this.state.timeGrounded < 100) return; // TODO change to numStepsGrounded

    this.parts.distanceLegLeft?.SetLength(0.8);
    this.parts.distanceLegRight?.SetLength(0.8);

    const {isTailGrounded, isCenterGrounded, isNoseGrounded} = this.board;
    if (isCenterGrounded || isTailGrounded || isNoseGrounded) {
      const force = this.jumpForce * delta;
      const jumpVector = this.jumpVector.Set(0, 0);
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

  private leanBackward(delta: number) {
    this.parts.distanceLegLeft?.SetLength(0.55);
    this.parts.distanceLegRight?.SetLength(0.8);
    // @ts-ignore
    this.parts.weldCenter.m_referenceAngle = Math.PI / 180 * -10;
    this.parts.body.ApplyAngularImpulse(this.leanForce * delta);
  }

  private leanForward(delta: number) {
    this.parts.distanceLegLeft?.SetLength(0.8);
    this.parts.distanceLegRight?.SetLength(0.55);
    // @ts-ignore
    this.parts.weldCenter.m_referenceAngle = Math.PI / 180 * 10;
    this.parts.body.ApplyAngularImpulse(-this.leanForce * delta);
  }

  private leanCenter(delta: number) {
    this.parts.distanceLegLeft?.SetLength(0.55);
    this.parts.distanceLegRight?.SetLength(0.55);
    // @ts-ignore
    this.parts.weldCenter.m_referenceAngle = 0;
  }

  private initBodyParts() {
    this.parts = {
      head: this.b2Physics.rubeLoader.getBodiesByCustomProperty('string', 'phaserPlayerCharacterPart', 'head')[0],
      body: this.b2Physics.rubeLoader.getBodiesByCustomProperty('string', 'phaserPlayerCharacterPart', 'body')[0],
      boardSegments: this.b2Physics.rubeLoader.getBodiesByCustomProperty('string', 'phaserPlayerCharacterPart', 'boardSegment'),

      boardEdges: this.b2Physics.rubeLoader.getFixturesByCustomProperty('bool', 'phaserBoardEdge', true),

      bindingLeft: this.b2Physics.rubeLoader.getJointsByCustomProperty('string', 'phaserPlayerCharacterSpring', 'bindingLeft')[0] as Pl.b2RevoluteJoint,
      bindingRight: this.b2Physics.rubeLoader.getJointsByCustomProperty('string', 'phaserPlayerCharacterSpring', 'bindingRight')[0] as Pl.b2RevoluteJoint,
      distanceLegLeft: this.b2Physics.rubeLoader.getJointsByCustomProperty('string', 'phaserPlayerCharacterSpring', 'distanceLegLeft')[0] as Pl.b2DistanceJoint,
      distanceLegRight: this.b2Physics.rubeLoader.getJointsByCustomProperty('string', 'phaserPlayerCharacterSpring', 'distanceLegRight')[0] as Pl.b2DistanceJoint,
      weldCenter: this.b2Physics.rubeLoader.getJointsByCustomProperty('string', 'phaserPlayerCharacterSpring', 'weldCenter')[0] as Pl.b2WeldJoint,
    };

    console.log('initBodyParts', this.parts);
  }

}


export interface IBodyParts {
  head: Pl.b2Body & RubeEntity;
  body: Pl.b2Body & RubeEntity;
  boardSegments: (Pl.b2Body & RubeEntity)[];
  boardEdges: (Pl.b2Fixture & RubeEntity)[]; // tail and nose edges when hit trigger crash;

  bindingLeft: Pl.b2RevoluteJoint & RubeEntity | null;
  bindingRight: Pl.b2RevoluteJoint & RubeEntity | null;
  distanceLegLeft: Pl.b2DistanceJoint & RubeEntity | null;
  distanceLegRight: Pl.b2DistanceJoint & RubeEntity | null;
  weldCenter: Pl.b2WeldJoint & RubeEntity | null;

}
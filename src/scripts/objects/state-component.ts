import * as Ph from 'phaser';
import * as Pl from '@box2d/core';
import {IBodyParts, WickedSnowman} from './wicked-snowman';


export class StateComponent extends Phaser.Events.EventEmitter {
  comboBoost: number = 0;
  maxComboBoost: number = 20;
  lostHead: Boolean;
  isCrashed: boolean;
  landedFrontFlips = 0;
  landedBackFlips = 0;

  private snowman: WickedSnowman;
  private state: 'in-air' | 'grounded' | 'crashed';

  private totalTrickScore: number = 0;
  private protoTrickScore: number = 0;
  private comboAccumulatedScore: number = 0;
  private anglePreviousUpdate: number = 0;

  private totalRotation: number = 0; // total rotation while in air without touching the ground
  private currentFlipRotation: number = 0; // set to 0 after each flip

  private pendingFrontFlips: number = 0;
  private pendingBackFlips: number = 0;
  private readonly parts: IBodyParts;
  private readonly crashIgnoredParts: Pl.b2Body[];
  private comboMultiplier: number = 0;
  private comboLeewayTween: Phaser.Tweens.Tween;

  constructor(snowman: WickedSnowman) {
    super();
    this.snowman = snowman;
    this.parts = snowman.parts;
    this.crashIgnoredParts = [this.parts.armLowerLeft, this.parts.armLowerRight, this.parts.body];
    this.state = snowman.isInAir() ? 'in-air' : 'grounded';
    this.registerCollisionListener();

    this.on('enter-in-air', () => this.state = 'in-air');

    this.on('enter-grounded', () => {
        this.state = 'grounded';
        this.landedFrontFlips += this.pendingFrontFlips;
        this.landedBackFlips += this.pendingBackFlips;

        const numFlips = this.pendingBackFlips + this.pendingFrontFlips;
        if (numFlips >= 1) {
          const trickScore = numFlips * numFlips * 100;
          this.totalTrickScore += trickScore;

          this.comboAccumulatedScore += trickScore / 10;
          this.comboMultiplier++;
          this.emit('combo-change', this.comboAccumulatedScore, this.comboMultiplier);
          this.emit('score-change', this.totalTrickScore);

          this.comboLeewayTween.resetTweenData(true);
          this.comboLeewayTween.play();
        }

        this.totalRotation = 0;
        this.currentFlipRotation = 0;
        this.pendingBackFlips = 0;
        this.pendingFrontFlips = 0;
      },
    );

    this.on('enter-crashed', () => {
      this.state = 'crashed';
      if (this.comboLeewayTween.isPlaying() || this.comboLeewayTween.isPaused()) {
        this.comboLeewayTween.stop();
      }
    });

    this.comboLeewayTween = this.snowman.scene.tweens.addCounter({
      paused: true,
      from: Math.PI * -0.5,
      to: Math.PI * 1.5,
      duration: 1000,
      onUpdate: (tween) => this.emit('combo-leeway-update', tween.getValue()),
      onComplete: tween => {
        this.totalTrickScore += this.comboAccumulatedScore * this.comboMultiplier;
        this.emit('score-change', this.totalTrickScore);
        this.emit('combo-change', 0, 0);
        this.protoTrickScore = 0;
        this.comboAccumulatedScore = 0;
        this.comboMultiplier = 0;
      },
    });
  }

  getTravelDistanceMeters(): number {
    return Math.floor(this.parts.body.GetPosition().Length() / 2);
  }

  private registerCollisionListener() {
    this.snowman.b2Physics.on('post-solve', (contact: Pl.b2Contact, impulse: Pl.b2ContactImpulse) => {
      if (this.isCrashed && this.lostHead) return;
      const bodyA = contact.GetFixtureA().GetBody();
      const bodyB = contact.GetFixtureB().GetBody();
      if (this.crashIgnoredParts.includes(bodyA) || this.crashIgnoredParts.includes(bodyB)) return;

      const boardNose = this.snowman.board.nose;
      if (bodyA === this.parts.head || bodyB === this.parts.head) {
        const maxImpulse = Math.max(...impulse.normalImpulses);
        if (maxImpulse > 8) {
          this.lostHead = true;
          this.isCrashed = true;
        }
      } else if (boardNose && (bodyA === boardNose.body || bodyB === boardNose.body)) {
        const maxImpulse = Math.max(...impulse.normalImpulses);
        if (maxImpulse > 10 && boardNose.crashRayResult?.hit) this.isCrashed = true;
      }
    });
  }

  update(): void {
    const isInAir = this.snowman.isInAir();
    if (this.state !== 'crashed' && this.isCrashed) this.emit('enter-crashed');
    if (this.state === 'grounded' && isInAir && !this.isCrashed) this.emit('enter-in-air');
    else if (this.state === 'in-air' && !isInAir && !this.isCrashed) this.emit('enter-grounded');
    this.updateTrickCounter();
    this.updateComboLeeway();
  }

  private updateTrickCounter() {
    if (this.state === 'in-air') {
      const currentAngle = Ph.Math.Angle.Normalize(this.parts.body.GetAngle());

      const diff = this.calculateDifferenceBetweenAngles(this.anglePreviousUpdate, currentAngle);
      this.totalRotation += diff;
      this.currentFlipRotation += diff;
      this.anglePreviousUpdate = currentAngle;

      if (this.currentFlipRotation >= Math.PI * (this.pendingFrontFlips === 0 ? 1.25 : 2)) {
        this.pendingFrontFlips++;
        this.currentFlipRotation = 0;
      } else if (this.currentFlipRotation <= Math.PI * -(this.pendingBackFlips === 0 ? 1.25 : 2)) {
        this.pendingBackFlips++;
        this.currentFlipRotation = 0;
      }
    }
  }

  private updateComboLeeway() {
    if (this.comboLeewayTween.isPlaying() || this.comboLeewayTween.isPaused()) {
      if (this.state === 'in-air' || !this.snowman.board.isCenterGrounded) {
        this.comboLeewayTween.pause();
      } else {
        this.comboLeewayTween.resume();
      }
    }
  }

// based on: https://www.construct.net/en/forum/construct-2/how-do-i-18/count-rotations-46674
  // http://blog.lexique-du-net.com/index.php?post/Calculate-the-real-difference-between-two-angles-keeping-the-sign
  private calculateDifferenceBetweenAngles(firstAngle: number, secondAngle: number): number {
    let difference = secondAngle - firstAngle;
    if (difference < -Math.PI) difference += Math.PI * 2;
    else if (difference > Math.PI) difference -= Math.PI * 2;
    return difference;
  }
}

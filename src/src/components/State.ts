import * as Ph from 'phaser';
import * as Pl from '@box2d/core';
import {Physics} from './Physics';
import {RubeEntity} from '../util/RUBE/RubeLoaderInterfaces';
import {IBodyParts, PlayerController} from './PlayerController';


export class State {
  private readonly TRICK_POINTS: number = 200;
  private readonly TRICK_POINTS_COMBO_FRACTION: number = 0.2;
  private readonly BASE_COIN_POINTS: number = 100;

  isCrashed: boolean;
  landedFrontFlips = 0;
  landedBackFlips = 0;
  timeGrounded: number = 0;

  private readonly b2Physics: Physics;
  private playerController: PlayerController;
  private readonly parts: IBodyParts;
  private state: 'in-air' | 'grounded' | 'crashed';

  private totalTrickScore: number = 0;
  private comboAccumulatedScore: number = 0;
  private comboMultiplier: number = 0;
  private comboLeewayTween: Phaser.Tweens.Tween;

  private anglePreviousUpdate: number = 0;
  private totalRotation: number = 0; // total rotation while in air without touching the ground
  private currentFlipRotation: number = 0; // set to 0 after each flip
  private pendingFrontFlips: number = 0;
  private pendingBackFlips: number = 0;

  private totalCollectedPresents = 0;
  private readonly pickupsToProcess: Set<Pl.b2Body & RubeEntity> = new Set();

  private readonly alreadyCollectedCoins: Set<Pl.b2Fixture> = new Set();
  private lastDistance: number;

  constructor(playerController: PlayerController) {
    this.playerController = playerController;
    this.parts = playerController.parts;

    this.b2Physics = playerController.b2Physics;
    // this.crashIgnoredParts = [this.parts.armLowerLeft, this.parts.armLowerRight, this.parts.body];
    this.state = playerController.board.isInAir() ? 'in-air' : 'grounded';
    this.registerCollisionListeners();

    this.playerController.scene.observer.on('enter-in-air', () => this.state = 'in-air');

    this.playerController.scene.observer.on('enter-grounded', () => {
        this.state = 'grounded';
        this.timeGrounded = this.playerController.scene.game.getTime();
        this.landedFrontFlips += this.pendingFrontFlips;
        this.landedBackFlips += this.pendingBackFlips;

        const numFlips = this.pendingBackFlips + this.pendingFrontFlips;
        if (numFlips >= 1) {
          const trickScore = numFlips * numFlips * this.TRICK_POINTS;
          this.totalTrickScore += trickScore;
          this.comboAccumulatedScore += trickScore * this.TRICK_POINTS_COMBO_FRACTION;
          this.comboMultiplier++;
          this.playerController.scene.observer.emit('combo-change', this.comboAccumulatedScore, this.comboMultiplier);
          this.playerController.scene.observer.emit('score-change', this.getCurrentScore());
          this.comboLeewayTween.resetTweenData(true);
          this.comboLeewayTween.play();
        }

        this.totalRotation = 0;
        this.currentFlipRotation = 0;
        this.pendingBackFlips = 0;
        this.pendingFrontFlips = 0;
      },
    );

    this.playerController.scene.observer.on('enter-crashed', () => {
      this.state = 'crashed';
      if (this.comboLeewayTween.isPlaying() || this.comboLeewayTween.isPaused()) {
        this.comboLeewayTween.stop();
      }
    });

    this.comboLeewayTween = this.playerController.scene.tweens.addCounter({
      paused: true,
      from: Math.PI * -0.5,
      to: Math.PI * 1.5,
      duration: 4000,
      onUpdate: (tween) => this.playerController.scene.observer.emit('combo-leeway-update', tween.getValue()),
      onComplete: tween => {
        this.totalTrickScore += this.comboAccumulatedScore * this.comboMultiplier;
        this.playerController.scene.observer.emit('score-change', this.getCurrentScore());
        this.playerController.scene.observer.emit('combo-change', 0, 0);
        this.comboAccumulatedScore = 0;
        this.comboMultiplier = 0;
      },
    });
  }

  getCurrentScore(): number {
    return this.totalTrickScore + (this.totalCollectedPresents * this.BASE_COIN_POINTS) + this.getTravelDistanceMeters();
  }

  getState(): 'grounded' | 'in-air' | 'crashed' {
    return this.state;
  }

  getTravelDistanceMeters(): number {
    const distance = this.parts.body.GetPosition().Length();
    return Math.floor(distance / 50) * 50;
  }

  private registerCollisionListeners() {
    this.playerController.b2Physics.on('post-solve', (contact: Pl.b2Contact, impulse: Pl.b2ContactImpulse) => {
      if (this.isCrashed) return;
      const bodyA = contact.GetFixtureA().GetBody();
      const bodyB = contact.GetFixtureB().GetBody();
      if (bodyA === bodyB) return;
      this.isCrashed = (bodyA === this.parts.head || bodyB === this.parts.head) && Math.max(...impulse.normalImpulses) > 8;
    });

    this.playerController.b2Physics.on('begin-contact', (contact: Pl.b2Contact) => {
      const fixtureA: Pl.b2Fixture & RubeEntity = contact.GetFixtureA();
      const fixtureB: Pl.b2Fixture & RubeEntity = contact.GetFixtureB();
      const bodyA = fixtureA.GetBody();
      const bodyB = fixtureB.GetBody();
      if (fixtureA.IsSensor() && !this.pickupsToProcess.has(bodyA) && fixtureA.customPropertiesMap?.phaserSensorType === 'pickup_present') {
        this.pickupsToProcess.add(bodyA);
      } else if (fixtureB.IsSensor() && !this.pickupsToProcess.has(bodyB) && fixtureB.customPropertiesMap?.phaserSensorType === 'pickup_present') {
        this.pickupsToProcess.add(bodyB);
      }
    });
  }

  update(delta: number): void {
    this.processPickups();

    const isInAir = this.playerController.board.isInAir();
    if (this.state !== 'crashed' && this.isCrashed) this.playerController.scene.observer
    .emit('enter-crashed', this.getTravelDistanceMeters(), this.totalCollectedPresents, this.totalTrickScore, '12x240', this.getCurrentScore());
    if (this.state === 'grounded' && isInAir && !this.isCrashed) this.playerController.scene.observer.emit('enter-in-air');
    else if (this.state === 'in-air' && !isInAir && !this.isCrashed) this.playerController.scene.observer.emit('enter-grounded');
    this.updateTrickCounter();
    this.updateComboLeeway();
    this.updateDistance();
  }

  private processPickups() {
    for (const body of this.pickupsToProcess) {
      const img: Ph.GameObjects.Image = body.GetUserData();
      this.b2Physics.world.DestroyBody(body);
      img.destroy();
      this.totalCollectedPresents++;
      this.playerController.scene.observer.emit('pickup_present', this.totalCollectedPresents);
      this.playerController.scene.observer.emit('score-change', this.getCurrentScore());

    }
    this.pickupsToProcess.clear();
  }

  private updateTrickCounter() {
    if (this.state === 'in-air') {
      const currentAngle = Ph.Math.Angle.Normalize(this.parts.body.GetAngle());

      const diff = this.calculateDifferenceBetweenAngles(this.anglePreviousUpdate, currentAngle);
      this.totalRotation += diff;
      this.currentFlipRotation += diff;
      this.anglePreviousUpdate = currentAngle;

      if (this.currentFlipRotation >= Math.PI * (this.pendingBackFlips === 0 ? 1.25 : 2)) {
        this.pendingBackFlips++;
        this.currentFlipRotation = 0;
      } else if (this.currentFlipRotation <= Math.PI * -(this.pendingFrontFlips === 0 ? 1.25 : 2)) {
        this.pendingFrontFlips++;
        this.currentFlipRotation = 0;
      }
    }
  }

  private updateComboLeeway() {
    if (this.comboLeewayTween.isPlaying() || this.comboLeewayTween.isPaused()) {
      if (this.state === 'in-air' || !this.playerController.board.isCenterGrounded) {
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

  private updateDistance() {
    const distance = this.getTravelDistanceMeters();
    if (distance !== this.lastDistance) {
      this.playerController.scene.observer.emit('distance-change', distance);
      this.lastDistance = distance;
    }
  }
}

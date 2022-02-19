import * as Ph from 'phaser';
import * as Pl from '@box2d/core';
import {IBodyParts, WickedSnowman} from './wicked-snowman';
import {Physics} from './physics';


export class State {
  // TODO add particle effect when boost enabled
  private readonly BASE_BOOST_FLOW: number = 22.5 * 60;
  private readonly BASE_TRICK_POINTS: number = 200;
  maxBoost: number = this.BASE_BOOST_FLOW * 25; // 25 seconds worth of boost
  availableBoost: number = this.maxBoost;

  lostHead: Boolean;
  isCrashed: boolean;
  landedFrontFlips = 0;
  landedBackFlips = 0;
  timeGrounded: number = 0;

  private readonly b2Physics: Physics;
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
  private readonly ignoredSensorBodies: Set<Pl.b2Body> = new Set();
  private comboMultiplier: number = 0;
  private comboLeewayTween: Phaser.Tweens.Tween;

  private readonly alreadyCollectedCoins: Set<Pl.b2Fixture> = new Set();
  private lastDistance: number;

  constructor(snowman: WickedSnowman) {
    this.snowman = snowman;
    this.parts = snowman.parts;
    this.b2Physics = snowman.b2Physics;
    this.crashIgnoredParts = [this.parts.armLowerLeft, this.parts.armLowerRight, this.parts.body];
    this.state = snowman.isInAir() ? 'in-air' : 'grounded';
    this.registerCollisionListeners();

    this.snowman.scene.observer.on('enter-in-air', () => this.state = 'in-air');

    this.snowman.scene.observer.on('enter-grounded', () => {
        this.state = 'grounded';
        this.timeGrounded = this.snowman.scene.game.getTime();
        this.landedFrontFlips += this.pendingFrontFlips;
        this.landedBackFlips += this.pendingBackFlips;

        const numFlips = this.pendingBackFlips + this.pendingFrontFlips;
        if (numFlips >= 1) {
          const trickScore = numFlips * numFlips * this.BASE_TRICK_POINTS;
          this.totalTrickScore += trickScore;

          this.comboAccumulatedScore += trickScore * 0.1;
          this.comboMultiplier++;
          this.gainBoost(1, numFlips * 5);
          this.snowman.scene.observer.emit('combo-change', this.comboAccumulatedScore, this.comboMultiplier);
          this.snowman.scene.observer.emit('score-change', this.totalTrickScore);
          this.snowman.scene.observer.emit('boost-change', this.availableBoost, this.maxBoost);

          this.comboLeewayTween.resetTweenData(true);
          this.comboLeewayTween.play();
        }

        this.totalRotation = 0;
        this.currentFlipRotation = 0;
        this.pendingBackFlips = 0;
        this.pendingFrontFlips = 0;
      },
    );

    this.snowman.scene.observer.on('enter-crashed', () => {
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
      onUpdate: (tween) => this.snowman.scene.observer.emit('combo-leeway-update', tween.getValue()),
      onComplete: tween => {
        this.totalTrickScore += this.comboAccumulatedScore * this.comboMultiplier;
        this.snowman.scene.observer.emit('score-change', this.totalTrickScore);
        this.snowman.scene.observer.emit('combo-change', 0, 0);
        this.protoTrickScore = 0;
        this.comboAccumulatedScore = 0;
        this.comboMultiplier = 0;
      },
    });
  }

  getState(): 'grounded' | 'in-air' | 'crashed' {
    return this.state;
  }

  getTravelDistanceMeters(): number {
    const distance = this.parts.body.GetPosition().Length() / 2;
    return Math.floor(distance / 50) * 50;
  }

  gainBoost(delta: number, boostUnits: number): number {
    const boost = Math.min(this.maxBoost, (this.BASE_BOOST_FLOW * boostUnits * delta) + this.availableBoost);
    this.availableBoost = boost;
    this.snowman.scene.observer.emit('boost-change', this.availableBoost, this.maxBoost);
    return boost;
  }

  consumeBoost(delta: number, boostUnits: number): number {
    if (this.availableBoost <= 0) return 0;
    const boost = Math.min(this.availableBoost, this.BASE_BOOST_FLOW * boostUnits * delta);
    this.availableBoost -= boost * (boostUnits > 1 ? 1.5 : 1);
    this.snowman.scene.observer.emit('boost-change', this.availableBoost, this.maxBoost);
    return boost;
  }

  private registerCollisionListeners() {
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

    this.snowman.b2Physics.on('begin-contact', (contact: Pl.b2Contact) => {
      const fixtureA = contact.GetFixtureA();
      const fixtureB = contact.GetFixtureB();
      const bodyA = fixtureA.GetBody();
      const bodyB = fixtureB.GetBody();

      if (fixtureA.IsSensor() && bodyA.IsEnabled() && !this.ignoredSensorBodies.has(bodyA)) {
        this.ignoredSensorBodies.add(bodyA);
        this.gainBoost(1, 0.25);
        this.totalTrickScore += 25;
        this.snowman.scene.observer.emit('collected-coin', bodyA);
        this.snowman.scene.observer.emit('score-change', this.totalTrickScore);
        setTimeout(() => bodyA.SetEnabled(false)); // cannot change bodies within contact listeners

      } else if (fixtureB.IsSensor() && bodyB.IsEnabled() && !this.ignoredSensorBodies.has(bodyB)) {
        this.ignoredSensorBodies.add(bodyB);
        this.gainBoost(1, 0.25);
        this.totalTrickScore += 25;
        this.snowman.scene.observer.emit('collected-coin', bodyB);
        this.snowman.scene.observer.emit('score-change', this.totalTrickScore);
        setTimeout(() => bodyB.SetEnabled(false)); // cannot change bodies within contact listeners
      }
    });
  }

  update(delta: number): void {
    this.ignoredSensorBodies.clear();
    const isInAir = this.snowman.isInAir();
    if (this.state !== 'crashed' && this.isCrashed) this.snowman.scene.observer.emit('enter-crashed');
    if (this.state === 'grounded' && isInAir && !this.isCrashed) this.snowman.scene.observer.emit('enter-in-air');
    else if (this.state === 'in-air' && !isInAir && !this.isCrashed) this.snowman.scene.observer.emit('enter-grounded');
    this.updateTrickCounter();
    this.updateComboLeeway();
    this.updateDistance();
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

  private updateDistance() {
    const distance = this.getTravelDistanceMeters();
    if (distance !== this.lastDistance) {
      this.snowman.scene.observer.emit('distance-change', distance);
      this.lastDistance = distance;
    }
  }
}

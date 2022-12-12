import * as Ph from 'phaser';
import * as Pl from '@box2d/core';
import {Physics} from './Physics';
import {RubeEntity} from '../util/RUBE/RubeLoaderInterfaces';
import {IBodyParts, PlayerController} from './PlayerController';
import {BASE_FLIP_POINTS, HEAD_MAX_IMPULSE, LEVEL_SUCCESS_BONUS_POINTS, TRICK_POINTS_COMBO_FRACTION} from '../index';


export interface IScore {
  id?: string;
  timestamp?: number;
  username?: string;
  userId?: string;
  total?: number; // derived from others
  distance: number;
  coins: number;
  trickScore: number;
  bestCombo: { multiplier: number, accumulator: number };
  finishedLevel: boolean;
  crashed: boolean;
}


export class State {
  levelFinished = false;
  isCrashed = false;
  timeGrounded = 0;

  private readonly b2Physics: Physics;
  private readonly parts: IBodyParts;
  private readonly playerController: PlayerController;
  private state: 'in_air' | 'grounded'; // handle this more consistent

  private readonly pickupsToProcess: Set<Pl.b2Body & RubeEntity> = new Set();
  private readonly seenSensors: Set<Pl.b2Body & RubeEntity> = new Set();
  private comboLeewayTween: Phaser.Tweens.Tween;
  private comboAccumulatedScore = 0;
  private comboMultiplier = 0;
  private totalTrickScore = 0;
  private totalCollectedPresents = 0;

  private anglePreviousUpdate = 0;
  private totalRotation = 0; // total rotation while in air without touching the ground
  private currentFlipRotation = 0; // set to 0 after each flip
  private pendingFrontFlips = 0;
  private pendingBackFlips = 0;
  private landedFrontFlips = 0;
  private landedBackFlips = 0;
  private lastDistance = 0;
  private bestCombo: IScore['bestCombo'] = {accumulator: 0, multiplier: 0};

  constructor(playerController: PlayerController) {
    this.parts = playerController.parts;
    this.playerController = playerController;
    this.b2Physics = playerController.b2Physics;
    this.state = playerController.board.isInAir() ? 'in_air' : 'grounded';
    this.registerCollisionListeners();

    this.playerController.scene.observer.on('enter_in_air', () => this.state = 'in_air');

    this.playerController.scene.observer.on('enter_grounded', () => {
        this.state = 'grounded';
        this.timeGrounded = this.playerController.scene.game.getTime();
        this.landedFrontFlips += this.pendingFrontFlips;
        this.landedBackFlips += this.pendingBackFlips;

        const numFlips = this.pendingBackFlips + this.pendingFrontFlips;
        if (numFlips >= 1) {
          const trickScore = numFlips * numFlips * BASE_FLIP_POINTS;
          this.totalTrickScore += trickScore;
          this.comboAccumulatedScore += trickScore * TRICK_POINTS_COMBO_FRACTION;
          this.comboMultiplier++;
          this.playerController.scene.observer.emit('combo_change', this.comboAccumulatedScore, this.comboMultiplier);
          this.playerController.scene.observer.emit('score_change', this.getCurrentScore());
          this.comboLeewayTween.resetTweenData(true);
          this.comboLeewayTween.play();
        }

        this.totalRotation = 0;
        this.currentFlipRotation = 0;
        this.pendingBackFlips = 0;
        this.pendingFrontFlips = 0;
      },
    );

    this.comboLeewayTween = this.playerController.scene.tweens.addCounter({
      paused: true,
      from: Math.PI * -0.5,
      to: Math.PI * 1.5,
      duration: 4000,
      onUpdate: (tween) => this.playerController.scene.observer.emit('combo_leeway_update', tween.getValue()),
      onComplete: tween => this.handleComboComplete(),
    });
  }

  reset() {
    this.totalTrickScore = 0;
    this.comboLeewayTween.stop();
    // this.comboLeewayTween = undefined;
    this.totalCollectedPresents = 0;
    this.comboMultiplier = 0;
    this.comboAccumulatedScore = 0;
    this.levelFinished = false;
    this.isCrashed = false;
    this.bestCombo = {accumulator: 0, multiplier: 0};
    this.seenSensors.clear();
    this.pickupsToProcess.clear();
    this.pendingFrontFlips = 0;
    this.pendingBackFlips = 0;
    this.landedBackFlips = 0;
    this.landedFrontFlips = 0;
    this.currentFlipRotation = 0;
    this.anglePreviousUpdate = 0;
    this.lastDistance = 0;
    this.timeGrounded = 0;
    this.totalRotation = 0;
  }

  getCurrentScore(): IScore {
    return {
      distance: this.getTravelDistanceMeters(),
      coins: this.totalCollectedPresents,
      trickScore: this.totalTrickScore,
      bestCombo: this.bestCombo,
      finishedLevel: this.levelFinished,
      crashed: this.isCrashed,
    };
  }

  getState(): 'grounded' | 'in_air' | 'crashed' {
    return this.state;
  }

  getTravelDistanceMeters(): number {
    const distance = this.parts.body.GetPosition().Length();
    return Math.floor(distance / 5) * 5;
  }

  private registerCollisionListeners() {
    this.playerController.b2Physics.on('post_solve', (contact: Pl.b2Contact, impulse: Pl.b2ContactImpulse) => {
      if (this.isCrashed) return;
      const bodyA = contact.GetFixtureA().GetBody();
      const bodyB = contact.GetFixtureB().GetBody();
      if (bodyA === bodyB) return;
      if ((bodyA === this.parts.head || bodyB === this.parts.head) && Math.max(...impulse.normalImpulses) > HEAD_MAX_IMPULSE) {
        !this.isCrashed && this.playerController.scene.observer.emit('enter_crashed', this.getCurrentScore());
        this.isCrashed = true;
        if (this.comboLeewayTween.isPlaying() || this.comboLeewayTween.isPaused()) {
          this.comboLeewayTween.stop();
          this.comboLeewayTween.resetTweenData(true);
        }
      }
    });

    this.playerController.b2Physics.on('begin_contact', (contact: Pl.b2Contact) => {
      const fixtureA: Pl.b2Fixture & RubeEntity = contact.GetFixtureA();
      const fixtureB: Pl.b2Fixture & RubeEntity = contact.GetFixtureB();
      const bodyA = fixtureA.GetBody();
      const bodyB = fixtureB.GetBody();
      if (fixtureA.IsSensor() && !this.seenSensors.has(bodyA) && fixtureA.customPropertiesMap?.phaserSensorType) this.handleSensor(bodyA, fixtureA);
      else if (fixtureB.IsSensor() && !this.seenSensors.has(bodyB) && fixtureB.customPropertiesMap?.phaserSensorType) this.handleSensor(bodyB, fixtureB);
    });
  }

  private handleSensor(body: Pl.b2Body & RubeEntity, fixture: Pl.b2Fixture & RubeEntity) {
    this.seenSensors.add(body);
    switch (fixture.customPropertiesMap?.phaserSensorType) {
      case 'pickup_present': {
        this.pickupsToProcess.add(body);
        break;
      }
      case 'level_finish': {
        this.playerController.scene.cameras.main.stopFollow();
        console.log('congratulations you reached the end of the level');
        this.handleComboComplete();
        this.levelFinished = true;
        this.comboLeewayTween.stop();
        this.comboLeewayTween.resetTweenData(true);
        const currentScore = this.getCurrentScore();
        this.playerController.scene.observer.emit('score_change', currentScore);
        this.playerController.scene.observer.emit('level_finish', currentScore);
        break;
      }
      case 'level_deathzone': {
        break;
      }
    }
  }

  update(delta: number): void {
    this.processPickups();

    const isInAir = this.playerController.board.isInAir();
    if (this.state === 'grounded' && isInAir && !this.isCrashed) this.playerController.scene.observer.emit('enter_in_air');
    else if (this.state === 'in_air' && !isInAir && !this.isCrashed) this.playerController.scene.observer.emit('enter_grounded');
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
      this.playerController.scene.observer.emit('score_change', this.getCurrentScore());

    }
    this.pickupsToProcess.clear();
  }

  private updateTrickCounter() {
    if (this.state === 'in_air') {
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
      // checking for centerGrounded allows player to prolong leeway before combo completes while riding only on nose or tail
      if (this.state === 'in_air' || !this.playerController.board.isCenterGrounded) {
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
    if (distance !== this.lastDistance && !this.isCrashed && !this.levelFinished) {
      this.playerController.scene.observer.emit('distance_change', distance);
      this.playerController.scene.observer.emit('score_change', this.getCurrentScore());
      this.lastDistance = distance;
    }
  }

  private handleComboComplete() {
    if (this.levelFinished) return;
    const combo = this.comboAccumulatedScore * this.comboMultiplier;
    const prevBestCombo = this.bestCombo.accumulator * this.bestCombo.multiplier;
    if (combo > prevBestCombo) this.bestCombo = {accumulator: this.comboAccumulatedScore, multiplier: this.comboMultiplier};
    this.totalTrickScore += combo;
    this.playerController.scene.observer.emit('score_change', this.getCurrentScore());
    this.playerController.scene.observer.emit('combo_change', 0, 0);
    this.comboAccumulatedScore = 0;
    this.comboMultiplier = 0;
  }
}

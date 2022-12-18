import * as Ph from 'phaser';
import * as Pl from '@box2d/core';
import {Physics} from './Physics';
import {RubeEntity} from '../util/RUBE/RubeLoaderInterfaces';
import {IBodyParts, PlayerController} from './PlayerController';
import {BASE_FLIP_POINTS, DEBUG, HEAD_MAX_IMPULSE, LevelKeys, TRICK_POINTS_COMBO_FRACTION} from '../index';
import {getCurrentLevel} from '../util/getCurrentLevel';


export interface IBaseTrickScore {
  type: 'flip' | 'combo';
  timestamp: number;
}


export interface IComboTrickScore extends IBaseTrickScore {
  type: 'combo';
  accumulator: number;
  multiplier: number;
}


export interface IFlipTrickScore extends IBaseTrickScore {
  type: 'flip';
  flips: number;
}


export type TrickScore = IComboTrickScore | IFlipTrickScore;


export interface IScore {
  id?: string;
  timestamp?: number;
  userName?: string;
  userID?: string;
  total?: number; // derived from others
  distance: number;
  coins: number;
  trickScore: number;
  trickScoreLog: TrickScore[];
  finishedLevel: boolean;
  crashed: boolean;
  level: LevelKeys;
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
  private comboLeeway: Phaser.Tweens.Tween | null = null;
  private comboAccumulatedScore = 0;
  private comboMultiplier = 0;
  private totalTrickScore = 0;
  private totalCollectedPresents = 0;
  private trickScoreLog: TrickScore[] = [];

  private anglePreviousUpdate = 0;
  private totalRotation = 0; // total rotation while in air without touching the ground
  private currentFlipRotation = 0; // set to 0 after each flip
  private pendingFrontFlips = 0;
  private pendingBackFlips = 0;
  private landedFrontFlips = 0;
  private landedBackFlips = 0;
  private lastDistance = 0;

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
          this.trickScoreLog.push({type: 'flip', flips: numFlips, timestamp: Date.now()});
          const trickScore = numFlips * numFlips * BASE_FLIP_POINTS;
          this.totalTrickScore += trickScore;
          this.comboAccumulatedScore += trickScore * TRICK_POINTS_COMBO_FRACTION;
          this.comboMultiplier++;
          this.playerController.scene.observer.emit('combo_change', this.comboAccumulatedScore, this.comboMultiplier);
          this.playerController.scene.observer.emit('score_change', this.getCurrentScore());

          this.resetComboLeewayTween();
          this.comboLeeway = this.createComboLeewayTween(false);
        }

        this.totalRotation = 0;
        this.currentFlipRotation = 0;
        this.pendingBackFlips = 0;
        this.pendingFrontFlips = 0;
      },
    );
  }

  createComboLeewayTween(paused: boolean = true): Ph.Tweens.Tween {
    return this.playerController.scene.tweens.addCounter({
      paused,
      from: Math.PI * -0.5,
      to: Math.PI * 1.5,
      duration: 4000,
      onUpdate: (tween) => this.playerController.scene.observer.emit('combo_leeway_update', tween.getValue()),
      onComplete: tween => this.handleComboComplete(),
    });
  }

  reset() {
    this.totalTrickScore = 0;
    this.trickScoreLog = [];
    if (this.comboLeeway) {
      this.comboLeeway.stop();
      this.comboLeeway = null;
    }
    this.totalCollectedPresents = 0;
    this.comboMultiplier = 0;
    this.comboAccumulatedScore = 0;
    this.levelFinished = false;
    this.isCrashed = false;
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
      finishedLevel: this.levelFinished,
      crashed: this.isCrashed,
      trickScoreLog: this.trickScoreLog,
      level: getCurrentLevel()
    };
  }

  getState(): 'grounded' | 'in_air' | 'crashed' {
    return this.state;
  }

  getTravelDistanceMeters(): number {
    // Counting only horizontal distance for now.
    // Not sure if distance will continue to be part of the score.
    // It makes it harder for player to see what causes score changes when it
    // changes every 5m. Would like to add little "toastr" notifications when player
    // Lands tricks, combo gets applied and coins get collected at some point.
    const distance = this.parts.body.GetPosition().x;
    return Math.floor(distance / 5) * 5;
  }

  private registerCollisionListeners() {
    this.playerController.b2Physics.on('post_solve', (contact: Pl.b2Contact, impulse: Pl.b2ContactImpulse) => {
      if (this.isCrashed) return;
      const bodyA = contact.GetFixtureA().GetBody();
      const bodyB = contact.GetFixtureB().GetBody();
      if (bodyA === bodyB) return;
      if ((bodyA === this.parts.head || bodyB === this.parts.head) && Math.max(...impulse.normalImpulses) > HEAD_MAX_IMPULSE) {
        this.setCrashed();
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

  private setCrashed() {
    this.isCrashed = true;
    this.playerController.scene.observer.emit('enter_crashed', this.getCurrentScore());
    this.resetComboLeewayTween();
  }

  private handleSensor(body: Pl.b2Body & RubeEntity, fixture: Pl.b2Fixture & RubeEntity) {
    this.seenSensors.add(body);
    if (this.isCrashed || this.levelFinished) return;
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
        this.resetComboLeewayTween();
        const currentScore = this.getCurrentScore();
        this.playerController.scene.observer.emit('score_change', currentScore);
        this.playerController.scene.observer.emit('level_finish', currentScore);
        break;
      }
      case 'level_deathzone': {
        this.setCrashed();
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

  updateComboLeeway() {
    // checking for centerGrounded allows player to prolong leeway before combo completes while riding only on nose or tail
    // TODO In the future we may count the time on ground without center touching it and reward player points instead of just pausing the timer.
    //  It should continue to accumulate time even if in_air when player manages to land without touching center or doing other tricks.
    //  Also for this mechanic to not be abused, it should only allow only nose or tail press at the same time while switching is allowed.
    //  Once center touches ground, the accumulated time is evaluated and if long enough awarded and leeway reset.
    //  Minimum time should probably be around 2+ seconds ground time without center touching. Time is reset if player makes another trick.
    if (this.comboLeeway) {
      if (this.state === 'in_air' || !this.playerController.board.isCenterGrounded || this.b2Physics.isPaused) {
        this.comboLeeway.isPlaying() && this.comboLeeway.pause() && DEBUG && console.log('pause comboLeeway');
      } else {
        this.comboLeeway.isPaused() && this.comboLeeway.resume() && DEBUG && console.log('resume comboLeeway');
      }
    }
  }

  private resetComboLeewayTween() {
    if (this.comboLeeway) {
      this.comboLeeway.stop();
      this.comboLeeway = null;
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
    this.totalTrickScore += combo;
    this.trickScoreLog.push({type: 'combo', multiplier: this.comboMultiplier, accumulator: this.comboAccumulatedScore, timestamp: Date.now()});
    this.playerController.scene.observer.emit('score_change', this.getCurrentScore());
    this.playerController.scene.observer.emit('combo_change', 0, 0);
    this.comboAccumulatedScore = 0;
    this.comboMultiplier = 0;
  }
}

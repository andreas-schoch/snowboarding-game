import { IBeginContactEvent, IPostSolveEvent } from './Physics';
import { BASE_FLIP_POINTS, HEAD_MAX_IMPULSE, LevelKeys, TRICK_POINTS_COMBO_FRACTION, b2 } from "..";
import { getCurrentLevel } from '../util/getCurrentLevel';
import { Character } from './Character';
import GameScene from '../scenes/GameScene';
import { B2_BEGIN_CONTACT, B2_POST_SOLVE, COMBO_CHANGE, COMBO_LEEWAY_UPDATE, DISTANCE_CHANGE, ENTER_CRASHED, ENTER_GROUNDED, ENTER_IN_AIR, LEVEL_FINISH, PICKUP_PRESENT, SCORE_CHANGE } from '../eventTypes';

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
  isLevelFinished = false;
  isCrashed = false;
  timeGrounded = 0;

  private readonly pickupsToProcess: Set<Box2D.b2Body> = new Set();
  private readonly seenSensors: Set<Box2D.b2Body> = new Set();
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
  private lastIsInAir: boolean = false;
  private scene: GameScene;

  constructor(private character: Character) {
    this.scene = character.scene;
    this.registerListeners();
  }

  getCurrentScore(): IScore {
    return {
      distance: this.getTravelDistanceMeters(),
      coins: this.totalCollectedPresents,
      trickScore: this.totalTrickScore,
      finishedLevel: this.isLevelFinished,
      crashed: this.isCrashed,
      trickScoreLog: this.trickScoreLog,
      level: getCurrentLevel()
    };
  }

  getCurrentSpeed(): number {
    return this.character.body.GetLinearVelocity().Length();
  }

  createComboLeewayTween(paused: boolean = true): Phaser.Tweens.Tween {
    return this.scene.tweens.addCounter({
      paused,
      from: Math.PI * -0.5,
      to: Math.PI * 1.5,
      duration: 4000,
      onUpdate: (tween) => this.scene.observer.emit(COMBO_LEEWAY_UPDATE, tween.getValue()),
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
    this.isLevelFinished = false;
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

  getTravelDistanceMeters(): number {
    const distance = this.character.body.GetPosition().x;
    return Math.floor(distance / 5) * 5;
  }

  private registerListeners() {
    const customProps = this.scene.b2Physics.loader.customProps;
    this.scene.b2Physics.on(B2_BEGIN_CONTACT, ({ bodyA, bodyB, fixtureA, fixtureB }: IBeginContactEvent) => {
      if (!this.character.isPartOfMe(bodyA) && !this.character.isPartOfMe(bodyB)) return;
      if (fixtureA.IsSensor() && !this.seenSensors.has(bodyA) && customProps.get(fixtureA)?.phaserSensorType) this.handleSensor(bodyA, fixtureA);
      else if (fixtureB.IsSensor() && !this.seenSensors.has(bodyB) && customProps.get(fixtureB)?.phaserSensorType) this.handleSensor(bodyB, fixtureB);
    });

    this.scene.b2Physics.on(B2_POST_SOLVE, ({ fixtureA, fixtureB, impulse }: IPostSolveEvent) => {
      if (this.isCrashed) return;
      const bodyA = fixtureA.GetBody();
      const bodyB = fixtureB.GetBody();
      if (bodyA === bodyB) return;
      let largestImpulse: number = -1;
      for (let i = 0; i < impulse.count; i++) largestImpulse = Math.max(largestImpulse, impulse.get_normalImpulses(i));
      if ((bodyA === this.character.head || bodyB === this.character.head) && largestImpulse > HEAD_MAX_IMPULSE) this.setCrashed();
    });

    // this.scene.observer.on(ENTER_IN_AIR, () => this.isGrounded = false);
    this.scene.observer.on(ENTER_GROUNDED, () => {
      this.timeGrounded = this.scene.game.getFrame();
      this.landedFrontFlips += this.pendingFrontFlips;
      this.landedBackFlips += this.pendingBackFlips;

      const numFlips = this.pendingBackFlips + this.pendingFrontFlips;
      if (numFlips >= 1) {
        this.trickScoreLog.push({ type: 'flip', flips: numFlips, timestamp: Date.now() });
        const trickScore = numFlips * numFlips * BASE_FLIP_POINTS;
        this.totalTrickScore += trickScore;
        this.comboAccumulatedScore += trickScore * TRICK_POINTS_COMBO_FRACTION;
        this.comboMultiplier++;
        this.scene.observer.emit(COMBO_CHANGE, this.comboAccumulatedScore, this.comboMultiplier);
        this.scene.observer.emit(SCORE_CHANGE, this.getCurrentScore());

        this.resetComboLeewayTween();
        this.comboLeeway = this.createComboLeewayTween(false);
      }

      this.totalRotation = 0;
      this.currentFlipRotation = 0;
      this.pendingBackFlips = 0;
      this.pendingFrontFlips = 0;
    });
  }

  private setCrashed() {
    this.isCrashed = true;
    this.scene.observer.emit(ENTER_CRASHED, this.getCurrentScore(), this.character.id);
    this.resetComboLeewayTween();
  }

  // TODO only Physics class should use Pl or Box2D types directly to make rest of code box2d port agnostic
  private handleSensor(body: Box2D.b2Body, fixture: Box2D.b2Fixture) {
    this.seenSensors.add(body);
    if (this.isCrashed || this.isLevelFinished) return;
    const sensorType = this.scene.b2Physics.loader.customProps.get(fixture)?.phaserSensorType;
    switch (sensorType) {
      case 'pickup_present': {
        this.pickupsToProcess.add(body);
        break;
      }
      case 'level_finish': {
        this.scene.cameras.main.stopFollow();
        this.handleComboComplete();
        this.isLevelFinished = true;
        this.resetComboLeewayTween();
        const currentScore = this.getCurrentScore();
        this.scene.observer.emit(SCORE_CHANGE, currentScore);
        this.scene.observer.emit(LEVEL_FINISH, currentScore);
        break;
      }
      case 'level_deathzone': {
        this.setCrashed();
        break;
      }
    }
  }

  update(): void {
    this.processPickups();
    const isInAir = this.character.board.isInAir();
    // TODO check is chrashed only once
    if (isInAir && !this.lastIsInAir && !this.isCrashed) this.scene.observer.emit(ENTER_IN_AIR);
    else if (!isInAir && this.lastIsInAir && !this.isCrashed) this.scene.observer.emit(ENTER_GROUNDED);
    this.updateTrickCounter();
    this.updateComboLeeway();
    this.updateDistance();
    this.lastIsInAir = isInAir;
  }

  private processPickups() {
    for (const body of this.pickupsToProcess) {
      const userdata = this.scene.b2Physics.loader.userData.get(body);
      const image = userdata?.image;
      if (image) {
        userdata.image = null;
        image.destroy();
      }
      this.scene.b2Physics.loader.userData.delete(body);
      this.scene.b2Physics.world.DestroyBody(body as Box2D.b2Body);
      this.totalCollectedPresents++;
      this.scene.observer.emit(PICKUP_PRESENT, this.totalCollectedPresents);
      this.scene.observer.emit(SCORE_CHANGE, this.getCurrentScore());

    }
    this.pickupsToProcess.clear();
  }

  private updateTrickCounter() {
    if (this.character.board.isInAir()) {
      const currentAngle = Phaser.Math.Angle.Normalize(this.character.body.GetAngle());

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
      if (this.character.board.isInAir() || !this.character.board.isCenterGrounded || this.scene.b2Physics.isPaused) {
        this.comboLeeway.isPlaying() && this.comboLeeway.pause();
      } else {
        this.comboLeeway.isPaused() && this.comboLeeway.resume();
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
    if (distance !== this.lastDistance && !this.isCrashed && !this.isLevelFinished) {
      this.scene.observer.emit(DISTANCE_CHANGE, distance);
      this.scene.observer.emit(SCORE_CHANGE, this.getCurrentScore());
      this.lastDistance = distance;
    }
  }

  private handleComboComplete() {
    if (this.isLevelFinished) return;
    const combo = this.comboAccumulatedScore * this.comboMultiplier;
    this.totalTrickScore += combo;
    this.trickScoreLog.push({ type: 'combo', multiplier: this.comboMultiplier, accumulator: this.comboAccumulatedScore, timestamp: Date.now() });
    this.scene.observer.emit(SCORE_CHANGE, this.getCurrentScore());
    this.scene.observer.emit(COMBO_CHANGE, 0, 0);
    this.comboAccumulatedScore = 0;
    this.comboMultiplier = 0;
  }
}

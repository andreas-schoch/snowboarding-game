import {BASE_FLIP_POINTS, HEAD_MAX_IMPULSE, TRICK_POINTS_COMBO_FRACTION, pb} from '..';
import {GameInfo} from '../GameInfo';
import {Settings} from '../Settings';
import {ComboState} from '../UI/HUD';
import {B2_BEGIN_CONTACT, B2_POST_SOLVE, COMBO_CHANGE, COMBO_LEEWAY_UPDATE, ENTER_CRASHED, ENTER_GROUNDED, ENTER_IN_AIR, LEVEL_FINISH, COLLECT_COIN, SCORE_CHANGE, TIME_CHANGE} from '../eventTypes';
import {framesToTime} from '../helpers/framesToTime';
import {getPointScoreSummary} from '../helpers/getPointScoreSummary';
import {IBeginContactEvent, IPostSolveEvent} from '../physics/Physics';
import {IScore, TrickScoreType} from '../pocketbase/types';
import {GameScene} from '../scenes/GameScene';
import {Character} from './Character';

export class State {
  levelUnpausedFrames = 0;
  isLevelFinished = false;
  isCrashed = false;
  numFramesGrounded = 0;

  private readonly pickupsToProcess: Set<Box2D.b2Body> = new Set();
  private readonly seenSensors: Set<Box2D.b2Body> = new Set();
  private scene: GameScene;
  private comboLeeway: Phaser.Tweens.Tween | null = null;
  private comboAccumulator = 0;
  private comboMultiplier = 0;
  private totalCollectedCoins = 0;
  private lastAngleRad = 0;
  private currentFlipRotation = 0; // set to 0 after each flip
  private pendingFrontFlips = 0;
  private pendingBackFlips = 0;
  private distancePixels = 0;
  private lastIsInAir = false;
  private lastPosX = 0;
  private lastPosY = 0;

  constructor(private character: Character) {
    this.scene = character.scene;
    this.registerListeners();
  }

  update(): void {
    if (this.isCrashed || this.isLevelFinished || this.scene.b2Physics.isPaused) return;

    this.levelUnpausedFrames++; // TODO switch from leeway tween to a frame deterministic one based on levelUnpausedFrames
    GameInfo.observer.emit(TIME_CHANGE, framesToTime(this.levelUnpausedFrames));

    this.processPickups();
    const isBoardInAir = this.character.board.isInAir();
    if (isBoardInAir && !this.lastIsInAir) GameInfo.observer.emit(ENTER_IN_AIR);
    else if (!isBoardInAir && this.lastIsInAir) GameInfo.observer.emit(ENTER_GROUNDED);
    this.updateTrickCounter();
    this.updateComboLeeway();
    this.updateDistance();
    this.lastIsInAir = isBoardInAir;
  }

  getCurrentScore(): IScore {
    const {fromCoins, fromTricks, fromCombos, bestCombo, total} = getPointScoreSummary(GameInfo.tsl);
    const score: IScore = {
      user: pb.auth.loggedInUser()?.id,
      level: Settings.currentLevel(),
      crashed: this.isCrashed,
      finishedLevel: this.isLevelFinished,
      // tsl: encodedCustom,
      pointsCoin: fromCoins,
      pointsTrick: fromTricks,
      pointsCombo: fromCombos,
      pointsComboBest: bestCombo,
      pointsTotal: total,
      distance: Math.floor(this.distancePixels / this.scene.b2Physics.worldScale),
      time: Math.floor((this.levelUnpausedFrames / 60) * 1000), // in ms
    };

    GameInfo.score = score;
    return score;

  }

  getCurrentSpeed(): number {
    return this.character.body.GetLinearVelocity().Length();
  }

  createComboLeewayTween(paused: boolean = true): Phaser.Tweens.Tween {
    return this.scene.tweens.addCounter({
      paused,
      from: 0,
      to: 360,
      duration: 3000,
      onUpdate: tween => GameInfo.observer.emit(COMBO_LEEWAY_UPDATE, tween.getValue()),
      onComplete: () => this.handleComboComplete(),
      // onStop: () => this.handleComboComplete(),
    });
  }

  private registerListeners() {
    const customProps = this.scene.b2Physics.loader.customProps;
    this.scene.b2Physics.on(B2_BEGIN_CONTACT, ({bodyA, bodyB, fixtureA, fixtureB}: IBeginContactEvent) => {
      if (!this.character.isPartOfMe(bodyA) && !this.character.isPartOfMe(bodyB)) return;
      if (fixtureA.IsSensor() && !this.seenSensors.has(bodyA) && customProps.get(fixtureA)?.phaserSensorType) this.handleSensor(bodyA, fixtureA);
      else if (fixtureB.IsSensor() && !this.seenSensors.has(bodyB) && customProps.get(fixtureB)?.phaserSensorType) this.handleSensor(bodyB, fixtureB);
    });

    this.scene.b2Physics.on(B2_POST_SOLVE, ({fixtureA, fixtureB, impulse}: IPostSolveEvent) => {
      if (this.isCrashed) return;
      const bodyA = fixtureA.GetBody();
      const bodyB = fixtureB.GetBody();
      if (bodyA === bodyB) return;
      let largestImpulse: number = -1;
      for (let i = 0; i < impulse.count; i++) largestImpulse = Math.max(largestImpulse, impulse.get_normalImpulses(i));
      if ((bodyA === this.character.head || bodyB === this.character.head) && largestImpulse > HEAD_MAX_IMPULSE) this.setCrashed();
    });

    // GameInfo.observer.on(ENTER_IN_AIR, () => this.isGrounded = false);
    GameInfo.observer.on(ENTER_GROUNDED, () => {
      this.numFramesGrounded = this.scene.game.getFrame();

      const numFlips = this.pendingBackFlips + this.pendingFrontFlips;
      if (numFlips >= 1) {
        GameInfo.tsl.push({type: TrickScoreType.flip, flips: numFlips, frame: this.levelUnpausedFrames});
        const trickScore = numFlips * numFlips * BASE_FLIP_POINTS;
        this.comboAccumulator += trickScore * TRICK_POINTS_COMBO_FRACTION;
        this.comboMultiplier++;
        GameInfo.observer.emit(COMBO_CHANGE, this.comboAccumulator, this.comboMultiplier, this.isCrashed ? ComboState.Fail : ComboState.Change);
        GameInfo.observer.emit(SCORE_CHANGE, this.getCurrentScore());

        this.resetComboLeewayTween();
        this.comboLeeway = this.createComboLeewayTween(false);
      }

      this.currentFlipRotation = 0;
      this.pendingBackFlips = 0;
      this.pendingFrontFlips = 0;
    });
  }

  private setCrashed() {
    this.isCrashed = true;
    GameInfo.observer.emit(ENTER_CRASHED, this.getCurrentScore(), this.character.id);
    if (this.character.id === GameInfo.possessedCharacterId) GameInfo.crashed = true;

    GameInfo.observer.emit(COMBO_CHANGE, this.comboAccumulator, this.comboMultiplier, ComboState.Fail);
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
      GameInfo.observer.emit(SCORE_CHANGE, currentScore);
      GameInfo.observer.emit(LEVEL_FINISH, currentScore, this.isCrashed);
      break;
    }
    case 'level_deathzone': {
      this.setCrashed();
      break;
    }
    }
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
      GameInfo.tsl.push({type: TrickScoreType.present, frame: this.levelUnpausedFrames});
      this.totalCollectedCoins++;
      GameInfo.observer.emit(COLLECT_COIN, this.totalCollectedCoins);
      GameInfo.observer.emit(SCORE_CHANGE, this.getCurrentScore());

    }
    this.pickupsToProcess.clear();
  }

  private updateTrickCounter() {
    if (this.character.board.isInAir()) {
      const currentAngleRad = Phaser.Math.Angle.Normalize(this.character.body.GetAngle());

      const diff = this.calculateDifferenceBetweenAngles(this.lastAngleRad, currentAngleRad);
      this.currentFlipRotation += diff;
      this.lastAngleRad = currentAngleRad;

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
  private calculateDifferenceBetweenAngles(angleRadA: number, angleRadB: number): number {
    let difference = angleRadB - angleRadA;
    if (difference < -Math.PI) difference += Math.PI * 2;
    else if (difference > Math.PI) difference -= Math.PI * 2;
    return difference;
  }

  private updateDistance() {
    const {x, y} = this.character.bodyImage;
    const deltaX = x - this.lastPosX;
    const deltaY = y - this.lastPosY;
    const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    this.distancePixels += length;
    this.lastPosX = x;
    this.lastPosY = y;
  }

  private handleComboComplete() {
    if (this.isLevelFinished || this.isCrashed) return;
    GameInfo.tsl.push({type: TrickScoreType.combo, multiplier: this.comboMultiplier, accumulator: this.comboAccumulator, frame: this.levelUnpausedFrames});
    GameInfo.observer.emit(SCORE_CHANGE, this.getCurrentScore());
    GameInfo.observer.emit(COMBO_CHANGE, this.comboAccumulator, this.comboMultiplier, ComboState.Success);
    GameInfo.observer.emit(COMBO_LEEWAY_UPDATE, 0);
    this.comboAccumulator = 0;
    this.comboMultiplier = 0;
  }
}

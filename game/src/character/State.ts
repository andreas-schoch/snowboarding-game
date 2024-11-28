import {BASE_FLIP_POINTS, HEAD_MAX_IMPULSE, TRICK_POINTS_COMBO_FRACTION, b2, pb, ppm} from '..';
import {GameInfo} from '../GameInfo';
import {ComboState} from '../UI/GameUI/HUD';
import {B2_BEGIN_CONTACT, B2_POST_SOLVE, COMBO_CHANGE, COMBO_LEEWAY_UPDATE, ENTER_CRASHED, ENTER_GROUNDED, ENTER_IN_AIR, LEVEL_FINISH, COLLECT_COIN, SCORE_CHANGE, TIME_CHANGE} from '../eventTypes';
import {iterBodyJoints} from '../helpers/B2Iterators';
import {normalizeRadians} from '../helpers/angle';
import {framesToTime} from '../helpers/framesToTime';
import {generateScoreFromLogs} from '../helpers/generateScoreFromLogs';
import {IBeginContactEvent, IPostSolveEvent} from '../physics/Physics';
import {BodyEntityData, JointEntityData} from '../physics/RUBE/EntityTypes';
import {IFlipTrickScore, IScoreNew, IStartTrickScore, TrickScoreType} from '../pocketbase/types';
import {Character} from './Character';

export class CharacterState {
  levelUnpausedFrames = 0;
  isLevelFinished = false;
  isCrashed = false;
  timeGrounded = 0;

  private readonly pickupsToProcess: Set<Box2D.b2Body> = new Set();
  private readonly seenSensors: Set<Box2D.b2Body> = new Set();
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
    this.registerListeners();
  }

  update(): void {
    if (this.isCrashed || this.isLevelFinished || this.character.rubeScene.worldEntity.isPaused) return;
    if (this.levelUnpausedFrames === 0) this.pushStartLog();
    this.levelUnpausedFrames++;
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

  getCurrentScore(): IScoreNew {
    const completed = this.isLevelFinished || this.isCrashed;
    const score: IScoreNew = generateScoreFromLogs(GameInfo.tsl, completed);
    GameInfo.score = score; // TODO try using solid-js signals so UI reacts immediately to score changes (and other things it needs to know about. Or use context) 
    return score;

  }

  getCurrentSpeed(): number {
    return this.character.body.GetLinearVelocity().Length();
  }

  createComboLeewayTween(paused: boolean = true): Phaser.Tweens.Tween {
    return this.character.scene.tweens.addCounter({
      paused,
      from: 0,
      to: 360,
      duration: 3000,
      onUpdate: tween => GameInfo.observer.emit(COMBO_LEEWAY_UPDATE, tween.getValue()),
      onComplete: () => this.handleComboComplete(),
    });
  }

  private registerListeners() {
    const {observer, entityData} = this.character.rubeScene.worldEntity;
    observer.on(B2_BEGIN_CONTACT, ({bodyA, bodyB, fixtureA, fixtureB}: IBeginContactEvent) => {
      if (!this.character.isPartOfMe(bodyA) && !this.character.isPartOfMe(bodyB)) return;

      if (fixtureA.IsSensor() && !this.seenSensors.has(bodyA) && entityData.get(fixtureA)?.customProps['phaserSensorType']) {
        this.handleSensor(bodyA, fixtureA);
      } else if (fixtureB.IsSensor() && !this.seenSensors.has(bodyB) && entityData.get(fixtureB)?.customProps['phaserSensorType']) {
        this.handleSensor(bodyB, fixtureB);
      }
    });

    const triggeredSpringboards = new Set<Box2D.b2Body>();
    observer.on(B2_POST_SOLVE, ({fixtureA, fixtureB, impulse}: IPostSolveEvent) => {
      if (this.isCrashed) return;
      const bodyA = fixtureA.GetBody();
      const bodyB = fixtureB.GetBody();
      if (bodyA === bodyB) return;

      let largestImpulse: number = -1;
      for (let i = 0; i < impulse.count; i++) largestImpulse = Math.max(largestImpulse, impulse.get_normalImpulses(i));
      if ((bodyA === this.character.head || bodyB === this.character.head) && largestImpulse > HEAD_MAX_IMPULSE) return this.setCrashed();

      const bodyAEntity = entityData.get(bodyA) as BodyEntityData;
      const bodyBEntity = entityData.get(bodyB) as BodyEntityData;
      // Questionable if this belongs here. The idea was to only trigger when body part or snowboard of player touches the springboard
      if (bodyAEntity.name === 'springboard_top' || bodyBEntity.name === 'springboard_top') {
        const entity = bodyAEntity.name === 'springboard_top' ? bodyAEntity : bodyBEntity;
        for (const j of iterBodyJoints(entity.body)) {
          const jointEntity = entityData.get(j) as JointEntityData;
          if (jointEntity.name === 'distance') {
            const distanceJoint = b2.castObject(j, b2.b2DistanceJoint);
            if (distanceJoint.GetLength() > 1) return;
            if (triggeredSpringboards.has(entity.body)) return;

            triggeredSpringboards.add(entity.body);
            distanceJoint.SetMaxLength(1.7);

            setTimeout(() => {
              distanceJoint.SetLength(1.5);
              setTimeout(() => {
                distanceJoint.SetLength(0.2);
                triggeredSpringboards.delete(entity.body);
              }, 1000);
            }, 200);
          }
        }
      }
    });

    GameInfo.observer.on(ENTER_GROUNDED, () => {
      this.timeGrounded = this.character.scene.game.getTime();

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
    GameInfo.tsl.push({type: TrickScoreType.crash, frame: this.levelUnpausedFrames, timestamp: Date.now(), distance: this.getDistanceInMeters()});
    GameInfo.observer.emit(ENTER_CRASHED, this.getCurrentScore(), this.character.id);
    if (this.character.id === GameInfo.possessedCharacterId) GameInfo.crashed = true;
    GameInfo.observer.emit(COMBO_CHANGE, this.comboAccumulator, this.comboMultiplier, ComboState.Fail);
    this.resetComboLeewayTween();
  }

  private handleSensor(body: Box2D.b2Body, fixture: Box2D.b2Fixture) {
    this.seenSensors.add(body);
    if (this.isCrashed || this.isLevelFinished) return;
    const sensorType = this.character.rubeScene.worldEntity.entityData.get(fixture)?.customProps['phaserSensorType'];
    console.debug('handleSensor() type:', sensorType);
    switch (sensorType) {
    case 'pickup_present': {
      this.pickupsToProcess.add(body);
      break;
    }
    case 'level_finish': {
      this.character.scene.cameras.main.stopFollow();
      this.handleComboComplete();
      GameInfo.tsl.push({type: TrickScoreType.finish, frame: this.levelUnpausedFrames, timestamp: Date.now(), distance: this.getDistanceInMeters()});
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
    const worldEntity = this.character.rubeScene.worldEntity;
    for (const body of this.pickupsToProcess) {
      const bodyEntity = worldEntity.entityData.get(body) as BodyEntityData | undefined;
      const image = bodyEntity?.image?.image as Phaser.GameObjects.Image | undefined;
      if (bodyEntity) worldEntity.entityData.delete(body);
      if (image) image.destroy();
      worldEntity.world.DestroyBody(body as Box2D.b2Body);

      GameInfo.tsl.push({type: TrickScoreType.present, frame: this.levelUnpausedFrames});
      this.totalCollectedCoins++;
      GameInfo.observer.emit(COLLECT_COIN, this.totalCollectedCoins);
      GameInfo.observer.emit(SCORE_CHANGE, this.getCurrentScore());
    }
    this.pickupsToProcess.clear();
  }

  private updateTrickCounter() {
    if (this.character.board.isInAir()) {
      const currentAngleRad = normalizeRadians(this.character.body.GetAngle());

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
    if (this.comboLeeway) {
      if (this.character.board.isInAir() || !this.character.board.isCenterGrounded || this.character.rubeScene.worldEntity.isPaused) {
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

  private getDistanceInMeters(): number {
    return Math.floor(this.distancePixels / ppm);
  }

  private pushStartLog() {
    const {id: levelId} = GameInfo.currentLevel || {id: ''};
    const {id: userId} = pb.auth.loggedInUser() || {id: ''};
    const log: IStartTrickScore = {type: TrickScoreType.start, frame: this.levelUnpausedFrames, timestamp: Date.now(), levelRevision: 1, userId, levelId};
    GameInfo.tsl.push(log);
  }
}

import {ILevel} from './levels';
import {Physics} from './physics/Physics';
import {IScoreNew, TrickScore} from './pocketbase/types';

export class GameInfo {
  static observer: Phaser.Events.EventEmitter;
  static possessedCharacterId: string;
  static score: IScoreNew;
  static currentLevel: ILevel | null = null;
  static crashed = false;
  static tsl: TrickScore[] = [];

  static physics: Physics;
}

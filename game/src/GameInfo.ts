import {ILevel} from './levels';
import {IScore, TrickScore} from './pocketbase/types';

export class GameInfo {
  static observer: Phaser.Events.EventEmitter;
  static possessedCharacterId: string;
  static score: IScore;
  static currentLevel: ILevel | null = null;
  static crashed = false;
  static tsl: TrickScore[] = [];
}

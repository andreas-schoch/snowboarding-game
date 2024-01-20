import {IScore} from './pocketbase/types';

export class GameInfo {
  static observer: Phaser.Events.EventEmitter;
  static possessedCharacterId: string;
  static score: IScore;
  static crashed = false;
}

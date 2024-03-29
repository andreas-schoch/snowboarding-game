import {ILevel} from './levels';
import {RubeFile} from './physics/RUBE/RubeFile';
import {IScoreNew, TrickScore} from './pocketbase/types';

export class GameInfo {
  // TODO make phaser events type save or switch to a different event system. I don't get errors when arguments are missing
  static observer: Phaser.Events.EventEmitter;
  static possessedCharacterId: string;
  static score: IScoreNew | null = null;
  static currentLevel: ILevel | null = null;
  static currentLevelScene: RubeFile | null = null;
  static crashed = false;
  static tsl: TrickScore[] = [];
}

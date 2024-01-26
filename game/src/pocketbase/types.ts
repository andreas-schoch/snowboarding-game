import {RecordModel} from 'pocketbase';

export interface IUser extends RecordModel{
  id: string;
  username: string;
  usernameChanged: boolean;
  created: string;
  updated: string;
}

export const isUser = (obj: unknown): obj is IUser => {
  return typeof obj === 'object' && obj !== null && 'id' in obj && 'username' in obj && 'usernameChanged' in obj && 'created' in obj && 'updated' in obj;
};

export const enum TrickScoreType {
  combo = 1,
  flip = 2,
  present = 3,
  start = 4,
  finish = 5,
  crash = 6,
}

export interface IBaseTrickScore {
  type: TrickScoreType;
  frame: number;
  // posX: number;
  // posY: number;
  // distance: number;
}

export interface IComboTrickScore extends IBaseTrickScore {
  type: TrickScoreType.combo;
  accumulator: number;
  multiplier: number;
}

export interface IFlipTrickScore extends IBaseTrickScore {
  type: TrickScoreType.flip;
  flips: number;
}

export interface ICoinTrickScore extends IBaseTrickScore {
  type: TrickScoreType.present;
}

export interface IStartTrickScore extends IBaseTrickScore {
  type: TrickScoreType.start;
  timestamp: number;
  levelRevision: 1; // placeholder for now
  levelId: string;
  userId: string;
  // characterId: string;
}

export interface IFinishTrickScore extends IBaseTrickScore {
  type: TrickScoreType.finish;
  timestamp: number;
  distance: number;
}

export interface ICrashTrickScore extends IBaseTrickScore {
  type: TrickScoreType.crash;
  timestamp: number;
  distance: number;
}

export type TrickScore = IComboTrickScore | IFlipTrickScore | ICoinTrickScore | IStartTrickScore | IFinishTrickScore | ICrashTrickScore;

export interface IScoreNew {
  user: string; // one-to-one relation to user collection
  level: string; // one-to-one relation to level collection
  finishedLevel: boolean;
  crashed: boolean;
  tsl: string;
  // TRICK MODE
  pointsCoin: number;
  pointsTrick: number;
  pointsCombo: number;
  pointsComboBest: number;
  pointsTotal: number; // derived from others
  // RACE MODE
  distance: number;
  time: number;
}

export type IScore = IScoreNew & RecordModel;

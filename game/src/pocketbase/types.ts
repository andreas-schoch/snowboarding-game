import {RecordModel} from 'pocketbase';

export interface IUser extends RecordModel {
  id: string;
  username: string;
  usernameChanged: boolean;
  created: string;
  updated: string;
}

export const enum TrickScoreType {
  combo = 1,
  flip = 2,
  present = 3,
}

export interface IBaseTrickScore {
  type: TrickScoreType;
  frame: number;
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

export type TrickScore = IComboTrickScore | IFlipTrickScore | ICoinTrickScore;

export interface IScore {
  id?: string;
  user?: string; // one-to-one relation to user collection
  level: string; // one-to-one relation to level collection
  finishedLevel: boolean;
  crashed: boolean;
  tsl?: string;
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

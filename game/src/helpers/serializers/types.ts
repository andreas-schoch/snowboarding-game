import {IBaseTrickScore, IComboTrickScore, IFlipTrickScore, IScore, TrickScoreType} from '../../pocketbaseService/types';

export interface IScoreProto {
  id: IScore['id'];
  u: IScore['user'];
  ts: IScore['total'];
  td: IScore['distance'];
  tp: IScore['coins'];
  tts: IScore['trickScore'];
  fl: 0 | 1;
  c: 0 | 1;
  l: IScore['level'];
  tsl: TrickScoreProto[];
}

export interface IBaseTrickScoreProto { // IBaseTrickScore
  t: TrickScoreType;
  fr: IBaseTrickScore['frame'];
  d: IBaseTrickScore['distance'];
}

export interface IComboTrickScoreProto extends IBaseTrickScoreProto { // IComboTrickScore
  t: TrickScoreType.combo;
  a: IComboTrickScore['accumulator'];
  m: IComboTrickScore['multiplier'];
}

export interface IFlipTrickScoreProto extends IBaseTrickScoreProto { // IFlipTrickScore
  t: TrickScoreType.flip;
  fl: IFlipTrickScore['flips']; // flips
}

export interface ICoinTrickScoreProto extends IBaseTrickScoreProto { // ICoinTrickScore
  t: TrickScoreType.present;
}

export type TrickScoreProto = IComboTrickScoreProto | IFlipTrickScoreProto | ICoinTrickScoreProto;

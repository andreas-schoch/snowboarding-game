import {IBaseTrickScore, IComboTrickScore, IFlipTrickScore, TrickScore, TrickScoreType} from '../pocketbase/types';

export type TrickScoreProto = IComboTrickScoreProto | IFlipTrickScoreProto | ICoinTrickScoreProto;

export const toTSLProto = (tsl: TrickScore[]): TrickScoreProto[] => {
  return tsl.map(ts => {
    switch (ts.type) {
    case TrickScoreType.combo:
      return {t: ts.type, fr: ts.frame, a: ts.accumulator, m: ts.multiplier};
    case TrickScoreType.flip:
      return {t: ts.type, fr: ts.frame, fl: ts.flips};
    case TrickScoreType.present:
      return {t: ts.type, fr: ts.frame};
    default:
      throw Error('Unknown trick score type');
    }
  });
};

export const fromTSLProto = (tsl: TrickScoreProto[]): TrickScore[] => {
  return tsl.map(tsp => {
    switch (tsp.t) {
    case TrickScoreType.combo:
      return {type: tsp.t, frame: tsp.fr, accumulator: tsp.a, multiplier: tsp.m};
    case TrickScoreType.flip:
      return {type: tsp.t, frame: tsp.fr, flips: tsp.fl};
    case TrickScoreType.present:
      return {type: tsp.t, frame: tsp.fr};
    default:
      throw Error('Unknown trick score type');
    }
  });
};

export const toWrapperTSLProto = (data: {wrapper: TrickScore[]}): {wrapper: TrickScoreProto[]} => {
  return {wrapper: toTSLProto(data.wrapper)};
};

export const fromWrapperTSLProto = (tslp: {wrapper: TrickScoreProto[]}): {wrapper: TrickScore[]} => {
  return {wrapper: fromTSLProto(tslp.wrapper)};
};

export interface IBaseTrickScoreProto {
  t: TrickScoreType;
  fr: IBaseTrickScore['frame'];
}

export interface IComboTrickScoreProto extends IBaseTrickScoreProto {
  t: TrickScoreType.combo;
  a: IComboTrickScore['accumulator'];
  m: IComboTrickScore['multiplier'];
}

export interface IFlipTrickScoreProto extends IBaseTrickScoreProto {
  t: TrickScoreType.flip;
  fl: IFlipTrickScore['flips'];
}

export interface ICoinTrickScoreProto extends IBaseTrickScoreProto {
  t: TrickScoreType.present;
}

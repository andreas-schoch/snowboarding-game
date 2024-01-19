import {BASE_FLIP_POINTS, POINTS_PER_COIN, trickScoreSerializer} from '..';
import {IComboTrickScore, IScore, TrickScoreType} from '../pocketbaseService/types';

export const calculateTotalScore = (score: IScore): number => {
  const log = trickScoreSerializer.decode(score.tsl);
  return log.reduce((acc, cur) => {
    if (cur.type === TrickScoreType.combo) return acc + (cur.multiplier * cur.accumulator);
    else if (cur.type === TrickScoreType.flip) return acc + (cur.flips * cur.flips * BASE_FLIP_POINTS);
    else if (cur.type === TrickScoreType.present) return acc + POINTS_PER_COIN;
    else return acc;
  }, 0);};

export const calculateTrickScore = (score: IScore): number => {
  const log = trickScoreSerializer.decode(score.tsl);
  return log.reduce((acc, cur) => {
    if (cur.type === TrickScoreType.combo) return acc + (cur.multiplier * cur.accumulator);
    else if (cur.type === TrickScoreType.flip) return acc + (cur.flips * cur.flips * BASE_FLIP_POINTS);
    else return acc;
  }, 0);
};

export const calculateBestCombo = (score: IScore): number => {
  const log = trickScoreSerializer.decode(score.tsl);
  const comboLogs = log.filter(s => s.type === TrickScoreType.combo) as IComboTrickScore[];
  if (comboLogs.length === 0) return 0;
  return Math.max(...comboLogs.map(s => s.accumulator * s.multiplier));
};

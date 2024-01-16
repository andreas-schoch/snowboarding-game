import {BASE_FLIP_POINTS, LEVEL_SUCCESS_BONUS_POINTS, POINTS_PER_COIN} from '..';
import {IComboTrickScore, IScore} from '../State';

export const calculateTotalScore = (score: IScore, useCachedTotal = false): number => {
  return score.distance + calculateTrickScore(score, useCachedTotal) + (score.coins * POINTS_PER_COIN) + (score.finishedLevel ? LEVEL_SUCCESS_BONUS_POINTS : 0);
};

export const calculateTrickScore = (score: IScore, useCachedTotal = false): number => {
  if (useCachedTotal) return score.trickScore;
  return score.trickScoreLog.reduce((acc, cur) => {
    if (cur.type === 'combo') return acc + (cur.multiplier * cur.accumulator);
    else if (cur.type === 'flip') return acc + (cur.flips * cur.flips * BASE_FLIP_POINTS);
    else return acc;
  }, 0);
};

export const calculateBestCombo = (score: IScore): number => {
  const comboLogs = score.trickScoreLog.filter(s => s.type === 'combo') as IComboTrickScore[];
  if (comboLogs.length === 0) return 0;
  return Math.max(...comboLogs.map(s => s.accumulator * s.multiplier));
};

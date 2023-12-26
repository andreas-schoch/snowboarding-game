import {IScore} from '../components/State';
import { BASE_FLIP_POINTS, LEVEL_SUCCESS_BONUS_POINTS, POINTS_PER_COIN } from "..";

export const calculateTotalScore = (score: IScore, useCachedTotal: boolean = true): number => {
  return score.distance + calculateTrickScore(score, useCachedTotal) + (score.coins * POINTS_PER_COIN) + (score.finishedLevel ? LEVEL_SUCCESS_BONUS_POINTS : 0);
};

export const calculateTrickScore = (score: IScore, useCachedTotal: boolean): number => {
  if (useCachedTotal) return score.trickScore;
  return score.trickScoreLog.reduce((acc, cur) => {
    if (cur.type === 'combo') return acc + (cur.multiplier * cur.accumulator);
    else if (cur.type === 'flip') return acc + (cur.flips * cur.flips * BASE_FLIP_POINTS);
    else return acc;
  }, 0);
};

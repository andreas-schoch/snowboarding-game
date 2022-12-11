import {IScore} from '../components/State';
import {LEVEL_SUCCESS_BONUS_POINTS, POINTS_PER_COIN} from '../index';

export const calculateTotalScore = (score: IScore): number => {
  return score.distance + score.trickScore + (score.coins * POINTS_PER_COIN) + (score.finishedLevel ? LEVEL_SUCCESS_BONUS_POINTS : 0);
};

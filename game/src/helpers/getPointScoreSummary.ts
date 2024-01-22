import {BASE_FLIP_POINTS, POINTS_PER_COIN, trickScoreSerializer} from '..';
import {IScore, TrickScoreType} from '../pocketbase/types';

export interface IPointScoreSummary {
  fromCoins: number;
  fromCombos: number;
  fromTricks: number;

  bestCombo: number;
  total: number;
}

export interface IRaceScoreSummary {
  distance: number; // in meters
  avgSpeed: number; // average speed in km/h
  time: number; // in ms
}

export const getPointScoreSummary = (tsl: IScore['tsl']): IPointScoreSummary => {
  let fromCoins = 0;
  let fromTricks = 0;
  let fromCombos = 0;
  let bestCombo = 0;

  const log = trickScoreSerializer.decode(tsl);
  for (const trick of log) {
    if (trick.type === TrickScoreType.present) fromCoins += POINTS_PER_COIN;
    else if (trick.type === TrickScoreType.flip) fromTricks += (trick.flips * trick.flips * BASE_FLIP_POINTS);
    else if (trick.type === TrickScoreType.combo) {
      const combo = trick.accumulator * trick.multiplier;
      fromCombos += combo;
      if (combo > bestCombo) bestCombo = combo;
    }
  }

  return {
    fromCoins,
    fromCombos,
    fromTricks,
    bestCombo,
    total: fromCoins + fromCombos + fromTricks,
  };
};

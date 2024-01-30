import {BASE_FLIP_POINTS, POINTS_PER_COIN, scoreLogSerializer} from '..';
import {IScoreNew, TrickScore, TrickScoreType} from '../pocketbase/types';

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

export function generateScoreFromLogs(tsl: TrickScore[], completed: boolean = false): IScoreNew {
  console.time('getScoreFromLogs');
  const log = typeof tsl === 'string' ? scoreLogSerializer.decode(tsl) : tsl;

  const firstLog = log[0];
  const lastLog = log[log.length - 1];

  if (firstLog.type !== TrickScoreType.start) throw new Error('Invalid TSL, missing start');

  const user = firstLog.userId;
  const level = firstLog.levelId;
  const finishedLevel = lastLog.type === TrickScoreType.finish;
  const crashed = lastLog.type === TrickScoreType.crash;
  let distance = 0;

  if (completed) {
    if (!finishedLevel && !crashed) throw new Error('Invalid TSL, missing finish or crash');
    distance = lastLog.distance;
  }

  const time = Math.floor((lastLog.frame / 60) * 1000);

  let pointsCoin = 0;
  let pointsTrick = 0;
  let pointsCombo = 0;
  let pointsComboBest = 0;

  for (const trick of log) {
    if (trick.type === TrickScoreType.present) pointsCoin += POINTS_PER_COIN;
    else if (trick.type === TrickScoreType.flip) pointsTrick += (trick.flips * trick.flips * BASE_FLIP_POINTS);
    else if (trick.type === TrickScoreType.combo) {
      const combo = trick.accumulator * trick.multiplier;
      pointsCombo += combo;
      if (combo > pointsComboBest) pointsComboBest = combo;
    }
  }

  console.timeEnd('getScoreFromLogs');
  return {
    user,
    level,
    finishedLevel,
    tsl: '',
    time,
    crashed,
    distance,
    pointsCoin,
    pointsTrick,
    pointsCombo,
    pointsComboBest,
    pointsTotal: pointsCoin + pointsCombo + pointsTrick,
  };
}

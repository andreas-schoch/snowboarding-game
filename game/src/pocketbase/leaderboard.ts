
import PocketBase, {RecordListOptions, RecordModel} from 'pocketbase';
import {scoreLogSerializer} from '..';
import {GameInfo} from '../GameInfo';
import {PersistedStore} from '../PersistedStore';
import {arrayBufferToString, stringToBlob} from '../helpers/binaryTransform';
import {generateScoreFromLogs} from '../helpers/generateScoreFromLogs';
import {ILevel, LocalLevelKeys} from '../levels';
import {Auth} from './auth';
import {IScore, IScoreNew} from './types';

export interface IUser extends RecordModel {
  id: string;
  username: string;
  usernameChanged: boolean;
  created: string;
  updated: string;
}

export class Leaderboard {

  constructor(private pb: PocketBase, private auth: Auth) { }

  async scores(level: ILevel['id'], page = 1, perPage = 100): Promise<IScore[]> {
    const options: RecordListOptions = {filter: `level = "${level}"`, sort: '-pointsTotal', expand: 'user'};
    const resultList = await this.pb.collection<IScore>('Score').getList(page, perPage, options);
    return resultList.items;
  }

  async scoresFromLogs(level: ILevel['id'], page = 1, perPage = 100): Promise<IScore[]> {
    console.time('fetch scoresFromLogs');
    const scores = await this.scores(level, page, perPage);
    console.timeLog('fetch scoresFromLogs', 'scores collection items fetched');

    const blobBufferPromises = scores.map(score => fetch(this.pb.files.getUrl(score, score.tsl)).then(res => res.arrayBuffer()));
    const buffers = await Promise.all(blobBufferPromises);
    const logs = await Promise.all(buffers.map(buffer => scoreLogSerializer.decode(arrayBufferToString(buffer))));
    console.timeLog('fetch scoresFromLogs', 'related tsl blobs fetched and decoded');

    // TODO temporary to ensure decode of TSL works until its content is finalized and server overrides the point fields using it
    for (const [i, score] of scores.entries()) {
      const scoreFromLogs = generateScoreFromLogs(logs[i]);
      score.pointsCoin = scoreFromLogs.pointsCoin;
      score.pointsTrick = scoreFromLogs.pointsTrick;
      score.pointsCombo = scoreFromLogs.pointsCombo;
      score.pointsComboBest = scoreFromLogs.pointsComboBest;
      score.pointsTotal = scoreFromLogs.pointsTotal;
      score.user = scoreFromLogs.user;
      score.level = scoreFromLogs.level;
      score.finishedLevel = scoreFromLogs.finishedLevel;
      score.crashed = scoreFromLogs.crashed;
      score.distance = scoreFromLogs.distance;
      score.time = scoreFromLogs.time;
    }
    console.timeEnd('fetch scoresFromLogs');
    return scores;
  }
  // TODO get existing score in advance when starting the level, so using the logs we can display to the user the score changes in realtime based on frame count
  // Maybe even get the top 10 scores in advance and show pseudo realtime leaderboards
  async submit(score: IScoreNew): Promise<IScore> {
    const loggedInUser = this.auth.loggedInUser();
    if (!loggedInUser) throw new Error('Not logged in');
    if (score.pointsTotal !== 0 && GameInfo.tsl.length === 0) throw new Error('Missing tsl');

    const tslString = scoreLogSerializer.encode(GameInfo.tsl);
    const blob = stringToBlob(tslString, 'application/octet-stream');

    // @ts-expect-error to upload the TSL pocketbase expects a Blob. It gets stored as a file and the filename is referenced as score.tsl
    score.tsl = blob;
    score.user = loggedInUser.id;
    score.level = PersistedStore.currentLevel();

    this.saveScoreLocally(score);

    const existingScore = await this.pb.collection('Score').getFirstListItem<IScore>(`user="${score.user}" && level="${score.level}"`).catch(() => null);

    if (!existingScore) {
      console.debug('No scores for this level. Submitting new score', score);
      return await this.pb.collection('Score').create<IScore>(score);
    }

    if (score.pointsTotal >existingScore.pointsTotal) {
      console.debug('New highscore. Update existing score', score);
      return await this.pb.collection('Score').update<IScore>(existingScore.id!, score);
    }

    console.debug('Score not higher than existing score. Not submitting');
    return existingScore;
  }

  private saveScoreLocally(score: IScoreNew) {
    const localScoresMap: Record<keyof LocalLevelKeys, IScoreNew[]> = PersistedStore.localScores();
    const localScoresLevel = localScoresMap[score.level] || [];
    localScoresLevel.push(score);
    localScoresMap[score.level] = localScoresLevel;
    PersistedStore.set('userScores', JSON.stringify(localScoresMap));
  }
}

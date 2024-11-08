
import PocketBase, {ListResult, RecordListOptions, RecordModel} from 'pocketbase';
import {scoreLogSerializer} from '..';
import {GameInfo} from '../GameInfo';
import {PersistedStore} from '../PersistedStore';
import {stringToBlob} from '../helpers/binaryTransform';
import {ILevel, LocalLevelKeys} from '../levels';
import {Auth} from './auth';
import {IRank, IScore, IScoreNew} from './types';

export interface IUser extends RecordModel {
  id: string;
  username: string;
  usernameChanged: boolean;
  created: string;
  updated: string;
}

export class Leaderboard {

  constructor(private pb: PocketBase, private auth: Auth) { }

  async list(level: ILevel['id'], page = 1, perPage = 100): Promise<ListResult<IRank>> {
    const options: RecordListOptions = {requestKey: null, filter: `levelId = "${level}"`, sort: 'rank'};
    return this.pb.collection<IRank>('Ranks').getList(page, perPage, options);
  }

  async getOwnRank(level: ILevel['id']): Promise<IRank | null> {
    const loggedInUser = this.auth.loggedInUser();
    if (!loggedInUser) throw new Error('Not logged in');

    // requestKey ensures pocketbase doesn't auto cancell this request https://github.com/pocketbase/js-sdk#auto-cancellation
    const options: RecordListOptions = {requestKey: null, filter: `levelId = "${level}" && userId = "${loggedInUser.id}"`};
    const res = await this.pb.collection<IRank>('Ranks').getFullList(options);

    if (res.length === 0) return null;
    return res[0];
  }

  async getTotalRanks(level: ILevel['id']): Promise<number> {
    const options: RecordListOptions = {filter: `levelId="${level}"`};
    const res = await this.pb.collection<IRank>('Ranks').getList(1, 1, options);
    return res.totalItems;
  }

  // TODO get existing score in advance when starting the level, so using the logs we can display to the user the score changes in realtime based on frame count
  // Maybe even get the top 10 scores in advance and show pseudo realtime leaderboards
  async submit(score: IScoreNew): Promise<[IScore, boolean]> {
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
      return [await this.pb.collection('Score').create<IScore>(score), true];
    }

    if (score.pointsTotal > existingScore.pointsTotal) {
      console.debug('New highscore. Update existing score', score);
      return [await this.pb.collection('Score').update<IScore>(existingScore.id!, score), true];
    }

    console.debug('Score not higher than existing score. Not submitting');
    return [existingScore, false];
  }

  private saveScoreLocally(score: IScoreNew) {
    const localScoresMap: Record<keyof LocalLevelKeys, IScoreNew[]> = PersistedStore.localScores();
    const localScoresLevel = localScoresMap[score.level] || [];
    localScoresLevel.push(score);
    localScoresMap[score.level] = localScoresLevel;
    PersistedStore.set('userScores', JSON.stringify(localScoresMap));
  }
}

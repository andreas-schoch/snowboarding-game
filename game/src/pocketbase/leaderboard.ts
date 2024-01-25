
import PocketBase, {RecordListOptions, RecordModel} from 'pocketbase';
import {scoreLogSerializer} from '..';
import {GameInfo} from '../GameInfo';
import {Settings} from '../Settings';
import {getPointScoreSummary} from '../helpers/getPointScoreSummary';
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

    // TODO temporary to ensure decode of TSL works until its content is finalized and server overrides the point fields using it
    for (const score of resultList.items) {
      const {total, fromCoins, fromCombos, fromTricks} = getPointScoreSummary(score.tsl!);
      score.pointsTotal = total;
      score.pointsCoin = fromCoins;
      score.pointsCombo = fromCombos;
      score.pointsTrick = fromTricks;
    }
    return resultList.items;
  }

  // TODO get existing score in advance when starting the level, so using the logs we can display to the user the score changes in realtime based on frame count
  // Maybe even get the top 10 scores in advance and show pseudo realtime leaderboards
  async submit(score: IScoreNew): Promise<IScore> {
    const loggedInUser = this.auth.loggedInUser();
    if (!loggedInUser) throw new Error('Not logged in');
    if (score.pointsTotal !== 0 && GameInfo.tsl.length === 0) throw new Error('Missing tsl');
    score.tsl = scoreLogSerializer.encode(GameInfo.tsl);
    if (!score.tsl) throw new Error('Missing tsl');
    score.user = loggedInUser.id;
    score.level = Settings.currentLevel();

    this.saveScoreLocally(score);

    const existingScore = await this.pb.collection('Score').getFirstListItem<IScore>(`user="${score.user}" && level="${score.level}"`).catch(() => null);

    if (!existingScore) {
      console.log('No scores for this level. Submitting new score', score);
      return await this.pb.collection('Score').create<IScore>(score);
    }

    if (score.pointsTotal >existingScore.pointsTotal) {
      console.log('New highscore. Update existing score', score);
      return await this.pb.collection('Score').update<IScore>(existingScore.id!, score);
    }

    console.log('Score not higher than existing score. Not submitting');
    return existingScore;
  }

  private saveScoreLocally(score: IScoreNew) {
    const localScoresMap: Record<keyof LocalLevelKeys, IScoreNew[]> = Settings.localScores();
    const localScoresLevel = localScoresMap[score.level] || [];
    localScoresLevel.push(score);
    localScoresMap[score.level] = localScoresLevel;
    Settings.set('userScores', JSON.stringify(localScoresMap));
  }
}

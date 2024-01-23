
import PocketBase, {RecordModel} from 'pocketbase';
import {trickScoreSerializer} from '..';
import {GameInfo} from '../GameInfo';
import {Settings} from '../Settings';
import {ILevel, LocalLevelKeys} from '../levels';
import {Auth} from './auth';
import {IScore} from './types';

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
    const options = {filter: `level = "${level}"`, sort: '+pointsTotal'};
    const resultList = await this.pb.collection<IScore>('Score').getList(page, perPage, options);
    return resultList.items;
  }

  async submit(score: IScore): Promise<IScore> {
    const loggedInUser = this.auth.loggedInUser();
    if (!loggedInUser) throw new Error('Not logged in');
    if (score.pointsTotal !== 0 && GameInfo.tsl.length === 0) throw new Error('Missing tsl');
    score.tsl = trickScoreSerializer.encode(GameInfo.tsl);
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
    return score;
  }

  private saveScoreLocally(score: IScore) {
    const localScoresMap: Record<keyof LocalLevelKeys, IScore[]> = Settings.localScores();
    const localScoresLevel = localScoresMap[score.level] || [];
    localScoresLevel.push(score);
    localScoresMap[score.level] = localScoresLevel;
    Settings.set('userScores', JSON.stringify(localScoresMap));
  }
}

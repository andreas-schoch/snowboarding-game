
import PocketBase, {RecordModel} from 'pocketbase';
import {Settings} from '../Settings';
import {IScore} from '../character/State';
import {env} from '../environment';
import {calculateTotalScore} from '../helpers/calculateTotalScore';
import {pseudoRandomId} from '../helpers/pseudoRandomId';
import {LevelKeys} from '../levels';

export interface IUser extends RecordModel {
  id: string;
  username: string;
  usernameChanged: boolean;
  created: string;
  updated: string;
}

export class LeaderboardService {
  currentUser: IUser | null = null;
  private pb: PocketBase;

  constructor() {
    if (!env.POCKETBASE_ENABLED) throw new Error('PocketbaseLeaderboardService not yet implemented');
    this.pb = new PocketBase(env.POCKETBASE_API);
    this.login().then(() => console.log('logged in'));
  }

  async scores(level: LevelKeys, page = 1, perPage = 100): Promise<IScore[]> {
    const resultList = await this.pb.collection<IScore>('Score').getList(page, perPage, {
      // filter: 'created >= "2022-01-01 00:00:00" && someField1 != someField2',
      filter: `level = "${level}"`,
      sort: '-total',
    });

    return resultList.items;
  }

  async submit(score: IScore): Promise<IScore> {
    if (!this.currentUser) throw new Error('Not logged in');
    score.user = this.currentUser.id;
    score.level = Settings.currentLevel();
    score.total = calculateTotalScore(score);
    this.saveScoreLocally(score);

    const existingScore = await this.pb.collection('Score').getFirstListItem<IScore>(`user="${score.user}" && level="${score.level}"`).catch(() => null);

    if (!existingScore) {
      console.log('No scores for this level. Submitting new score', score);
      return await this.pb.collection('Score').create<IScore>({...score, trickScoreLog: JSON.stringify(score.trickScoreLog || [])});
    }

    if (calculateTotalScore(score) > calculateTotalScore(existingScore)) {
      console.log('New highscore. Update existing score', score);
      return await this.pb.collection('Score').update<IScore>(existingScore.id!, {...score, trickScoreLog: JSON.stringify(score.trickScoreLog || [])});
    }

    console.log('Score not higher than existing score. Not submitting');
    return score;
  }

  async updateUsername(username: string): Promise<IUser> {
    if (!this.currentUser) throw new Error('Not logged in');
    const record = await this.pb.collection('users').update<IUser>(this.currentUser.id, {username, usernameChanged: true});
    this.currentUser = record;
    return record;
  }

  private async login() {
    let username = Settings.username();
    let uid = Settings.anonymousUID();

    if (!username || !uid) [username, uid] = await this.registerAnonymousUser();
    if (!username || !uid) throw new Error('Failed to register anonymous user');

    const authResponse = await this.pb.collection('users').authWithPassword<IUser>(username, uid);
    this.currentUser = authResponse.record;
  }

  private async registerAnonymousUser() {
    const username = pseudoRandomId();
    const uid = pseudoRandomId();

    const newUser = await this.pb.collection('users').create<IUser>({
      username: username,
      password: uid,
      passwordConfirm: uid,
      usernameChanged: false,
    });

    Settings.set('userName', newUser.username);
    Settings.set('anonymous_uid', uid);
    return [username, uid];
  }

  private saveScoreLocally(score: IScore) {
    const localScoresMap: Record<keyof LevelKeys, IScore[]> = Settings.localScores();
    const localScoresLevel = localScoresMap[score.level] || [];
    localScoresLevel.push(score);
    localScoresMap[score.level] = localScoresLevel;
    Settings.set('userScores', JSON.stringify(localScoresMap));
  }
}

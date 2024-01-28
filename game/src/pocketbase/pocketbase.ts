
import PocketBase, {RecordModel} from 'pocketbase';
import {Settings} from '../Settings';
import {env} from '../environment';
import {Level} from './Level';
import {User} from './User';
import {Auth} from './auth';
import {Leaderboard} from './leaderboard';
import { DEBUG_LOGS } from '..';

export class PocketbaseService {
  auth: Auth;
  user: User;
  level: Level;
  leaderboard: Leaderboard;
  private pb: PocketBase;

  constructor() {
    if (!env.POCKETBASE_ENABLED) throw new Error('PocketbaseLeaderboardService not yet implemented');
    this.pb = new PocketBase(env.POCKETBASE_API);
    this.pb.authStore.onChange((token, model) => {
      if (DEBUG_LOGS) console.log('AuthStore.onChange:', token, model);
      if (model && Settings.username() !== model.username) Settings.set('userName', model.username);
    });

    this.pb.beforeSend = async (url, options) => {
      if (DEBUG_LOGS) console.log('pb.beforeSend:', this.pb.authStore.isValid, url, options);
      if (options.headers?.['Authorization'] && !this.pb.authStore.isValid) this.auth.login();
      return {url, options};
    };

    this.auth = new Auth(this.pb);
    this.user = new User(this.pb, this.auth);
    this.level = new Level(this.pb, this.auth);
    this.leaderboard = new Leaderboard(this.pb, this.auth);
    this.auth.login().then(() => DEBUG_LOGS && console.log('logged in'));
  }

  getUrl(record: RecordModel, filename: string) {
    return this.pb.files.getUrl(record, filename);
  }
}

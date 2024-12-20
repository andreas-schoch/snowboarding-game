
import PocketBase, {FileOptions, RecordModel} from 'pocketbase';
import {PersistedStore} from '../PersistedStore';
import {env} from '../environment';
import {Level} from './Level';
import {User} from './User';
import {Auth} from './auth';
import {Leaderboard} from './leaderboard';

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
      console.debug('AuthStore.onChange:', {token, model});
      if (model && PersistedStore.username() !== model.username) PersistedStore.set('userName', model.username);
    });

    this.pb.beforeSend = async (url, options) => {
      console.debug('pb.beforeSend:', this.pb.authStore.isValid, url, options);
      if (options.headers?.['Authorization'] && !this.pb.authStore.isValid) this.auth.login();
      return {url, options};
    };

    this.auth = new Auth(this.pb);
    this.user = new User(this.pb, this.auth);
    this.level = new Level(this.pb, this.auth);
    this.leaderboard = new Leaderboard(this.pb, this.auth);
    this.auth.login().then(() => console.debug('logged in'));
  }

  getUrl(record: RecordModel, filename: string, queryParams?: FileOptions) {
    return this.pb.files.getUrl(record, filename, queryParams);
  }
}


import PocketBase from 'pocketbase';
import {Settings} from '../Settings';
import {pseudoRandomId} from '../helpers/pseudoRandomId';
import {IUser} from './types';
import { DEBUG_LOGS } from '..';

export class Auth {
  constructor(private pb: PocketBase) {
  }

  loggedInUser(): IUser | null {
    return this.pb.authStore.model as IUser;
  }

  async login() {
    if (DEBUG_LOGS) console.log('is login valid?', this.pb.authStore.isValid, this.pb.authStore, this.pb.authStore.isAuthRecord);
    if (this.pb.authStore.isValid) return;

    let uid = Settings.anonymousUID();
    let username = Settings.username();

    if (!uid || !username) {
      if (DEBUG_LOGS) console.log('register anonymous user');
      await this.registerAnonymousUser();
    } else if (this.pb.authStore.token) {
      if (DEBUG_LOGS) console.log('try refreshing token');
      await this.pb.collection('users').authRefresh<IUser>().catch(() => console.error('failed to refresh token'));
    }

    username = Settings.username();
    uid = Settings.anonymousUID();

    if (!username || !uid) throw new Error('Something wrong');

    await this.pb.collection('users').authWithPassword<IUser>(username, uid).catch(() => console.error('failed to login'));
  }

  async registerAnonymousUser() {
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
}

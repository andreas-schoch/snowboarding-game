
import PocketBase from 'pocketbase';
import {Settings} from '../Settings';
import {pseudoRandomId} from '../helpers/pseudoRandomId';
import {IUser} from './types';

export class Auth {
  constructor(private pb: PocketBase) {
  }

  loggedInUser(): IUser | null {
    return this.pb.authStore.model as IUser;
  }

  async login() {
    console.log('is login valid?', this.pb.authStore.isValid, this.pb.authStore, this.pb.authStore.isAuthRecord);
    if (this.pb.authStore.isValid) return;

    let uid = Settings.anonymousUID();
    let username = Settings.username();

    if (!uid || !username) {
      console.log('register anonymous user');
      await this.registerAnonymousUser();
    } else if (this.pb.authStore.token) {
      console.log('try refreshing token');
      await this.pb.collection('users').authRefresh<IUser>().catch(() => console.log('failed to refresh token'));
    }

    username = Settings.username();
    uid = Settings.anonymousUID();

    if (!username || !uid) throw new Error('Something wrong');

    await this.pb.collection('users').authWithPassword<IUser>(username, uid).catch(() => console.log('failed to login'));
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

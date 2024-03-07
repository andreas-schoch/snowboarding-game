
import PocketBase from 'pocketbase';
import {PersistedStore} from '../PersistedStore';
import {pseudoRandomId} from '../helpers/pseudoRandomId';
import {IUser} from './types';

export class Auth {
  constructor(private pb: PocketBase) {
  }

  loggedInUser(): IUser | null {
    return this.pb.authStore.model as IUser;
  }

  async login() {
    if (this.pb.authStore.isValid) {
      console.debug('auth record found locally, lets try to refresh (user may not exist anymore)', this.pb.authStore);
      const refreshedUser = await this.pb.collection<IUser>('users').authRefresh().catch(() => null);
      if (refreshedUser) {
        console.debug('user exists and is already logged in. Do nothing', this.pb.authStore);
        return;
      }
      console.debug('user was probably deleted', this.pb.authStore);
      await this.registerAnonymousUser();
    } else {
      console.debug('no auth records found locally', this.pb.authStore);
      await this.registerAnonymousUser();
    }

    const uid = PersistedStore.anonymousUID();
    const username = PersistedStore.username();
    if (!username || !uid) throw new Error('Failed to refresh or register user');

    await this.pb.collection('users').authWithPassword<IUser>(username, uid).catch(() => console.error('failed to login:' + username));
  }

  async registerAnonymousUser() {
    console.debug('Registering a new user');
    const username = pseudoRandomId();
    const uid = pseudoRandomId();

    const newUser = await this.pb.collection('users').create<IUser>({
      username: username,
      password: uid,
      passwordConfirm: uid,
      usernameChanged: false,
    });

    PersistedStore.set('userName', newUser.username);
    PersistedStore.set('anonymous_uid', uid);
    return [newUser.username, uid];
  }
}

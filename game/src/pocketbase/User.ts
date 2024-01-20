import PocketBase from 'pocketbase';
import {Auth} from './auth';
import {IUser} from './types';

export class User {

  constructor(private pb: PocketBase, private auth: Auth) { }

  async updateUsername(username: string): Promise<IUser> {
    if (!this.pb.authStore.model) throw new Error('failed to login');
    const record = await this.pb.collection('users').update<IUser>(this.pb.authStore.model.id, {username, usernameChanged: true});
    return record;
  }
}

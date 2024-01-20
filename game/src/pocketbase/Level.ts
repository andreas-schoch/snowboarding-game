import PocketBase from 'pocketbase';
import {ILevel} from '../levels';
import {Auth} from './auth';

export class Level {
  private collectionName = 'levels';

  constructor(private pb: PocketBase, private auth: Auth) { }

  async list(): Promise<ILevel[]> {
    return await this.pb.collection<ILevel>(this.collectionName).getFullList({sort: 'number'});
  }

  async get(id: ILevel['id']): Promise<ILevel | null> {
    return await this.pb.collection(this.collectionName).getOne<ILevel>(id).catch(() => null);
  }
}

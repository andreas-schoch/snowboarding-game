import PocketBase from 'pocketbase';
import {rubeFileSerializer} from '..';
import {blobToString} from '../helpers/binaryTransform';
import {ILevel} from '../levels';
import {RubeFile} from '../physics/RUBE/RubeFile';
import {Auth} from './auth';

export class Level {
  private collectionName = 'levels';

  constructor(private pb: PocketBase, private auth: Auth) { }

  async list(): Promise<ILevel[]> {
    return await this.pb.collection<ILevel>(this.collectionName).getFullList({sort: 'number', expand: 'owner'});
  }

  async get(id: ILevel['id']): Promise<ILevel | null> {
    return await this.pb.collection(this.collectionName).getOne<ILevel>(id, {expand: 'owner'}).catch(() => null);
  }

  async getRubeFile(level: ILevel): Promise<RubeFile> {
    const url = this.pb.files.getUrl(level, level.scene);
    const response = await fetch(url);
    const blob = await response.blob();
    const binaryString = await blobToString(blob);
    const scene = rubeFileSerializer.decode(binaryString);
    console.debug(`fetched RubeFile for level ${level}`, scene);
    return scene;
  }
}

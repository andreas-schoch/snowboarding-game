import PocketBase from 'pocketbase';
import {rubeFileSerializer} from '..';
import {blobToString} from '../helpers/binaryTransform';
import {ILevel, ILevelNew, isLevel} from '../levels';
import {RubeFile} from '../physics/RUBE/RubeFile';
import {sanitizeRubeFile} from '../physics/RUBE/sanitizeRubeFile';
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

  async create(level: ILevelNew): Promise<ILevel> {
    if (isLevel(level)) throw new Error('Cannot call create with an existing level. Either clone or update it.');
    const loggedInUser = this.auth.loggedInUser();
    if (!loggedInUser) throw new Error('No user logged in. This should never happen');
    level.owner = loggedInUser.id;
    return await this.pb.collection(this.collectionName).create(level);
  }

  async getRubeFile(level?: ILevel): Promise<RubeFile | null> {
    if (!level) return null;

    try {
      const url = this.pb.files.getUrl(level, level.scene);
      const response = await fetch(url);
      const blob = await response.blob();
      const binaryString = await blobToString(blob);
      let scene = rubeFileSerializer.decode(binaryString);
      scene = sanitizeRubeFile(scene);
      console.debug(`fetched RubeFile for level ${level}`, scene);
      return scene;
    } catch (e) {
      console.error('Error fetching RubeFile for level', level, e);
      return null;
    }
  }
}

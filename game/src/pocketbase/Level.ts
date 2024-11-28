import PocketBase, {ListResult} from 'pocketbase';
import {rubeFileSerializer} from '..';
import {base64ToBlob, blobToString, stringToBlob} from '../helpers/binaryTransform';
import {ILevel, ILevelNew, isLevel} from '../levels';
import {RubeFile} from '../physics/RUBE/RubeFile';
import {sanitizeRubeFile} from '../physics/RUBE/sanitizeRubeFile';
import {Auth} from './auth';
import {IUser} from './types';

export class Level {
  private collectionName = 'levels';
  private pageSize = 10;

  constructor(private pb: PocketBase, private auth: Auth) { }

  // async list(): Promise<ListResult<ILevel>> {
  //   return await this.pb.collection<ILevel>(this.collectionName).get({sort: 'number', expand: 'user'});
  // }

  async listCampaign(page: number): Promise<ListResult<ILevel>> {
    return this.pb.collection<ILevel>(this.collectionName).getList(page, this.pageSize, {
      filter: 'user.username="System"',
      sort: 'number',
      expand: 'user'
    });
  }

  async byNumber(number: ILevel['number']): Promise<ILevel | null> {
    return this.pb.collection<ILevel>(this.collectionName).getList(1, 1, {
      filter: 'number=' + number,
      expand: 'user'
    }).then(res => res.items[0] || null).catch(() => null);
  }

  async listMine(page: number): Promise<ListResult<ILevel>> {
    const loggedInUser = this.auth.loggedInUser();
    if (!loggedInUser) throw new Error('No user logged in. This should never happen');
    return this.listByUser(loggedInUser.username, 'number', page);
  }

  async listUserMade(page: number): Promise<ListResult<ILevel>> {
    return this.pb.collection<ILevel>(this.collectionName).getList(page, this.pageSize, {
      filter: 'user.username!="System"',
      // sort: sort, // TODO sort by most reviews or highest rating
      expand: 'user'
    });
  }

  async listByUser(username: IUser['username'], sort: string, page: number, ): Promise<ListResult<ILevel>> {
    const filter = `user.username="${username}"`;
    // const sort = 'number';
    return this.pb.collection<ILevel>('levels').getList(page, this.pageSize, {filter});
  }

  async get(id: ILevel['id']): Promise<ILevel | null> {
    return this.pb.collection(this.collectionName).getOne<ILevel | null>(id, {expand: 'owner'}).catch(() => null);
  }

  async create(level: ILevelNew, rubefile: RubeFile, base64Thumbnail: string): Promise<ILevel> {
    if (isLevel(level)) throw new Error('Cannot call create with an existing level');
    const loggedInUser = this.auth.loggedInUser();
    if (!loggedInUser) throw new Error('No user logged in. This should never happen');

    const rubefileBlob = stringToBlob(rubeFileSerializer.encode(rubefile), 'application/octet-stream');
    const thumbnailBlob = base64ToBlob(base64Thumbnail, 'image/jpeg');

    const formData = new FormData();
    formData.append('localId', level.localId);
    formData.append('name', level.name);
    formData.append('number', level.number.toString());
    formData.append('user', loggedInUser.id);
    formData.append('thumbnail', thumbnailBlob, 'thumbnail.jpg');
    formData.append('scene', rubefileBlob, 'level.bin');

    return await this.pb.collection(this.collectionName).create(formData);
  }

  async update(level: ILevel, rubefile: RubeFile, base64Thumbnail: string): Promise<ILevel> {
    if (!isLevel(level)) throw new Error('Cannot call update with a non-existing level');
    const loggedInUser = this.auth.loggedInUser();
    if (!loggedInUser) throw new Error('No user logged in. This should never happen');

    const rubefileBlob = stringToBlob(rubeFileSerializer.encode(rubefile), 'application/octet-stream');
    const thumbnailBlob = base64ToBlob(base64Thumbnail, 'image/jpeg');

    const formData = new FormData();
    formData.append('name', level.name);
    formData.append('thumbnail', thumbnailBlob, 'thumbnail.jpg');
    formData.append('scene', rubefileBlob, 'level.bin');

    return await this.pb.collection(this.collectionName).update(level.id, formData);
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

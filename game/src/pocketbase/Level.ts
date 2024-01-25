import PocketBase from 'pocketbase';
import {rubeSceneSerializer} from '..';
import {ILevel} from '../levels';
import {RubeScene} from '../physics/RUBE/RubeLoaderInterfaces';
import {transformBlobToBinaryString} from '../scenes/GameScene';
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

  async getRubeScene(level: ILevel): Promise<RubeScene> {
    const url = this.pb.files.getUrl(level, level.scene);
    const response = await fetch(url);
    // console.log('--------rubescene response', response);
    const blob = await response.blob();
    // console.log('--------rubescene blob', blob);
    const binaryString = await transformBlobToBinaryString(blob);
    // console.log('--------rubescene binaryString', binaryString);
    const scene = rubeSceneSerializer.decode(binaryString);
    console.log('--------rubescene scene', scene, scene.body?.filter(b => b.customProperties?.length)[0]);
    return scene;
  }
}

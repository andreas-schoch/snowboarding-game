import {RecordModel} from 'pocketbase';

export interface ILevelNew {
    // id: string;
    localId: string;
    localLastUpdated: number;
    name: string;
    number: number;
    user: string;
    thumbnail: string;
    scene: string;
}

export type LocalLevelKeys = 'level_001' | 'level_002' | 'level_003' | 'level_004' | 'level_005';

// TODO on initial load of game, cache the base levels to make the game playable offline. Consider even caching scores for later submission when online again.

export type ILevel = ILevelNew & RecordModel;

export function isLevel(level: ILevel | ILevelNew): level is ILevel {
  return Boolean((level as ILevel).collectionId);
}

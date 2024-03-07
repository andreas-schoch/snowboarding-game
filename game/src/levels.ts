import {RecordModel} from 'pocketbase';

export interface ILevelNew {
    // id: string;
    localId: string;
    name: string;
    thumbnail: string;
    number: number;
    scene: string;
    owner: string;
    created: string;
    updated: string;
}

export type LocalLevelKeys = 'level_001' | 'level_002' | 'level_003' | 'level_004' | 'level_005';

// TODO on initial load of game, cache the base levels to make the game playable offline. Consider even caching scores for later submission when online again.

export type ILevel = ILevelNew & RecordModel;

export function isLevel(level: ILevel | ILevelNew): level is ILevel {
  return Boolean((level as ILevel).collectionId);
}

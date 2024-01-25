import {RecordModel} from 'pocketbase';

export interface ILevel extends RecordModel {
    id: string;
    localId: LocalLevelKeys;
    name: string;
    thumbnail: string;
    number: number;
    tags: string[];
    scene: string;
    owner: string;
}

export type LocalLevelKeys = 'level_001' | 'level_002' | 'level_003' | 'level_004' | 'level_005';

// TODO on initial load of game, cache the base levels to make the game playable offline. Consider even caching scores for later submission when online again.

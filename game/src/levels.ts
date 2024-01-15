// TODO will come from the backend once I switch to Pocketbase
export const localLevels: ILevel[] = [{
    id: 'level_001',
    name: 'Santas Backyard',
    thumbnail: 'assets/img/thumbnails/level_001_santas_backyard.png',
    number: 1,
    tags: ['snow', 'christmas', 'winter', 'easy', 'beginner'],
    created: 10000000,
    modified: 10000000
}, {
    id: 'level_002',
    name: 'The Rollercoaster',
    thumbnail: 'assets/img/thumbnails/level_002_the_rollercoaster.png',
    number: 2,
    tags: ['snow', 'christmas', 'winter', 'easy', 'beginner'],
    created: 10000000,
    modified: 10000000
}, {
    id: 'level_003',
    name: 'Building Bridges',
    thumbnail: 'assets/img/thumbnails/level_003_building_bridges.png',
    number: 3,
    tags: ['snow', 'christmas', 'winter', 'easy', 'beginner'],
    created: 10000000,
    modified: 10000000
}, {
    id: 'level_004',
    name: 'Rocky Roads',
    thumbnail: 'assets/img/thumbnails/level_004_rocky_roads.png',
    number: 4,
    tags: ['snow', 'christmas', 'winter', 'easy', 'beginner'],
    created: 10000000,
    modified: 10000000
}, {
    id: 'level_005',
    name: 'The other Way',
    thumbnail: 'assets/img/thumbnails/level_005_looking_the_other_way.png',
    number: 5,
    tags: ['snow', 'christmas', 'winter', 'easy', 'beginner'],
    created: 10000000,
    modified: 10000000
}];

export interface ILevel {
    id: string;
    name: string;
    thumbnail: string;
    number: number;
    tags: string[];
    created: number;
    modified: number;
    revision?: number;
}


export type  LevelKeys = 'level_001' | 'level_002' | 'level_003' | 'level_004' | 'level_005';

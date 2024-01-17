// TODO will come from the backend once I switch to Pocketbase
export const localLevels: ILevel[] = [{
  id: 'qj2fzvw7dfz9y1s',
  localId: 'level_001',
  name: 'Santas Backyard',
  thumbnail: 'assets/img/thumbnails/level_001.jpg',
  number: 1,
  tags: ['snow', 'christmas', 'winter', 'easy', 'beginner'],
  created: 10000000,
  modified: 10000000
}, {
  id: 'yo1rzknpxtmdg8h',
  localId: 'level_002',
  name: 'The Rollercoaster',
  thumbnail: 'assets/img/thumbnails/level_002.jpg',
  number: 2,
  tags: ['snow', 'christmas', 'winter', 'easy', 'beginner'],
  created: 10000000,
  modified: 10000000
}, {
  id: '9l685zbarwbsd4h',
  localId: 'level_003',
  name: 'Building Bridges',
  thumbnail: 'assets/img/thumbnails/level_003.jpg',
  number: 3,
  tags: ['snow', 'christmas', 'winter', 'easy', 'beginner'],
  created: 10000000,
  modified: 10000000
}, {
  id: 'nafcw01nd3w40wp',
  localId: 'level_004',
  name: 'Rocky Roads',
  thumbnail: 'assets/img/thumbnails/level_004.jpg',
  number: 4,
  tags: ['snow', 'christmas', 'winter', 'easy', 'beginner'],
  created: 10000000,
  modified: 10000000
}, {
  id: 'we37cukr3c4c1f6',
  localId: 'level_005',
  name: 'The other Way',
  thumbnail: 'assets/img/thumbnails/level_005.jpg',
  number: 5,
  tags: ['snow', 'christmas', 'winter', 'easy', 'beginner'],
  created: 10000000,
  modified: 10000000
}];

export interface ILevel {
    id: string;
    localId: LevelKeys;
    name: string;
    thumbnail: string;
    number: number;
    tags: string[];
    created: number;
    modified: number;
    revision?: number;
}

export type LevelKeys = 'level_001' | 'level_002' | 'level_003' | 'level_004' | 'level_005';

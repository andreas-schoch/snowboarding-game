import {XY} from './Terrain';

// import {BackgroundImage} from './editor/BackgroundImage';
// import {Prefab} from './editor/PrefabObject';

export class EditorInfo {
  static readonly cursor: XY = {x: 0, y: 0};
  static readonly selectedEntityIds: string[] = [];

  static selectedBodyA() {
    return this.selectedEntityIds[0];
  }

  static selectedBodyB() {
    return this.selectedEntityIds[1];
  }
}

// export type EditorEntity = BackgroundImage | Prefab | TerrainOpen | TerrainClosed | Volume;

export type SerializeStrategy = 'image-no-body' | 'prefab' | 'terrain-loop' | 'terrain-open';

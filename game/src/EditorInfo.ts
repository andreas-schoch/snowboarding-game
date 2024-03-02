import {XY} from './Terrain';
import {RubeFile} from './physics/RUBE/RubeFile';

// import {BackgroundImage} from './editor/BackgroundImage';
// import {Prefab} from './editor/PrefabObject';

export class EditorInfo {
  static observer: Phaser.Events.EventEmitter;
  static rubeFile: RubeFile | null = null;
  static filename: string | null = null;
  static readonly cursor: XY = {x: 0, y: 0};
  static readonly selectedEntityIds: string[] = [];
  static camera: Phaser.Cameras.Scene2D.Camera;

  static selectedBodyA() {
    return this.selectedEntityIds[0];
  }

  static selectedBodyB() {
    return this.selectedEntityIds[1];
  }
}

// export type EditorEntity = BackgroundImage | Prefab | TerrainOpen | TerrainClosed | Volume;

export type SerializeStrategy = 'image-no-body' | 'prefab' | 'terrain-loop' | 'terrain-open';

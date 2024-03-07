import {EditorInfo} from '../../EditorInfo';
import {EDITOR_RESET_RENDERED, EDITOR_RENDER_CHANGE, RUBE_FILE_LOADED} from '../../eventTypes';
import {drawCoordZeroPoint} from '../../helpers/drawCoordZeroPoint';
import {EditorItem, EditorItems} from '../../physics/RUBE/RubeMetaLoader';
import {MetaImageRenderer} from './MetaImageRenderer';
import {MetaObjectRenderer} from './MetaObjectRenderer';
import {MetaTerrainRenderer} from './MetaTerrainRenderer';

export class EditorRenderer {
  constructor(private scene: Phaser.Scene) {
    const metaTerrainRenderer = new MetaTerrainRenderer(scene);
    const metaImageRenderer = new MetaImageRenderer(scene);
    const metaObjectRenderer = new MetaObjectRenderer(scene);

    EditorInfo.observer.on(RUBE_FILE_LOADED, (items: EditorItems) => {
      metaTerrainRenderer.renderThrottled(Object.values(items.terrain));
      metaImageRenderer.renderThrottled(Object.values(items.image));
      metaObjectRenderer.renderThrottled(Object.values(items.object));
    });

    // TODO maybe use createEffect within editorUI or replace events with observable pattern
    EditorInfo.observer.on(EDITOR_RENDER_CHANGE, (changed: EditorItem) => {
      switch (changed.type) {
      case 'terrain':
        return metaTerrainRenderer.renderThrottled([changed]);
      case 'image':
        return metaImageRenderer.renderThrottled([changed]);
      case 'object':
        return metaObjectRenderer.renderThrottled([changed]);
      }
    });

    EditorInfo.observer.on(EDITOR_RESET_RENDERED, () => {
      metaTerrainRenderer.resetAll();
      metaImageRenderer.resetAll();
      metaObjectRenderer.resetAll();
      drawCoordZeroPoint(this.scene);
    });

  }
}

import {EditorInfo} from '../../EditorInfo';
import {EDITOR_RESET_RENDERED, EDITOR_RENDER_CHANGE, RUBE_FILE_LOADED, EDITOR_RENDER_DELETE} from '../../eventTypes';
import {clickedCanvas} from '../../helpers/canvasClicker';
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

    EditorInfo.observer.on(EDITOR_RENDER_DELETE, (deleted: EditorItem) => {
      switch (deleted.type) {
      case 'terrain':
        return metaTerrainRenderer.clear(deleted);
      case 'image':
        return metaImageRenderer.clear(deleted.id);
      case 'object':
        return metaObjectRenderer.clear(deleted);
      }
    });

    EditorInfo.observer.on(EDITOR_RESET_RENDERED, () => {
      metaTerrainRenderer.clearAll();
      metaImageRenderer.clearAll();
      metaObjectRenderer.clearAll();
      drawCoordZeroPoint(this.scene);
    });

  }
}

export function onSelectItem(object: Phaser.GameObjects.GameObject, callback: (e: Phaser.Input.Pointer) => void) {
  let didClickDown = false; // This closure ensures that We only select when clicking down and up on the same object without moving.
  object.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, (e: Phaser.Input.Pointer) => {
    if (clickedCanvas(e)) didClickDown = true;
  });

  object.on(Phaser.Input.Events.GAMEOBJECT_POINTER_MOVE, (e: Phaser.Input.Pointer) => {
    if (clickedCanvas(e)) didClickDown = false;
  });

  object.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, (e: Phaser.Input.Pointer) => {
    if (!didClickDown || !clickedCanvas(e)) return;
    didClickDown = false;
    callback(e);
  });
}

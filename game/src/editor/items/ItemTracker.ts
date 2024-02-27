import {EditorInfo} from '../../EditorInfo';
import {EDITOR_SCENE_CHANGED} from '../../eventTypes';
import {EditorItem, EditorItems} from '../../physics/RUBE/RubeMetaLoader';

export class EditorItemTracker {
  static editorItems: EditorItems = {
    object: {},
    terrain: {},
    sensor: {},
    image: {},
  };

  static trackChange(item: EditorItem) {
    const items = EditorItemTracker.editorItems;
    const exists = items.object[item.id] || items.terrain[item.id] || items.sensor[item.id] || items.image[item.id];

    if (exists) {
      console.log('Item already exists, updating it', item);
      items[item.type][item.id] = item;
    } else {
      console.log('Item does not exist, adding it', item);
      items[item.type][item.id] = item;
    }

    EditorInfo.observer.emit(EDITOR_SCENE_CHANGED, item, items);
  }
}

import {createSignal} from 'solid-js';
import {EditorInfo} from '../../EditorInfo';
import {EDITOR_SCENE_CHANGED} from '../../eventTypes';
import {MetaObject} from '../../physics/RUBE/RubeFile';
import {EditorItem, EditorItems} from '../../physics/RUBE/RubeMetaLoader';
import { BrowserItem } from '../../UI/EditorUI/Browser';

export class EditorItemTracker {

  static editorItems: EditorItems = {
    object: {},
    terrain: {},
    sensor: {},
    image: {},
  };

  static getNextMetaObjectId(): MetaObject['id'] {
    const ids = Object.values(EditorItemTracker.editorItems.object).map(item => item.meta.id);
    const max = Math.max(...ids);
    return max + 1;
  }

  static getNextMetaImageId(): MetaObject['id'] {
    const ids = Object.values(EditorItemTracker.editorItems.image).map(item => item.meta.id);
    const max = Math.max(...ids);
    return max + 1;
  }

  static getNextMetaSensorId(): MetaObject['id'] {
    const ids = Object.values(EditorItemTracker.editorItems.sensor).map(item => item.meta.id);
    const max = Math.max(...ids);
    return max + 1;
  }

  static getNextMetaTerrainId(): MetaObject['id'] {
    const ids = Object.values(EditorItemTracker.editorItems.terrain).map(item => item.metaBody.id);
    const max = Math.max(...ids);
    return max + 1;
  }

  static add(item: EditorItem) {
    const items = EditorItemTracker.editorItems;
    items[item.type][item.id] = item;
    EditorInfo.observer.emit(EDITOR_SCENE_CHANGED, item, items);
  }

  static trackChange(item: EditorItem) {
    const items = EditorItemTracker.editorItems;
    const exists = items.object[item.id] || items.terrain[item.id] || items.sensor[item.id] || items.image[item.id];

    if (exists) {
      console.debug('Item already exists, updating it', item);
      items[item.type][item.id] = item;
    } else {
      console.debug('Item does not exist, adding it', item);
      items[item.type][item.id] = item;
    }

    setEditorItems(items);
    EditorInfo.observer.emit(EDITOR_SCENE_CHANGED, item, items);
  }
}

// For now I decided to keep it simple and have global signals despite them being discouraged in SolidJS
// I don't want to pass signals as props and I don't want to use context or state for this just yet
// Also for now I always want changes to be detected when calling the setter. Will change this only if it becomes a problem
export const [editorItems, setEditorItems] = createSignal<EditorItems>(EditorItemTracker.editorItems, {equals: false});
export const [selected, setSelected] = createSignal<EditorItem | null>(null, {equals: false});
export const [activeBrowserItem, setActiveBrowserItem] = createSignal<BrowserItem | null>(null, {equals: false});

import {ppm} from '../..';
import {EditorInfo} from '../../EditorInfo';
import {PersistedStore} from '../../PersistedStore';
import {BrowserItem} from '../../UI/EditorUI/Browser';
import {editorItems, setEditorItems} from '../../UI/EditorUI/globalSignals';
import {EDITOR_RENDER_CHANGE, EDITOR_RENDER_DELETE} from '../../eventTypes';
import {MetaImage, MetaObject} from '../../physics/RUBE/RubeFile';
import {EditorItem} from '../../physics/RUBE/RubeMetaLoader';
import {editorItemsToRubefile} from '../../physics/RUBE/RubeMetaSerializer';
import {EditorImage} from './EditorImage';
import {EditorObject} from './EditorObject';

export class EditorItemTracker {

  static getNextMetaObjectId(): MetaObject['id'] {
    const items = editorItems();
    const ids = Object.values(items.object).map(item => item.meta.id);
    const max = Math.max(...ids);
    return Number.isFinite(max) ? max + 1 : 1;
  }

  static getNextMetaImageId(): MetaObject['id'] {
    const items = editorItems();
    const ids = Object.values(items.image).map(item => item.meta.id);
    const max = Math.max(...ids);
    return Number.isFinite(max) ? max + 1 : 1;
  }

  static getNextMetaSensorId(): MetaObject['id'] {
    const items = editorItems();
    const ids = Object.values(items.sensor).map(item => item.meta.id);
    const max = Math.max(...ids);
    return Number.isFinite(max) ? max + 1 : 1;
  }

  static getNextMetaTerrainId(): MetaObject['id'] {
    const items = editorItems();
    const ids = Object.values(items.terrain).map(item => item.metaBody.id);
    const max = Math.max(...ids);
    return Number.isFinite(max) ? max + 1 : 1;
  }

  static add(item: BrowserItem, x: number, y: number): EditorItem {
    const items = editorItems();

    switch (item.type) {
    case 'object': {
      const metaObject: MetaObject = {
        id: EditorItemTracker.getNextMetaObjectId(),
        name: item.name,
        file: item.file,
        path: '',
        flip: false,
        angle: 0,
        scale: 1,
        position: {x: 0, y: 0},
        customProperties: []
      };

      const editorItem = new EditorObject(items.level, metaObject);
      editorItem.setPosition(x / ppm, y / ppm);
      return editorItem;
    }
    case 'image': {
      const metaImage: MetaImage = {
        id: EditorItemTracker.getNextMetaImageId(),
        name: item.name,
        file: item.frame,
        center: {x: 0, y: 0},
        scale: item.scale || 1,
        filter: 0,
        opacity: 1,
        renderOrder: 10,
        aspectScale: item.aspectScale || 1,
        angle: 0,
        flip: false,
        customProperties: [
          {name : 'phaserTexture', string: 'atlas_environment'}
        ]
      };

      const editorItem = new EditorImage(metaImage, undefined);
      editorItem.setPosition(x / ppm, y / ppm);
      return editorItem;
    }
    default:
      throw new Error(`Unknown item type: ${item.type}`);
    }
  }

  static delete(item: EditorItem) {
    const items = editorItems();
    delete items[item.type][item.id];
    const updatedRubefile = editorItemsToRubefile(items);
    PersistedStore.addEditorRubefile(items.level, updatedRubefile);
    items.rubefile = updatedRubefile;
    setEditorItems(items);
    EditorInfo.observer.emit(EDITOR_RENDER_DELETE, item);
  }

  static restore(item: EditorItem) {
    EditorItemTracker.trackChange(item);
  }

  static trackChange(item: EditorItem) {
    const items = editorItems();
    const exists = items.object[item.id] || items.terrain[item.id] || items.sensor[item.id] || items.image[item.id];

    if (exists) {
      console.debug('Item already exists, updating it', item);
      items[item.type][item.id] = item;
    } else {
      console.debug('Item does not exist, adding it', item);
      items[item.type][item.id] = item;
    }

    const updatedRubefile = editorItemsToRubefile(items);
    PersistedStore.addEditorRubefile(items.level, updatedRubefile);
    items.rubefile = updatedRubefile;

    setEditorItems(items);
    EditorInfo.observer.emit(EDITOR_RENDER_CHANGE, item, items);
  }
}

import {Component, For} from 'solid-js';
import {EditorInfo} from '../../EditorInfo';
import {activeBrowserItem, setActiveBrowserItem} from '../../editor/items/ItemTracker';
import {EDITOR_ITEM_PLACED} from '../../eventTypes';
import {domToPhaserCoords} from '../../helpers/domToGameCoords';
import {Pane, ResizeProps} from './Pane';

export interface PlaceItemInfo {
  x: number;
  y: number;
  item: BrowserItem;
}

export interface BrowserItemTerrain {
  id: string;
  type: 'terrain';
  name: 'Terrain';
}

export interface BrowserItemImage {
  id: string;
  type: 'image';
  name: string;
  texture: string;
  frame: string;
  scale?: number;
  aspectScale?: number;
}

export interface BrowserItemObject {
  id: string;
  type: 'object';
  name: string;
  file: string;
}

export type BrowserItem = BrowserItemTerrain | BrowserItemImage | BrowserItemObject;

export const Browser: Component<ResizeProps> = props => {

  function onDragEnd(e: DragEvent, item: BrowserItem) {
    const {x, y} = domToPhaserCoords(e, EditorInfo.camera);
    const info: PlaceItemInfo = {x, y, item};
    EditorInfo.observer.emit(EDITOR_ITEM_PLACED, info);
  }

  // TODO dedupe with Explorer
  const iconMap: Record<string, string> = {
    object: 'view_in_ar',
    terrain: 'terrain',
    image: 'wallpaper'
  };

  // TODO load from backend maybe so I can introduce new items without changing the frontend
  //  And in the future users could create their own prefabs which they can use in the editor
  const items: BrowserItem[] = [
    {id: 'item_0000', name: 'Character', type: 'object', file: 'character_v02.rube'},
    {id: 'item_0001', name: 'Terrain', type: 'terrain'},
    {id: 'item_0002', name: 'House', type: 'image', texture: 'atlas_environment', frame: 'cottage.png', scale: 7.7, aspectScale: 1},
    {id: 'item_0003', name: 'Tree', type: 'image', texture: 'atlas_environment', frame: 'tree_01.png', scale: 6, aspectScale: 1},
    {id: 'item_0004', name: 'Rock', type: 'object', file: 'rock.rube'},
    {id: 'item_0005', name: 'Crate', type: 'object', file: 'crate.rube'},
    {id: 'item_0006', name: 'Cane', type: 'object', file: 'cane.rube'},
    {id: 'item_0007', name: 'Plank', type: 'object', file: 'plank.rube'},
    {id: 'item_0008', name: 'Coin', type: 'object', file: 'coin.rube'},
  ];

  return <>
    <Pane title="Item Browser" class="@container" {...props}>
      {/* TODO reduce to the minimal amount of container queries */}
      <div class="scrollbar grid max-h-full grid-cols-3 gap-3 p-2 @lg:grid-cols-5 @3xl:grid-cols-6 @4xl:grid-cols-8 @5xl:grid-cols-10 @6xl:grid-cols-12" >
        <For each={items} fallback={<div>Empty</div>}>
          {(item) => (
            <div draggable="true" classList={{'!bg-red-500': activeBrowserItem() === item}} class="relative cursor-pointer overflow-hidden rounded-md bg-stone-700 p-1 hover:bg-stone-600" onMouseDown={() => setActiveBrowserItem(item)} onDragEnd={e => onDragEnd(e, item)}>
              {/* <img src={item.thumbnail} alt="" class="group aspect-square block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100" /> */}
              <i class="material-icons group flex aspect-square w-full items-center justify-center rounded-md bg-gray-100 text-7xl text-stone-600 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100" >{iconMap[item.type]}</i>
              <p class="">{item.name}</p>
            </div>
          )}
        </For>
      </div>
    </Pane>
  </>;
};

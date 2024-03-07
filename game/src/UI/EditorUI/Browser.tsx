import {Tabs} from '@kobalte/core';
import {Component, For, createSignal} from 'solid-js';
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

export type FilterCategory = 'all' | 'terrain' | 'static' | 'collectible' | 'dynamic' | 'decoration' | 'misc';

interface BaseBrowserItem {
  id: string;
  name: string;
  filterCategory: FilterCategory;
  iconOverride?: string;
}

export interface BrowserItemTerrain extends BaseBrowserItem {
  type: 'terrain';
}

export interface BrowserItemImage extends BaseBrowserItem {
  type: 'image';
  texture: string;
  frame: string;
  scale?: number;
  aspectScale?: number;
}

export interface BrowserItemObject extends BaseBrowserItem {
  type: 'object';
  file: string;
}

export type BrowserItem = BrowserItemTerrain | BrowserItemImage | BrowserItemObject;

export const Browser: Component<ResizeProps> = props => {
  const [activeTab, setActiveTab] = createSignal<FilterCategory>('all');

  const itemsFiltered = () => items.filter(item => item.filterCategory === activeTab() || activeTab() === 'all');

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
    {id: 'item_0000', name: 'Character', filterCategory: 'misc', type: 'object', file: 'character_v02.rube', iconOverride: 'snowboarding'},
    {id: 'item_0001', name: 'Terrain', filterCategory: 'terrain', type: 'terrain'},
    {id: 'item_0002', name: 'House', filterCategory: 'decoration', type: 'image', texture: 'atlas_environment', frame: 'cottage.png', scale: 7.7, aspectScale: 1, iconOverride: 'house'},
    {id: 'item_0003', name: 'Tree', filterCategory: 'decoration', type: 'image', texture: 'atlas_environment', frame: 'tree_01.png', scale: 6, aspectScale: 1, iconOverride: 'park'},
    {id: 'item_0004', name: 'Rock', filterCategory: 'static', type: 'object', file: 'rock.rube'},
    {id: 'item_0005', name: 'Crate', filterCategory: 'dynamic', type: 'object', file: 'crate.rube', iconOverride: 'disabled_by_default'},
    {id: 'item_0006', name: 'Cane', filterCategory: 'static', type: 'object', file: 'cane.rube', iconOverride: 'horizontal_rule'},
    {id: 'item_0007', name: 'Plank', filterCategory: 'dynamic', type: 'object', file: 'plank.rube', iconOverride: 'horizontal_rule'},
    {id: 'item_0008', name: 'Coin', filterCategory: 'collectible', type: 'object', file: 'coin.rube', iconOverride: 'paid'},
  ];

  // const Item: Component = (props: {item: BrowserItem}) => {
  //   return <div draggable="true" classList={{'!bg-red-500': activeBrowserItem() === props.item}} class="relative cursor-pointer overflow-hidden rounded-md bg-stone-700 p-1 hover:bg-stone-600" onMouseDown={() => setActiveBrowserItem(props.item)} onDragEnd={e => onDragEnd(e, props.item)}>
  //     <i class="material-icons group flex aspect-square w-full items-center justify-center rounded-md bg-gray-100 text-7xl text-stone-600 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100" >{props.item.iconOverride || iconMap[props.item.type]}</i>
  //     <p class="">{props.item.name}</p>
  //   </div>;
  // };

  return <>
    <Pane title="Item Browser" class="relative pl-[200px] @container" {...props}>

      <Tabs.Root orientation="vertical" onChange={(value: string) => setActiveTab(value as FilterCategory)} class="scrollbar absolute bottom-0 left-0 top-8 w-[200px]">
        <Tabs.List class="tabs__list overflow-y-visible">
          <Tabs.Indicator class="absolute inset-x-0 bg-stone-400 opacity-20 transition-all" />
          <Tabs.Trigger class="tabs__trigger" value="all">All</Tabs.Trigger>
          <Tabs.Trigger class="tabs__trigger" value="terrain">Terrain</Tabs.Trigger>
          <Tabs.Trigger class="tabs__trigger" value="static">Static</Tabs.Trigger>
          <Tabs.Trigger class="tabs__trigger" value="dynamic">Dynamic</Tabs.Trigger>
          <Tabs.Trigger class="tabs__trigger" value="collectible">Collectible</Tabs.Trigger>
          <Tabs.Trigger class="tabs__trigger" value="decoration">Decoration</Tabs.Trigger>
          <Tabs.Trigger class="tabs__trigger" value="misc">Misc</Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>

      {/* TODO reduce to the minimal amount of container queries */}
      <div class="scrollbar grid max-h-full grid-cols-3 gap-3 p-2 @lg:grid-cols-5 @3xl:grid-cols-6 @4xl:grid-cols-8 @5xl:grid-cols-10 @6xl:grid-cols-12" >
        <For each={itemsFiltered()} fallback={<div>Empty</div>}>
          {(item) => (
            <div draggable="true" classList={{'!bg-red-500': activeBrowserItem() === item}} class="relative cursor-pointer overflow-hidden rounded-md bg-stone-700 p-1 hover:bg-stone-600" onMouseDown={() => setActiveBrowserItem(item)} onDragEnd={e => onDragEnd(e, item)}>
              {/* <img src={item.thumbnail} alt="" class="group aspect-square block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100" /> */}
              <i class="material-icons group flex aspect-square w-full items-center justify-center rounded-md bg-gray-100 text-7xl text-stone-600 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100" >{item.iconOverride || iconMap[item.type]}</i>
              <p class="">{item.name}</p>
            </div>
          )}
        </For>
      </div>

    </Pane>
  </>;
};

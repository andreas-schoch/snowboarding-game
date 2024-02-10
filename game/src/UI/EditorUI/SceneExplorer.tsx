import {Component, For, createSignal} from 'solid-js';
import {GameInfo} from '../../GameInfo';
import {RUBE_SCENE_LOADED} from '../../eventTypes';
import {EditorItem, EditorItems} from '../../physics/RUBE/RubeMetaLoader';
import {Pane} from './BasePane';

export const ItemExplorer: Component<{selected: EditorItem | null, setSelected: (item: EditorItem) => void}> = props => {
  const [rube, setRube] = createSignal<EditorItems | null>(null);
  const objects = () => rube()?.objects;
  const terrainChunks = () => rube()?.terrainChunks;
  const images = () => rube()?.images;

  GameInfo.observer.on(RUBE_SCENE_LOADED, (items: EditorItems) => {
    console.log('SceneExplorer on RUBE_SCENE_LOADED', items);
    setRube(items);
  });

  // TODO consider using solid-js's context
  const ExplorerItem: Component<{item: EditorItem, icon: 'window' | 'border_clear' | 'polyline' | 'wallpaper' | 'view_in_ar' | 'data_object' | 'terrain'}> = innerProps => <>
    <div onClick={() => props.setSelected(innerProps.item)} classList={{'bg-neutral-500': props.selected?.id === innerProps.item.id}} class="relative py-1 px-2 text-white text-[10px] cursor-pointer flex justify-center items-center">
      <i class="material-icons text-black text-xl mr-2 flex items-center justify-center p-[2px] aspect-square h-6 rounded-sm bg-neutral-400">{innerProps.icon}</i>
      <div class="grow overflow-hidden text-ellipsis text-nowrap">{innerProps.item.meta.name}</div>
    </div>
  </>;

  return (
    <Pane title="Scene Explorer" class="w-[250px] right-2 top-2">

      <div class="scene-items-scrollable scrollbar max-h-[45vh]">
        <For each={objects()} fallback={<div>Empty</div>}>
          {(object) => <ExplorerItem item={object} icon='view_in_ar' />}
        </For>
        <For each={terrainChunks()} fallback={<div>Empty</div>}>
          {(terrainChunk) => <ExplorerItem item={terrainChunk} icon='terrain' />}
        </For>
        <For each={images()} fallback={<div>Empty</div>}>
          {(image) => <ExplorerItem item={image} icon='wallpaper' />}
        </For>
      </div>

    </Pane>
  );
};

// TODO add options to display explorer items grouped by: none, name or type (object, body, image). Groups are collapsible

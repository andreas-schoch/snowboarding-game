import {Component, For, createSignal, splitProps} from 'solid-js';
import {EditorInfo} from '../../EditorInfo';
import {RUBE_SCENE_LOADED} from '../../eventTypes';
import {EditorItem, EditorItems} from '../../physics/RUBE/RubeMetaLoader';
import {Pane, ResizeProps} from './Pane';

type ItemExplorerProps = {selected: EditorItem | null, setSelected: (item: EditorItem) => void};
export const Explorer: Component<ItemExplorerProps & ResizeProps> = props => {
  const [rube, setRube] = createSignal<EditorItems | null>(null);
  const objects = () => rube()?.objects || [];
  const terrainChunks = () => rube()?.terrainChunks || [];
  const images = () => rube()?.images || [];
  const items = () => ([...objects(), ...terrainChunks(), ...images()]);

  const [localProps, resizeProps] = splitProps(props, ['selected', 'setSelected']);

  EditorInfo.observer.on(RUBE_SCENE_LOADED, (items: EditorItems) => setRube(items));

  const iconMap: Record<EditorItem['type'], string> = {
    object: 'view_in_ar',
    terrain: 'terrain',
    image: 'wallpaper',
    sensor: 'border_clear',
  };

  return (
    <Pane {...resizeProps} title="Explorer" class="">

      <div class="scene-items-scrollable scrollbar max-h-full">
        <For each={items()} fallback={<div>Empty</div>}>
          {(item) => (
            <div onClick={() => localProps.setSelected(item)} classList={{'bg-neutral-500': localProps.selected?.id === item.id}} class="relative py-1 px-2 text-white text-[10px] cursor-pointer flex justify-center items-center">
              <i class="material-icons text-black text-xl mr-2 flex items-center justify-center p-[2px] aspect-square h-6 rounded-sm bg-neutral-400">{iconMap[item.type]}</i>
              <div class="grow overflow-hidden text-ellipsis text-nowrap">{item.getName()}</div>
            </div>
          )}
        </For>
      </div>

    </Pane>
  );
};

import {Component, For, splitProps} from 'solid-js';
import {EditorItem, EditorItems} from '../../physics/RUBE/RubeMetaLoader';
import {Pane, ResizeProps} from './Pane';

type ItemExplorerProps = {rube: EditorItems | null, selected: EditorItem | null, setSelected: (item: EditorItem) => void};
export const Explorer: Component<ItemExplorerProps & ResizeProps> = props => {
  const objects = () => props.rube ? Object.values(props.rube.object) : [];
  const terrainChunks = () => props.rube ? Object.values(props.rube.terrain) : [];
  const images = () => props.rube ? Object.values(props.rube.image) : [];
  const items = () => ([...objects(), ...terrainChunks(), ...images()]);

  const [localProps, resizeProps] = splitProps(props, ['selected', 'setSelected']);

  const iconMap: Record<EditorItem['type'], string> = {
    object: 'view_in_ar',
    terrain: 'terrain',
    image: 'wallpaper',
    sensor: 'border_clear',
  };

  return (
    <Pane {...resizeProps} title="Explorer" class="">

      <div class="scrollbar max-h-full">
        <For each={items()} fallback={<div>Empty</div>}>
          {(item) => (
            <div onClick={() => localProps.setSelected(item)} classList={{'bg-neutral-500': localProps.selected?.id === item.id}} class="relative flex cursor-pointer items-center justify-center px-2 py-1 text-[10px] text-white">
              <i class="material-icons mr-2 flex aspect-square h-6 items-center justify-center rounded-sm bg-neutral-400 p-[2px] text-xl text-black">{iconMap[item.type]}</i>
              <div class="grow overflow-hidden text-ellipsis text-nowrap">{item.getName()}</div>
            </div>
          )}
        </For>
      </div>

    </Pane>
  );
};

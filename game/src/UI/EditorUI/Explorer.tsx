import {Component, For} from 'solid-js';
import {editorItems, selected, setSelected} from '../../editor/items/ItemTracker';
import {EditorItem} from '../../physics/RUBE/RubeMetaLoader';
import {Pane, ResizeProps} from './Pane';

// type ItemExplorerProps = {editorItems: EditorItems ,selected: EditorItem | null, setSelected: (item: EditorItem) => void};
export const Explorer: Component<ResizeProps> = props => {

  const objects = () => editorItems() ? Object.values(editorItems().object) : [];
  const terrainChunks = () => editorItems() ? Object.values(editorItems().terrain) : [];
  const images = () => editorItems() ? Object.values(editorItems().image) : [];
  // TODO add ability to sort by name, type, etc
  const items = () => ([...objects(), ...terrainChunks(), ...images()].sort((a, b) => a.getName().localeCompare(b.getName())));

  const iconMap: Record<EditorItem['type'], string> = {
    object: 'view_in_ar',
    terrain: 'terrain',
    image: 'wallpaper',
    sensor: 'border_clear',
  };

  return (
    <Pane {...props} title="Explorer" class="">

      <div class="scrollbar max-h-full">
        <For each={items()} fallback={<div>Empty</div>}>
          {(item) => (
            <div onClick={() => setSelected(item)} classList={{'bg-neutral-500': selected()?.id === item.id}} class="relative flex cursor-pointer items-center justify-center px-2 py-1 text-[10px] text-white">
              <i class="material-icons mr-2 flex aspect-square h-6 items-center justify-center rounded-sm bg-neutral-400 p-[2px] text-xl text-black">{iconMap[item.type]}</i>
              <div class="grow overflow-hidden text-ellipsis text-nowrap">{item.getName()}</div>
            </div>
          )}
        </For>
      </div>

    </Pane>
  );
};

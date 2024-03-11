import {Component, For, createEffect, createMemo} from 'solid-js';
import {EditorItem} from '../../physics/RUBE/RubeMetaLoader';
import {Pane, ResizeProps} from './Pane';
import {editorItems, selected, setSelected} from './globalSignals';

// type ItemExplorerProps = {editorItems: EditorItems ,selected: EditorItem | null, setSelected: (item: EditorItem) => void};
export const Explorer: Component<ResizeProps> = props => {
  let listRef: HTMLDivElement;

  const objects = () => editorItems() ? Object.values(editorItems().object) : [];
  const terrainChunks = () => editorItems() ? Object.values(editorItems().terrain) : [];
  const images = () => editorItems() ? Object.values(editorItems().image) : [];
  // TODO add ability to sort by name, type, etc
  const items = createMemo(() => ([...objects(), ...terrainChunks(), ...images()].sort((a, b) => a.getName().localeCompare(b.getName()))));

  createEffect(() => {
    const item = selected();
    if (item && listRef) listRef.querySelector(`[data-itemid="${item?.id}"]`)?.scrollIntoView({block: 'nearest', inline: 'nearest'});
  });

  const iconMap: Record<EditorItem['type'], string> = {
    object: 'view_in_ar',
    terrain: 'terrain',
    image: 'wallpaper',
    sensor: 'border_clear',
    // fixture: 'NOT_DIRECTLY_DISPLAYED_IN_UI',
  };

  return (
    <Pane {...props} title="Explorer" class="">

      <div class="scrollbar max-h-full" ref={el => listRef = el}>
        <For each={items()} fallback={<div>Empty</div>}>
          {(item) => (
            <div data-itemid={item.id} onClick={() => setSelected(item)} classList={{'bg-neutral-500': selected()?.id === item.id}} class="relative flex cursor-pointer items-center justify-center px-2 py-1 text-[10px] text-white">
              <i class="material-icons mr-2 flex aspect-square h-6 items-center justify-center rounded-sm bg-neutral-400 p-[2px] text-xl text-black">{iconMap[item.type]}</i>
              <div class="grow overflow-hidden text-ellipsis text-nowrap">{item.getName()}</div>
            </div>
          )}
        </For>
      </div>

    </Pane>
  );
};

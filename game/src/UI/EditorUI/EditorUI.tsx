import {Component, createSignal} from 'solid-js';
import {GameInfo} from '../../GameInfo';
import {EditorItem} from '../../physics/RUBE/RubeMetaLoader';
import {Actionbar} from './Actionbar';
import {Browser} from './Browser';
import {Canvas} from './Canvas';
import {Explorer} from './Explorer';
import {ItemProperties} from './ItemProperties';

export const EditorUI: Component = () => {
  const [selected, setSelected] = createSignal<EditorItem | null>(null);

  const select = (item: EditorItem) => {
    setSelected(item);
    GameInfo.observer.emit('item_selected', item, true);
  };
  const onUpdateSelected = (updated: EditorItem) => {
    setSelected(updated);
    // TODO trigger update of rube scene
  };

  return <>
    <div class={'text-white text-lg absolute top-0 bottom-0 left-0 right-0 overflow-hidden grid gap-2 grid-cols-[repeat(32,1fr)] grid-rows-[repeat(20,1fr)] p-2'} id="editor-ui">
      <Actionbar colStart={1} rowStart={1} colEnd={33} rowEnd={2} />
      <Explorer colStart={28} rowStart={2} colEnd={33} rowEnd={10} selected={selected()} setSelected={select} />
      <ItemProperties colStart={28} rowStart={10} colEnd={33} rowEnd={21} selected={selected()} updateSelected={onUpdateSelected} />
      <Canvas colStart={1} rowStart={2} colEnd={28} rowEnd={16} />
      <Browser colStart={1} rowStart={16} colEnd={28} rowEnd={21} />
    </div>
  </>;
};

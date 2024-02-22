import {Component, createSignal} from 'solid-js';
import {EditorInfo} from '../../EditorInfo';
import {EditorItem} from '../../physics/RUBE/RubeMetaLoader';
import {Actionbar} from './Actionbar';
import {Browser} from './Browser';
import {Canvas} from './Canvas';
import {Details} from './Details';
import {Explorer} from './Explorer';

export const EditorUI: Component = () => {
  const [selected, setSelected] = createSignal<EditorItem | null>(null);

  const select = (item: EditorItem) => {
    setSelected(item);
    EditorInfo.observer.emit('item_selected', item, true);
  };
  const onUpdateSelected = (updated: EditorItem) => {
    setSelected(updated);
    // TODO trigger update of rube scene
  };

  return <>
    <Actionbar />
    <div class={'text-white text-lg absolute top-[80px] bottom-0 left-0 right-0 overflow-hidden grid gap-2.5 p-2.5 grid-cols-[repeat(32,1fr)] grid-rows-[repeat(25,1fr)] bg-stone-950'} id="editor-ui">
      <Explorer colStart={27} rowStart={1} colEnd={33} rowEnd={13} selected={selected()} setSelected={select} />
      <Details colStart={27} rowStart={13} colEnd={33} rowEnd={26} selected={selected()} updateSelected={onUpdateSelected} />
      <Canvas colStart={1} rowStart={1} colEnd={27} rowEnd={19} />
      <Browser colStart={1} rowStart={19} colEnd={27} rowEnd={26} />
    </div>
  </>;
};

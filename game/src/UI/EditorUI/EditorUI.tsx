import {Component, createSignal} from 'solid-js';
import {EditorInfo} from '../../EditorInfo';
import {EDITOR_ITEM_SELECTED, RUBE_FILE_LOADED} from '../../eventTypes';
import {EditorItem, EditorItems} from '../../physics/RUBE/RubeMetaLoader';
import {Actionbar} from './Actionbar';
import {Browser} from './Browser';
import {Canvas} from './Canvas';
import {Details} from './Details';
import {Explorer} from './Explorer';

export const EditorUI: Component = () => {
  const [rube, setRube] = createSignal<EditorItems | null>(null);
  const [selected, setSelected] = createSignal<EditorItem | null>(null);

  EditorInfo.observer.on(RUBE_FILE_LOADED, (items: EditorItems) => setRube(items));

  const select = (item: EditorItem) => {
    setSelected(item);
    EditorInfo.observer.emit(EDITOR_ITEM_SELECTED, item, true);
  };
  const onUpdateSelected = (updated: EditorItem) => {
    setSelected(updated);
    // TODO trigger update of rube scene
  };

  return <>
    <Actionbar />
    <div class={'absolute inset-x-0 bottom-0 top-[80px] grid grid-cols-[repeat(32,1fr)] grid-rows-[repeat(25,1fr)] gap-2.5 overflow-hidden bg-stone-950 p-2.5 text-lg text-white'} id="editor-ui">
      <Explorer colStart={27} rowStart={1} colEnd={33} rowEnd={13} selected={selected()} setSelected={select} rube={rube()} />
      <Details colStart={27} rowStart={13} colEnd={33} rowEnd={26} selected={selected()} updateSelected={onUpdateSelected} />
      <Canvas colStart={1} rowStart={1} colEnd={27} rowEnd={19} />
      <Browser colStart={1} rowStart={19} colEnd={27} rowEnd={26} />
    </div>
  </>;
};

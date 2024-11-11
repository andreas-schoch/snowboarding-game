import {Component, createEffect, Show} from 'solid-js';
import {Dynamic, Portal} from 'solid-js/web';
import {ppm} from '../..';
import {EditorInfo} from '../../EditorInfo';
import {Actionbar} from './Actionbar';
import {Browser} from './Browser';
import {Canvas} from './Canvas';
import {Details} from './Details';
import {Explorer} from './Explorer';
import {activeDialog, selected, setActiveDialogName} from './globalSignals';

const EditorUI: Component = () => {

  createEffect(() => {
    const item = selected();
    if (item) {
      const position = item.getPosition();
      EditorInfo.camera.pan(position.x * ppm, position.y * ppm, 300, 'Power2', true);
    }
  });

  return <>
    <Actionbar />
    <div class={'absolute inset-x-0 bottom-0 top-[80px] grid grid-cols-[repeat(32,1fr)] grid-rows-[repeat(25,1fr)] gap-2.5 overflow-hidden bg-stone-950 p-2.5 text-lg text-white'} id="editor-ui">
      <Explorer colStart={27} rowStart={1} colEnd={33} rowEnd={13} />
      <Details colStart={27} rowStart={13} colEnd={33} rowEnd={26} />
      <Canvas colStart={1} rowStart={1} colEnd={27} rowEnd={19} />
      <Browser colStart={1} rowStart={19} colEnd={27} rowEnd={26} />
    </div>

    <Portal>
      <Show when={activeDialog() !== null}>
        <div class="absolute inset-0 z-[3000] bg-stone-950 opacity-75" onClick={() => setActiveDialogName(null)} />
        <div class="absolute left-1/2 top-1/2 z-[3001] min-h-[400px] min-w-[300px] translate-x-[-50%] translate-y-[-50%] rounded-lg border border-stone-600 bg-stone-800">
          <Dynamic component={activeDialog()!} />
        </div>
      </Show>
    </Portal>
  </>;
};

// eslint-disable-next-line import/no-default-export
export default EditorUI;

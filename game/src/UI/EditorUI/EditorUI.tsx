import {Component, createEffect} from 'solid-js';
import {ppm} from '../..';
import {EditorInfo} from '../../EditorInfo';
import {selected} from '../../editor/items/ItemTracker';
import {Actionbar} from './Actionbar';
import {Browser} from './Browser';
import {Canvas} from './Canvas';
import {Details} from './Details';
import {Explorer} from './Explorer';

export const EditorUI: Component = () => {

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
  </>;
};

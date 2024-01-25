import {ParentComponent, Show} from 'solid-js';
import {ButtonBorderless} from './general/Button';
import {PanelId} from '.';

export const BasePanel: ParentComponent<{id: string, title: string, scroll: boolean, backBtn: boolean, setPanel: (id: PanelId) => void}> = props => (
  <div id={props.id} class={'bg-neutral-800 border-neutral-500 w-[700px] absolute -translate-x-1/2 -translate-y-1/2 text-[8px] text-neutral-500 max-w-[100vw] max-h-screen m-0 pt-12 pb-4 px-4 rounded-md border-[3px] border-solid left-2/4 top-2/4'}>
    <div class="text-white text-xl leading-6 bg-blue-900 absolute -translate-x-1/2 mx-auto my-0 px-2 py-1 rounded border-[3px] border-black left-1/2 -top-5">
      {props.title}
    </div>

    <div class={`${props.scroll ? 'scrollbar' : ''}`}>{props.children}</div>

    <Show when={props.backBtn}>
      <div class="flex items-center justify-center">
        <ButtonBorderless class="col col-6" onClick={() => props.setPanel('panel-pause-menu')}>
          <i class="material-icons mr-2">chevron_left</i>
          <span>Back to menu</span>
        </ButtonBorderless>
      </div>
    </Show>
  </div>
);

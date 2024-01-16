import {ParentComponent, Show} from 'solid-js';
import {PanelId} from '.';

export const BasePanel: ParentComponent<{id: string, title: string, scroll: boolean, backBtn: boolean, setPanel: (id: PanelId) => void}> = props => (
  <div id={props.id} class={'bg-[var(--panel-background)] border-[color:var(--panel-border-color)] w-[700px] absolute -translate-x-2/4 -translate-y-2/4 text-[8px] text-[color:var(--panel-text-color)] max-w-[100vw] max-h-screen m-0 pt-12 pb-4 px-4 rounded-md border-[3px] border-solid left-2/4 top-2/4'}>
    <div class="text-[white] text-xl leading-6 bg-[color:var(--blue-900)] absolute -translate-x-2/4 mx-auto my-0 px-2 py-1 rounded-[5px] border-[3px] border-solid border-[black] left-2/4 -top-5">
      {props.title}
    </div>

    <div class={`${props.scroll ? 'scrollbar' : ''}`}>{props.children}</div>

    <Show when={props.backBtn}>
      <div class="flex items-center justify-center">
        <button onClick={() => props.setPanel('panel-pause-menu')} class="btn btn-secondary" id="btn-goto-pause-menu">
          <i class="material-icons">chevron_left</i>
          <span>Back to menu</span>
        </button>
      </div>
    </Show>
  </div>
);

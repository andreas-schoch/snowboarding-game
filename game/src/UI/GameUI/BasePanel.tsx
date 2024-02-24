import {ParentComponent, Show} from 'solid-js';
import {ButtonBorderless} from '../general/Button';
import {PanelId} from './GameUI';

type BasePanelProps = {id: string, class?: string, title: string, backBtn: boolean, setPanel: (id: PanelId) => void};

export const BasePanel: ParentComponent<BasePanelProps> = props => <>
  <div id={props.id} class={'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 absolute z-[5001] m-0 max-h-screen w-[700px] max-w-[100vw] rounded-md border-2 border-stone-600 bg-stone-800 px-4 pb-14 pt-12 text-[8px] text-neutral-500 ' + (props.class || '')}>
    <div class="absolute -top-5 left-1/2 mx-auto my-0 -translate-x-1/2 rounded border-[3px] border-black bg-blue-900 px-2 py-1 text-xl leading-6 text-white">
      {props.title}
    </div>

    {props.children}

    <Show when={props.backBtn}>
      <div class="absolute bottom-1 left-1/2 flex translate-x-[-50%] items-center justify-center">
        <ButtonBorderless class="col col-6" onClick={() => props.setPanel('panel-pause-menu')}>
          <i class="material-icons mr-2">chevron_left</i>
          <span>Back to menu</span>
        </ButtonBorderless>
      </div>
    </Show>
  </div>

  <div class="absolute inset-0 z-[5000] bg-white opacity-15" />
</>;

import './BasePanel.css';
import {ParentComponent, Show} from 'solid-js';
import {PanelId} from '.';

export const BasePanel: ParentComponent<{id: string, title: string, scroll: boolean, backBtn: boolean, setPanel: (id: PanelId) => void}> = props => (
  <div class="panel" id={ props.id}>
    <div class="panel-title">{props.title}</div>

    <div class={props.scroll ? 'scrollbar' : ''}>{props.children}</div>

    <Show when={props.backBtn}>
      <div class="row last">
        <div class="col col-12 flex-center">
          <button class="btn btn-secondary" id="btn-goto-pause-menu" onClick={() => props.setPanel('panel-pause-menu')}>
            <i class="material-icons">chevron_left</i>
            <span>Back to menu</span>
          </button>
        </div>
      </div>
    </Show>

  </div>
);

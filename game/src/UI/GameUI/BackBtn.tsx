import {Component} from 'solid-js';
import {ButtonBorderless} from '../general/Button';
import {PanelId} from './GameUI';

export const BackToMenuBtn: Component<{setPanel: (id: PanelId) => void}> = props => <>
  <div class="flex h-12 items-center justify-center">
    <ButtonBorderless class="col col-6" onClick={() => props.setPanel('panel-pause-menu')}>
      <i class="material-icons mr-2">chevron_left</i>
      <span>Back to menu</span>
    </ButtonBorderless>
  </div>
</>;

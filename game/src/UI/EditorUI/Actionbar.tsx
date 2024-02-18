import {Component} from 'solid-js';
import {ButtonIcon} from '../general/Button';
import {Pane, ResizeProps} from './Pane';

export const Actionbar: Component<ResizeProps> = props => <>
  <Pane title="" class="!pt-1" {...props}>

    <div class="flex">
      <ButtonIcon icon='undo' />
      <ButtonIcon icon='redo' />
      <ButtonIcon icon='play_arrow' class="text-green-700 !text-4xl !mx-auto" />
      <ButtonIcon icon='cloud_upload' />

    </div>
  </Pane>
</>;

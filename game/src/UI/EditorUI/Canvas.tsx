import {Component, onCleanup, onMount} from 'solid-js';
import {rootGame} from '../..';
import {Pane, ResizeProps} from './Pane';

export const Canvas: Component<ResizeProps> = props => {
  let wrapperRef: HTMLDivElement;

  onMount(() => {
    // This may be a bit of a questionable way of moving the game canvas to a different parent
    // Need to ensure it cannot get accidentally removed from the DOM due to unwanted re-renders
    if (!rootGame) return;
    wrapperRef.innerHTML = '';
    wrapperRef.append(rootGame);
  });

  onCleanup(() => {
    if (!rootGame) return;
    document.body.appendChild(rootGame);
  });

  return <>
    <Pane title="" class="" {...props} >

      <div class="absolute inset-0 overflow-hidden rounded-md" ref={el => wrapperRef = el} />
    </Pane>
  </>;

};

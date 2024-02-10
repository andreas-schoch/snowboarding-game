import {ParentComponent} from 'solid-js';

export type PaneProps = {title: string, class?: string};
export const Pane: ParentComponent<PaneProps> = props => (
  <div class={'border-[3px] border-black rounded-md m-0 pt-8 pb-2 absolute text-[8px] text-white bg-neutral-700 ' + (props.class || '')} >
    <div class="text-white text-[12px] bg-blue-800 rounded-t-md px-1 absolute left-0 right-0 top-0 border-b-[3px] border-black">{props.title}</div>
    {props.children}
  </div>
);

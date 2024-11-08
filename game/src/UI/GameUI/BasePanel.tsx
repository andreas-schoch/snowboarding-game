import {ParentComponent} from 'solid-js';

type BasePanelProps = {id: string, class?: string, title: string};

export const BasePanel: ParentComponent<BasePanelProps> = props => <>
  <div id={props.id} class={'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 absolute z-[5001] m-0 max-h-[90vh] w-[700px] max-w-[100vw] rounded-md border-2 border-stone-600 bg-stone-800 px-4 pt-8 text-[8px] text-neutral-500 grid grid-rows-1 ' + (props.class || '')}>
    <div class="absolute -top-5 left-1/2 mx-auto my-0 w-80 -translate-x-1/2 rounded border-[3px] border-black bg-blue-900 px-2 py-1 text-center text-xl leading-6 text-white">{props.title}</div>
    {props.children}
  </div>
  <div class="absolute inset-0 z-[5000] bg-white opacity-15" />
</>;

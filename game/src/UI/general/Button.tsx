import {ParentComponent} from 'solid-js';

// TODO consider using tailwind-merge for extra styles
export const ButtonPrimary: ParentComponent<{type?: 'submit' | 'reset' | 'button', class?: string, onClick?: () => void}> = props => <>
  <button type={props.type} onClick={() => props.onClick && props.onClick()} class={'bg-blue-800 border-blue-800 text-white border rounded block h-10 px-4 text-sm outline-none cursor-pointer font-normal transition duration-200 hover:bg-blue-900 hover:border-blue-900 ' + (props.class || '')}>{props.children}</button>
</>;

export const ButtonBorderless: ParentComponent<{type?: 'submit' | 'reset' | 'button', class?: string, onClick?: () => void, ref?: (el: HTMLButtonElement) => void}> = props => <>
  <button ref={props.ref} type={props.type} onClick={() => props.onClick && props.onClick()} class={'flex items-center justify-center text-xs text-neutral-300 cursor-pointer border-transparent bg-transparent h-10 ' + (props.class || '')}>{props.children}</button>
</>;

export const ButtonSecondary: ParentComponent<{type?: 'submit' | 'reset' | 'button', class?: string, onClick?: () => void}> = props => <>
  <button type={props.type} onClick={() => props.onClick && props.onClick()} class={'border-neutral-400 text-neutral-300 border-2 rounded block h-10 px-4 text-sm outline-none cursor-pointer font-normal transition duration-200 hover:bg-neutral-600 ' + (props.class || '')}>{props.children}</button>
</>;

export const ButtonIcon: ParentComponent<{type?: 'submit' | 'reset' | 'button', class?: string, onClick?: () => void, icon: string}> = props => <>
  <button type={props.type} onClick={() => props.onClick && props.onClick()} class={'cursor-pointer w-[42px] h-[42px] flex rounded justify-center items-center m-2 hover:bg-stone-600 hover:border-stone-500 text-2xl ' + (props.class || '')}>
    <i class="material-icons btn-action">{props.icon}</i>
  </button>
</>;

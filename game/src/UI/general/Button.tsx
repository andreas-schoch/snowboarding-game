import {ParentComponent} from 'solid-js';

export const ButtonPrimary: ParentComponent<{type?: 'submit' | 'reset' | 'button', class?: string, onClick?: () => void}> = props => <>
  <button type={props.type} onClick={() => props.onClick && props.onClick()} class={'bg-blue-800 border-blue-800 text-white border rounded block h-10 px-4 text-base outline-none cursor-pointer font-normal transition duration-200 hover:bg-blue-900 hover:border-blue-900 ' + (props.class || '')}>{props.children}</button>
</>;

export const ButtonBorderless: ParentComponent<{type?: 'submit' | 'reset' | 'button', class: string, onClick?: () => void}> = props => <>
  <button type={props.type} onClick={() => props.onClick && props.onClick()} class={'flex items-center justify-center text-xs text-gray-300 cursor-pointer border-transparent bg-transparent h-10 ' + (props.class || '')}>{props.children}</button>
</>;

export const ButtonSecondary: ParentComponent<{type?: 'submit' | 'reset' | 'button', class?: string, onClick?: () => void}> = props => <>
  <button type={props.type} onClick={() => props.onClick && props.onClick()} class={'border-neutral-500 text-white border-2 rounded block h-10 px-4 text-base outline-none cursor-pointer font-normal transition duration-200 hover:bg-neutral-600 ' + (props.class || '')}>{props.children}</button>
</>;

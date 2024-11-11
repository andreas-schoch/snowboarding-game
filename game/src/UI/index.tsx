import './base.css';
import './index.css';
import './kobalte/Menubar.css';
import './kobalte/Tabs.css';
import './kobalte/Pagination.css';
import './kobalte/Checkbox.css';
import {render} from 'solid-js/web';
import {UnsupportedBrowserNotice} from './UnsupportedBrowserNotice';

export const initGameUI = (rootId: string) => {
  import('./GameUI/GameUI').then(({default: GameUI}) => {
    const root = document.getElementById(rootId);
    if (!root) throw new Error('Root ui element not found');
    root.innerHTML = '';
    render(() => <>
      <GameUI />
      <UnsupportedBrowserNotice />
    </>, root);
    return root;
  });
};

export const initEditorUI = (rootId: string) => {
  import('./EditorUI/EditorUI').then(({default: EditorUI}) => {
    const root = document.getElementById(rootId);
    if (!root) throw new Error('Root ui element not found');
    root.innerHTML = '';
    render(() => <>
      <EditorUI />
      <UnsupportedBrowserNotice />
    </>, root);
    return root;
  });
};

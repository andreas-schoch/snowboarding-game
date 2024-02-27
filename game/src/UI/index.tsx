import './base.css';
import './index.css';
import './kobalte/Menubar.css';
import {Match, Switch} from 'solid-js';
import {render} from 'solid-js/web';
import {Settings} from '../Settings';
import {EditorUI} from './EditorUI/EditorUI';
import {GameUI} from './GameUI/GameUI';
import {UnsupportedBrowserNotice} from './UnsupportedBrowserNotice';

const SolidUI = () => {
  const editorOpen = Settings.editorOpen();

  return <>
    <Switch>
      <Match when={editorOpen}><EditorUI /></Match>
      <Match when={!editorOpen}><GameUI /></Match>
    </Switch>

    <UnsupportedBrowserNotice />
  </>;

};

export const initSolidUI = (rootId: string) => {
  const root = document.getElementById(rootId);
  if (!root) throw new Error('Root ui element not found');
  root.innerHTML = '';
  // document.body.classList.add(Settings.darkmodeEnabled() ? 'darkmode' : 'ligghtmode');
  render(() => <SolidUI />, root);
  return root;
};

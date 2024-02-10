import './base.css';
import './index.css';
import {createSignal, Match, Switch} from 'solid-js';
import {render} from 'solid-js/web';
import {game, SCENE_EDITOR} from '..';
import {GameInfo} from '../GameInfo';
import {EDITOR_OPEN} from '../eventTypes';
import {EditorUI} from './EditorUI/EditorUI';
import {GameUI} from './GameUI/GameUI';
import {UnsupportedBrowserNotice} from './UnsupportedBrowserNotice';

const SolidUI = () => {
  const [editorOpen, setEditorOpen] = createSignal(game.scene.isActive(SCENE_EDITOR));

  GameInfo.observer.on(EDITOR_OPEN, () => setEditorOpen(true));

  return (
    <div class="block! text-white text-lg absolute top-0 bottom-0 left-0 right-0 overflow-hidden">

      <Switch>
        <Match when={editorOpen()}><EditorUI /></Match>
        <Match when={!editorOpen()}><GameUI /></Match>
      </Switch>

      <UnsupportedBrowserNotice />
    </div>
  );
};

export const initSolidUI = (rootId: string) => {
  const root = document.getElementById(rootId);
  if (!root) throw new Error('Root ui element not found');
  root.innerHTML = '';
  // document.body.classList.add(Settings.darkmodeEnabled() ? 'darkmode' : 'ligghtmode');
  render(() => <SolidUI />, root);
  return root;
};

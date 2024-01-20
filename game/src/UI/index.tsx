import './base.css';
import './index.css';
import {createSignal, Match, Switch} from 'solid-js';
import {render} from 'solid-js/web';
import {GameInfo} from '../GameInfo';
import {Settings} from '../Settings';
import {ENTER_CRASHED, LEVEL_FINISH, TOGGLE_PAUSE} from '../eventTypes';
import {IScore} from '../pocketbase/types';
import {HUD} from './HUD';
import {PanelCredits} from './PanelCredits';
import {PanelHowToPlay} from './PanelHowToPlay';
import {PanelLeaderboards} from './PanelLeaderboards';
import {PanelPauseMenu} from './PanelPauseMenu';
import {PanelSelectLevel} from './PanelSelectLevel';
import {PanelSettings} from './PanelSettings';
import {PanelYourScore} from './PanelYourScore';
import {UnsupportedBrowserNotice} from './UnsupportedBrowserNotice';

const SolidUI = () => {
  const [panel, setPanel] = createSignal<PanelId>('none');
  const [score, setScore] = createSignal<IScore>(GameInfo.score);

  const handleShowYourScore = (score: IScore, timeout: number) => {
    setScore(score);
    setTimeout(() => setPanel('panel-your-score'), timeout);
  };

  GameInfo.observer.on(TOGGLE_PAUSE, (paused: boolean, activePanel: PanelId) => setPanel(paused ? activePanel : 'none'));
  GameInfo.observer.on(LEVEL_FINISH, (score: IScore) => handleShowYourScore(score, 2000));
  GameInfo.observer.on(ENTER_CRASHED, (score: IScore) => handleShowYourScore(score, 750));

  return (
    <div class="block! text-white text-lg absolute top-0 bottom-0 left-0 right-0">
      <Switch fallback={<HUD setPanel={setPanel} />}>
        <Match when={panel() === 'panel-pause-menu'}><PanelPauseMenu setPanel={setPanel} /></Match>
        <Match when={panel() === 'panel-select-level'}><PanelSelectLevel setPanel={setPanel} /></Match>
        <Match when={panel() === 'panel-leaderboards'}><PanelLeaderboards setPanel={setPanel} /></Match>
        <Match when={panel() === 'panel-how-to-play'}><PanelHowToPlay setPanel={setPanel} /></Match>
        <Match when={panel() === 'panel-settings'}><PanelSettings setPanel={setPanel} /></Match>
        <Match when={panel() === 'panel-credits'}><PanelCredits setPanel={setPanel} /></Match>
        <Match when={panel() === 'panel-your-score'}><PanelYourScore score={score()} setPanel={setPanel} /></Match>
      </Switch>

      <UnsupportedBrowserNotice />
    </div>
  );
};

export const initSolidUI = (rootId: string) => {
  const root = document.getElementById(rootId);
  if (!root) throw new Error('Root ui element not found');
  root.innerHTML = '';
  document.body.classList.add(Settings.darkmodeEnabled() ? 'darkmode' : 'ligghtmode');
  render(() => <SolidUI />, root);
  return root;
};

export type PanelId = 'panel-pause-menu' | 'panel-select-level' | 'panel-leaderboards' | 'panel-how-to-play' | 'panel-settings' | 'panel-credits' | 'panel-your-score' | 'none';

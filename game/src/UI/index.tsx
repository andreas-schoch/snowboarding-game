import './base.css';
import './index.css';
import { Match, Switch, render } from 'solid-js/web';
import { HUD } from './HUD';
import { UnsupportedBrowserNotice } from './UnsupportedBrowserNotice';
import { PanelPauseMenu } from './PanelPauseMenu';
import { PanelSelectLevel } from './PanelSelectLevel';
import { PanelLeaderboards } from './PanelLeaderboards';
import { PanelHowToPlay } from './PanelHowToPlay';
import { PanelSettings } from './PanelSettings';
import { PanelCredits } from './PanelCredits';
import { PanelYourScore } from './PanelYourScore';
import { createSignal } from 'solid-js';
import { GameInfo } from '../GameInfo';
import { ENTER_CRASHED, LEVEL_FINISH, TOGGLE_PAUSE } from '../eventTypes';
import { IScore } from '../State';
import { Settings } from '../Settings';

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
    <div id="game-ui" style="display: none;">
      <HUD />

      <Switch fallback={<HUD />}>
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

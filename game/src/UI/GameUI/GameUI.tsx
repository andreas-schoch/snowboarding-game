import {Component, createSignal, Match, Switch} from 'solid-js';
import {GameInfo} from '../../GameInfo';
import {ENTER_CRASHED, LEVEL_FINISH, TOGGLE_PAUSE} from '../../eventTypes';
import {IScore, IScoreNew} from '../../pocketbase/types';
import {HUD} from './HUD';
import {PanelCredits} from './PanelCredits';
import {PanelHowToPlay} from './PanelHowToPlay';
import {PanelLeaderboards} from './PanelLeaderboards';
import {PanelPauseMenu} from './PanelPauseMenu';
import {PanelSelectLevel} from './PanelSelectLevel';
import {PanelSettings} from './PanelSettings';
import {PanelYourScore} from './PanelYourScore';

export const GameUI: Component = () => {
  const [panel, setPanel] = createSignal<PanelId>('none');
  const [score, setScore] = createSignal<IScoreNew>(GameInfo.score);

  // const [selectedItems, setSelectedItems] = createSignal();

  const handleShowYourScore = (score: IScore, timeout: number) => {
    setScore(score);
    setTimeout(() => setPanel('panel-your-score'), timeout);
  };

  GameInfo.observer.on(TOGGLE_PAUSE, (paused: boolean, activePanel: PanelId) => setPanel(paused ? activePanel : 'none'));
  GameInfo.observer.on(LEVEL_FINISH, (score: IScore) => handleShowYourScore(score, 2000));
  GameInfo.observer.on(ENTER_CRASHED, (score: IScore) => handleShowYourScore(score, 750));

  return (
    <div class="block! text-white text-lg absolute top-0 bottom-0 left-0 right-0 overflow-hidden">

      <HUD panel={panel()} setPanel={setPanel} />

      <Switch>
        <Match when={panel() === 'panel-pause-menu'}><PanelPauseMenu setPanel={setPanel} /></Match>
        <Match when={panel() === 'panel-select-level'}><PanelSelectLevel setPanel={setPanel} /></Match>
        <Match when={panel() === 'panel-leaderboards'}><PanelLeaderboards setPanel={setPanel} /></Match>
        <Match when={panel() === 'panel-how-to-play'}><PanelHowToPlay setPanel={setPanel} /></Match>
        <Match when={panel() === 'panel-settings'}><PanelSettings setPanel={setPanel} /></Match>
        <Match when={panel() === 'panel-credits'}><PanelCredits setPanel={setPanel} /></Match>
        <Match when={panel() === 'panel-your-score'}><PanelYourScore score={score()} setPanel={setPanel} /></Match>
      </Switch>

    </div>
  );
};

export type PanelId = 'panel-pause-menu' | 'panel-select-level' | 'panel-leaderboards' | 'panel-how-to-play' | 'panel-settings' | 'panel-credits' | 'panel-your-score' | 'none';
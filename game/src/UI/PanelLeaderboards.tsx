import './PanelLeaderboards.css';
import {Component, For, Show, createSignal, onMount} from 'solid-js';
import {leaderboardService} from '..';
import {Settings} from '../Settings';
import {IScore} from '../character/State';
import {calculateTotalScore} from '../helpers/calculateTotalScore';
import {BasePanel} from './BasePanel';
import {PanelId} from '.';

export const PanelLeaderboards: Component<{setPanel: (id: PanelId) => void}> = props => {
  const [scores, setScores] = createSignal<IScore[]>([]);

  onMount(async () => {
    const fbScores: IScore[] = leaderboardService.auth
      ? await leaderboardService.rexLeaderboard.loadFirstPage()
      : Settings.localScores()[Settings.currentLevel()].map(s => ({...s, userName: Settings.username()}));

    fbScores.sort((a, b) => calculateTotalScore(b) - calculateTotalScore(a));
    setScores(fbScores);
  });

  return (
    <BasePanel id='panel-leaderboards' title='Leaderboards' scroll={false} backBtn={true} setPanel={props.setPanel} >

      <Show when={!leaderboardService.auth?.currentUser}>
        <div class="row">
          <div class="col col-12 text-sm leading-normal text-[color:var(--grey-700)]">
            Current version of the game doesn't have the online leaderboards enabled. You will only see your own past
            high-scores below.
          </div>
        </div>
      </Show>

      <div class="row text-sm">
        <span class="col col-2 bolder leaderboard">#</span>
        <span class="col col-7 bolder leaderboard">Name</span>
        <span class="col col-3 bolder leaderboard flex-right">Score</span>
      </div>

      <div class="leaderboard-scrollable scrollbar" id="leaderboard-item-container">
        <For each={scores()} fallback={<div>Loading...</div>}>
          {(item, index) => (
            <div class="row text-sm pr-2">
              <span class="col col-2" id="leaderboard-item-rank">{index() + 1}</span>
              <span class={(leaderboardService.auth?.currentUser?.uid === item.userID ? 'your-own-score ' : '') + 'col col-7 overflow-hidden text-ellipsis'}>{item.userName}</span>
              <span class="col col-3 flex-right" id="leaderboard-item-score">{calculateTotalScore(item)}</span>
            </div>
          )}
        </For>
      </div>
    </BasePanel>
  );
};

import {Component, createSignal, onMount} from 'solid-js';
import {pb} from '../..';
import {GameInfo} from '../../GameInfo';
import {PersistedStore} from '../../PersistedStore';
import {RESTART_GAME} from '../../eventTypes';
import {pseudoRandomId} from '../../helpers/pseudoRandomId';
import {IScoreNew} from '../../pocketbase/types';
import {ButtonBorderless, ButtonPrimary} from '../general/Button';
import {BasePanel} from './BasePanel';
import {PanelId} from './GameUI';

export const PanelYourScore: Component<{setPanel: (id: PanelId) => void, score: IScoreNew}> = props => {
  let submitScoreForm: HTMLElement;
  let usernameInput: HTMLInputElement;
  const [yourRank, setYourRank] = createSignal(-1);
  const [totalRanks, setTotalRanks] = createSignal(-1);

  const rankText = () => {
    const rank = yourRank();
    if (rank > 0) return `You are ranked ${rank}/${totalRanks()} on this level!`;
    else return 'You do not have a rank yet. Please submit a score first.';
  };

  onMount(async () => {
    const loggedInUser = pb.auth.loggedInUser();

    if (!loggedInUser) {
      // When leaderboard is disabled;
      if (!PersistedStore.username()) {
        usernameInput.value = `Player_${pseudoRandomId()}`;
        usernameInput.setAttribute('value', usernameInput.value); // to make floating label move up
      } else {
        submitScoreForm?.classList.add('hidden');
        await pb.leaderboard.submit(props.score);
      }
      return;
    }

    // Everything below is expected to work only when leaderboards are enabled
    const note: HTMLElement | null = document.querySelector('.submit-score-offline-info');
    note && note.classList.add('hidden');
    if (loggedInUser.username && loggedInUser.usernameChanged) {
      // Score is submitted automatically for users that submitted a score once before from this device and browser.
      submitScoreForm?.classList.add('hidden');
      await pb.leaderboard.submit(props.score);
      refreshRank();
    }
  });

  const refreshRank = async () => {
    // FIXME I need a better way to figure out the rank of the current user. It is not sustainable to potentially load all scores just to find it.
    // Unless we limit the scores per level to less than e.g. 200 and if it is lower than lowest, player remains unranked
    const loggedInUser = pb.auth.loggedInUser();
    if (!loggedInUser) return;
    const scores = await pb.leaderboard.scoresFromLogs(PersistedStore.currentLevel(), 1, 200);
    const yourRank = scores.findIndex(s => s.user === loggedInUser.id);
    setYourRank(yourRank + 1);
    setTotalRanks(scores.length);
  };

  const handleInitialSubmit = async () => {
    const name = usernameInput?.value;
    if (!name || !props.score || !submitScoreForm) return;

    if (pb.auth.loggedInUser()) {
      console.debug('updating default username');
      await pb.user.updateUsername(name);
    }

    // Settings.set('userName', usernameInput.value);
    await pb.leaderboard.submit(props.score);
    submitScoreForm.classList.add('hidden');
    refreshRank();
  };

  return (
    <BasePanel id='panel-your-score' title='Your Score' backBtn={false} setPanel={props.setPanel} class="!pb-4">

      <TrickScoreSummary score={props.score} />

      <div class="row my-16 text-sm leading-4 text-stone-400">
        <span class="col col-12 text-center">{rankText()}</span>
      </div>

      {/* <!--  SUBMIT SCORE --> */}
      <div class="" ref={el => submitScoreForm = el}>
        <div class="row mt-8 border-t-2 border-solid border-t-stone-500 pt-6 text-[10px] leading-normal text-gray-600"><span class="col col-12">You haven't submitted a score yet.
          Please choose your name.
          The next time you finish a level, this will happen automatically.</span></div>
        {/* <div class="row text-[10px] leading-normal text-gray-700"><span class="col col-12">This version of the game has online
          leaderboards disabled. Keep in mind that your scores are only saved locally for now.</span></div> */}
        <div class="row" id="your-score-name-form">
          <div class="col col-8">
            <div class="form-group">
              <input id="username" class="form-text-input text-gray-500" name="username" value="" type="text" autofocus
                // @ts-expect-error oldschool hack for floating label
                // eslint-disable-next-line solid/event-handlers
                autocomplete="off" onkeyup="this.setAttribute('value', this.value)" ref={el => usernameInput = el} />
              <label for="username" class="floating-label">Your name</label>
            </div>
          </div>
          <ButtonPrimary class="col col-4" onClick={() => handleInitialSubmit()}>Submit Score</ButtonPrimary>
        </div>
      </div>
      {/* <!-- BACK / REPLAY --> */}
      <div class="row mb-0">
        <div class="col col-12">
          <ButtonBorderless class="col col-6" onClick={() => props.setPanel('panel-select-level')}>
            <i class="material-icons mr-2">chevron_left</i>
            <span>Select Level</span>
          </ButtonBorderless>
          <ButtonBorderless class="col col-6" onClick={() => GameInfo.observer.emit(RESTART_GAME)}>
            <i class="material-icons mr-2">replay</i>
            <span>Replay Level</span>
          </ButtonBorderless>
        </div>
      </div>
    </BasePanel>
  );
};

function TrickScoreSummary(props: {score: IScoreNew}) {

  return <>
    <div class="row text-sm leading-4 text-stone-400">
      <span class="col col-8 text-left">Coins</span>
      <span class="col col-4 text-right">{props.score.pointsCoin}</span>
    </div>

    <div class="row text-sm leading-4 text-stone-400">
      <span class="col col-8 text-left">Tricks</span>
      <span class="col col-4 text-right">{props.score.pointsTrick}</span>
    </div>

    <div class="row text-sm leading-4 text-stone-400">
      <span class="col col-8 text-left">
        <span>Combos</span>
        <span class="text-[10px]"> (Best Combo: <span>{props.score.pointsComboBest}</span>)</span>
      </span>
      <span class="col col-4 text-right">{props.score.pointsCombo}</span>
    </div>

    <div class="row bolder mt-8 text-2xl text-white">
      <span class="col col-8">Total</span>
      <span class="col col-4 text-right">{props.score.pointsTotal}</span>
    </div>
  </>;
}

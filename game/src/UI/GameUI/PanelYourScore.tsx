import {Component, createSignal, onMount, Show} from 'solid-js';
import {pb} from '../..';
import {GameInfo} from '../../GameInfo';
import {PersistedStore} from '../../PersistedStore';
import {RESTART_GAME} from '../../eventTypes';
import {pseudoRandomId} from '../../helpers/pseudoRandomId';
import {IRank, IScoreNew} from '../../pocketbase/types';
import {ButtonBorderless, ButtonPrimary} from '../general/Button';
import {BasePanel} from './BasePanel';
import {PanelId} from './GameUI';

export const PanelYourScore: Component<{setPanel: (id: PanelId) => void, score: IScoreNew}> = props => {
  let submitScoreForm: HTMLElement;
  let usernameInput: HTMLInputElement;
  const [yourRank, setYourRank] = createSignal<IRank | null | undefined>();
  const [totalRanks, setTotalRanks] = createSignal(-1);
  const [isNewPersonalBest, setIsNewPersonalBest] = createSignal(false);

  const rankText = () => {
    const rank = yourRank();
    const loggedInUser = pb.auth.loggedInUser();
    if (!loggedInUser?.usernameChanged) return 'Choose a name and submit to see your rank.';
    if (rank === undefined) return 'Loading rank...';
    if (rank === null) return 'You do not have a rank yet. Please submit a score first.';
    return `You are ranked ${rank.rank}/${totalRanks()} on this level!`;
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
        const [_, wasUpdated] = await pb.leaderboard.submit(props.score);
        setIsNewPersonalBest(wasUpdated);
      }
      return;
    }

    // Everything below is expected to work only when leaderboards are enabled
    const note: HTMLElement | null = document.querySelector('.submit-score-offline-info');
    note && note.classList.add('hidden');
    if (loggedInUser.username && loggedInUser.usernameChanged) {
      // Score is submitted automatically for users that submitted a score once before from this device and browser.
      submitScoreForm?.classList.add('hidden');
      const [_, wasUpdated] = await pb.leaderboard.submit(props.score);
      setIsNewPersonalBest(wasUpdated);
      refreshRank();
    }
  });

  const refreshRank = async () => {
    const loggedInUser = pb.auth.loggedInUser();
    if (!loggedInUser) return;

    Promise.all([
      pb.leaderboard.getOwnRank(PersistedStore.currentLevel()),
      pb.leaderboard.getTotalRanks(PersistedStore.currentLevel())
    ]).then(([rank, total]) => {
      setYourRank(rank);
      setTotalRanks(total);
    });
  };

  const handleInitialSubmit = async () => {
    const name = usernameInput?.value;
    if (!name || !props.score || !submitScoreForm) return;

    if (pb.auth.loggedInUser()) {
      console.debug('updating default username');
      await pb.user.updateUsername(name);
    }

    const [_, wasUpdated] = await pb.leaderboard.submit(props.score);
    setIsNewPersonalBest(wasUpdated);
    submitScoreForm.classList.add('hidden');
    refreshRank();
  };

  return (
    <BasePanel id='panel-your-score' title='Your Score' class="!pb-0 !pr-2">

      <div class="scrollbar pr-2">

        <TrickScoreSummary score={props.score} />

        <Show when={isNewPersonalBest()}>
          <div class="-mt-4 text-right text-blue-600">New Personal Best!</div>
        </Show>

        <div class="row mb-16 mt-12 text-sm leading-4 text-stone-400">
          <span class="col col-12 text-center">{rankText()}</span>
        </div>

        {/* <!--  SUBMIT SCORE --> */}
        <div class="" ref={el => submitScoreForm = el}>
          <div class="row mt-8 border-t-2 border-solid border-t-stone-500 pt-6 text-[10px] leading-normal text-gray-600"><span class="col col-12">You haven't submitted a score yet.
          Please choose your name.
          The next time you finish a level, this will happen automatically.</span></div>
          <div class="row" id="your-score-name-form">
            <div class="col col-8 !pl-2">
              <div class="form-group">
                <input maxLength={20} id="username" class="form-text-input text-gray-500" name="username" value="" type="text" autofocus
                // @ts-expect-error oldschool hack for floating label
                // eslint-disable-next-line solid/event-handlers
                  autocomplete="off" onkeyup="this.setAttribute('value', this.value)" ref={el => usernameInput = el} />
                <label for="username" class="floating-label">Your name</label>
              </div>
            </div>
            <ButtonPrimary class="col col-4 mr-2" onClick={() => handleInitialSubmit()}>Submit Score</ButtonPrimary>
          </div>
        </div>
      </div>

      {/* <!-- BACK / REPLAY --> */}
      <div class="grid h-12 grid-cols-2">
        <ButtonBorderless class="" onClick={() => props.setPanel('panel-select-level')}>
          <i class="material-icons mr-2">chevron_left</i>
          <span>Select Level</span>
        </ButtonBorderless>
        <ButtonBorderless class="" onClick={() => GameInfo.observer.emit(RESTART_GAME)}>
          <i class="material-icons mr-2">replay</i>
          <span>Replay Level</span>
        </ButtonBorderless>
      </div>
    </BasePanel>
  );
};

function TrickScoreSummary(props: {score: IScoreNew}) {
  return (
    <div class="grid h-[175px] grid-rows-[1fr_1fr_1fr_2fr] items-center px-2">
      <div class="grid grid-cols-[8fr_4fr] text-sm leading-4 text-stone-400">
        <span class="text-left">Coins</span>
        <span class="text-right">{props.score.pointsCoin}</span>
      </div>

      <div class="grid grid-cols-[8fr_4fr] text-sm leading-4 text-stone-400">
        <span class="text-left">Tricks</span>
        <span class="text-right">{props.score.pointsTrick}</span>
      </div>

      <div class="grid grid-cols-[8fr_4fr] text-sm leading-4 text-stone-400">
        <span class="text-left">
          <span>Combos</span>
          <span class="text-[10px]"> (Best: <span>{props.score.pointsComboBest}</span>)</span>
        </span>
        <span class="text-right">{props.score.pointsCombo}</span>
      </div>

      <div class="bolder grid grid-cols-[8fr_4fr] text-2xl text-white">
        <span class="">Total</span>
        <span class="text-right">{props.score.pointsTotal}</span>
      </div>
    </div>
  );
}

import './PanelYourScore.css';
import {Component, createSignal, onMount} from 'solid-js';
import {pb} from '..';
import {GameInfo} from '../GameInfo';
import {Settings} from '../Settings';
import {RESTART_GAME} from '../eventTypes';
import {pseudoRandomId} from '../helpers/pseudoRandomId';
import {IScoreNew} from '../pocketbase/types';
import {BasePanel} from './BasePanel';
import {ButtonPrimary, ButtonBorderless} from './general/Button';
import {PanelId} from '.';

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
      if (!Settings.username()) {
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
    const scores = await pb.leaderboard.scores(Settings.currentLevel(), 1, 200);
    const yourRank = scores.findIndex(s => s.user === loggedInUser.id);
    setYourRank(yourRank + 1);
    setTotalRanks(scores.length);
  };

  const handleInitialSubmit = async () => {
    const name = usernameInput?.value;
    if (!name || !props.score || !submitScoreForm) return;

    if (pb.auth.loggedInUser()) {
      console.log('updating default username');
      await pb.user.updateUsername(name);
    }

    // Settings.set('userName', usernameInput.value);
    await pb.leaderboard.submit(props.score);
    submitScoreForm.classList.add('hidden');
    refreshRank();
  };

  return (
    <BasePanel id='panel-your-score' title='Your Score' scroll={false} backBtn={false} setPanel={props.setPanel}>

      <TrickScoreSummary score={props.score} />

      <div class="row summary summary-rank">
        <span class="col col-12">{rankText()}</span>
      </div>

      {/* <!--  SUBMIT SCORE --> */}
      <div class="submit-score" ref={el => submitScoreForm = el}>
        <div class="row submit-score-info"><span class="col col-12">You haven't submitted a score yet.
          Please choose your name.
          The next time you finish a level, this will happen automatically.</span></div>
        <div class="row submit-score-offline-info"><span class="col col-12">This version of the game has online
          leaderboards disabled. Keep in mind that your scores are only saved locally for now.</span></div>
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
      <div class="row play-again">
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
    <div class="row summary summary-presents">
      <span class="col col-8">Coins</span>
      <span class="col col-4" id="your-score-coins">{props.score.pointsCoin}</span>
    </div>

    <div class="row summary summary-trick">
      <span class="col col-8">Tricks</span>
      <span class="col col-4" id="your-score-trick-score">{props.score.pointsTrick}</span>
    </div>

    <div class="row summary summary-trick">
      <span class="col col-8">
        <span>Combos</span>
        <span class="summary-trick-combo"> (Best Combo: <span id="your-score-best-combo">{props.score.pointsComboBest}</span>)</span>
      </span>
      <span class="col col-4" id="your-score-trick-score">{props.score.pointsCombo}</span>
    </div>

    <div class="row summary summary-total">
      <span class="col col-8">Total</span>
      <span class="col col-4" id="your-score-total">{props.score.pointsTotal}</span>
    </div>
  </>;
}

// function RaceScoreSummary(props: {score: IScore}) {
//   const raceSummary = createMemo(() => getRaceScoreSummary(props.score));
//   const distance = () => raceSummary().distance.toFixed(1) + ' m';
//   const avgSpeed = () => raceSummary().avgSpeed.toFixed(1) + ' km/h';
//   const time = () => formatTime(raceSummary().time);

//   return (
//     <>
//       <div class="row summary summary-distance">
//         <span class="col col-6">Distance</span>
//         <span class="col col-6" id="your-score-distance">{distance()}</span>
//       </div>

//       <div class="row summary summary-avg-speed">
//         <span class="col col-6">Average Speed</span>
//         <span class="col col-6" id="your-score-avg-speed">{avgSpeed()}</span>
//       </div>

//       <div class="row summary summary-time summary-total">
//         <span class="col col-6">Time</span>
//         <span class="col col-6" id="your-score-time">{time()}</span>
//       </div>

//       <div class="row summary summary-avg-speed">
//         {/* <span class="col col-6">Average Speed</span> */}
//         <span class="col col-12" id="your-score-avg-speed">{avgSpeed()}</span>
//       </div>
//     </>
//   );
// }

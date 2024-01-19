import './PanelYourScore.css';
import {Component, createSignal, onMount} from 'solid-js';
import {LEVEL_SUCCESS_BONUS_POINTS, POINTS_PER_COIN, pb} from '..';
import {GameInfo} from '../GameInfo';
import {Settings} from '../Settings';
import {RESTART_GAME} from '../eventTypes';
import {calculateBestCombo, calculateTotalScore, calculateTrickScore} from '../helpers/calculateTotalScore';
import {pseudoRandomId} from '../helpers/pseudoRandomId';
import {IScore} from '../pocketbaseService/types';
import {BasePanel} from './BasePanel';
import {PanelId} from '.';

export const PanelYourScore: Component<{setPanel: (id: PanelId) => void, score: IScore}> = props => {
  let submitScoreForm: HTMLElement;
  let usernameInput: HTMLInputElement;
  const [yourRank, setYourRank] = createSignal(-1);
  const [totalRanks, setTotalRanks] = createSignal(-1);
  const bestCombo = () => calculateBestCombo(props.score);
  const trickScore = () => calculateTrickScore(props.score);
  const totalScore = () => calculateTotalScore(props.score);

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
        // Settings.set('userName', usernameInput.value);
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
    const loggedInUser = pb.auth.loggedInUser();
    if (!loggedInUser) return;
    const fbScores = await pb.leaderboard.scores(Settings.currentLevel(), 1, 200);
    const scores: IScore[] = fbScores.map(s => ({...s, total: calculateTotalScore(s)})).sort((a, b) => Number(b.total) - Number(a.total));
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

      {/* <!--SCORE SUMMARY--> */}
      <div class="row summary summary-distance">
        <span class="col col-8">Distance travelled</span>
        <span class="col col-4" id="your-score-distance">{props.score.distance}</span>
      </div>
      <div class="row summary summary-presents">
        <span class="col col-8">Presents collected</span>
        <span class="col col-4" id="your-score-coins">{props.score.coins}x{POINTS_PER_COIN}</span>
      </div>
      <div class="row summary summary-trick">
        <span class="col col-8">
          <span>Trick score</span>
          <span class="summary-trick-combo">(Best Combo: <span id="your-score-best-combo">{bestCombo()}</span>)</span>
        </span>
        <span class="col col-4" id="your-score-trick-score">{trickScore()}</span>
      </div>
      <div class="row summary summary-bonus">
        <span class="col col-8">Bonus points</span>
        <span class="col col-4" id="your-score-bonus">{props.score.finishedLevel ? LEVEL_SUCCESS_BONUS_POINTS : 0}</span>
      </div>
      <div class="row summary summary-total">
        <span class="col col-8">Total</span>
        <span class="col col-4" id="your-score-total">{totalScore()}</span>
      </div>

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
          <button class="col col-4 btn btn-primary" id="btn-score-submit" onClick={() => handleInitialSubmit()}>Submit Score</button>
        </div>
      </div>
      {/* <!-- BACK / REPLAY --> */}
      <div class="row play-again">
        <div class="col col-12">
          <button class="col col-6 btn btn-secondary" id="btn-goto-select-level" onClick={() => props.setPanel('panel-select-level')}>
            <i class="material-icons">chevron_left</i>
            <span>Select Level</span>
          </button>
          <button class="col col-6 btn btn-secondary" id="btn-play-again" onClick={() => GameInfo.observer.emit(RESTART_GAME)}>
            <i class="material-icons">replay</i>
            <span>Replay Level</span>
          </button>
        </div>
      </div>
    </BasePanel>
  );
};

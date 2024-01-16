import './PanelYourScore.css';
import {Component, createSignal, onMount} from 'solid-js';
import {LEVEL_SUCCESS_BONUS_POINTS, POINTS_PER_COIN, leaderboardService} from '..';
import {GameInfo} from '../GameInfo';
import {Settings} from '../Settings';
import {IScore} from '../State';
import {RESTART_GAME} from '../eventTypes';
import {calculateBestCombo, calculateTotalScore, calculateTrickScore} from '../util/calculateTotalScore';
import {pseudoRandomId} from '../util/pseudoRandomId';
import {BasePanel} from './BasePanel';
import {PanelId} from '.';

export const PanelYourScore: Component<{ setPanel: (id: PanelId) => void, score: IScore }> = props => {
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
    const currentUser = leaderboardService.auth?.currentUser;

    if (!currentUser) {
      // When leaderboard is disabled;
      if (!Settings.username()) {
        usernameInput.value = `Player_${pseudoRandomId()}`;
        usernameInput.setAttribute('value', usernameInput.value); // to make floating label move up
        Settings.set('userName', usernameInput.value);
      } else {
        submitScoreForm?.classList.add('hidden');
        await leaderboardService.submit(props.score);
      }
      return;
    }

    // Everything below is expected to work only when leaderboards are enabled
    const note: HTMLElement | null = document.querySelector('.submit-score-offline-info');
    note && note.classList.add('hidden');
    if (currentUser.displayName) {
      // Score is submitted automatically for users that submitted a score once before from this device and browser.
      submitScoreForm?.classList.add('hidden');
      leaderboardService.rexLeaderboard.setUser({userID: currentUser.uid, userName: currentUser.displayName});
      await leaderboardService.submit(props.score);
      refreshRank();
    }
  });

  const refreshRank = async () => {
    const currentUser = leaderboardService.auth?.currentUser;
    if (!currentUser) return;
    const fbScores = await leaderboardService.rexLeaderboard.loadFirstPage();
    // Cannot trust plain value total on firebase nor the rank nor the order atm
    // const yourRank = await leaderboardService.rexLeaderboard.getRank(currentUser.uid);
    const scores: IScore[] = fbScores.map(s => ({...s, total: calculateTotalScore(s as IScore, false)} as IScore)).sort((a, b) => Number(b.total) - Number(a.total));
    const yourRank = scores.findIndex(s => s.userID === currentUser.uid);
    setYourRank(yourRank + 1);
    setTotalRanks(scores.length);
  };

  const handleInitialSubmit = async () => {
    const name = usernameInput?.value;
    if (name && props.score && submitScoreForm) {
      if (leaderboardService.auth?.currentUser) {
        leaderboardService.rexLeaderboard.setUser({userID: leaderboardService.auth.currentUser.uid, userName: usernameInput.value});
        await leaderboardService.auth.currentUser.updateProfile({displayName: usernameInput.value});
      }
      Settings.set('userName', usernameInput.value);
      await leaderboardService.submit(props.score);
      submitScoreForm.classList.add('hidden');
      refreshRank();
    }
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
              <input id="username" class="form-text-input" name="username" value="" type="text" autofocus
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

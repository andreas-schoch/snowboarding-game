import './PanelYourScore.css';

export const PanelYourScore = () => (
  <>
    <div class="panel hidden" id="panel-your-score">
      <div class="panel-title">Your Score</div>
      {/* <!--SCORE SUMMARY--> */}
      <div class="row summary summary-distance">
        <span class="col col-8">Distance travelled</span>
        <span class="col col-4" id="your-score-distance">1150m</span>
      </div>
      <div class="row summary summary-presents">
        <span class="col col-8">Presents collected</span>
        <span class="col col-4" id="your-score-coins">87x100</span>
      </div>
      <div class="row summary summary-trick">
        <span class="col col-8">
          <span>Trick score</span>
          <span class="summary-trick-combo">(Best Combo: <span id="your-score-best-combo">3200</span>)</span>
        </span>
        <span class="col col-4" id="your-score-trick-score">3400</span>
      </div>
      <div class="row summary summary-bonus">
        <span class="col col-8">Bonus points</span>
        <span class="col col-4" id="your-score-bonus">0</span>
      </div>
      <div class="row summary summary-total">
        <span class="col col-8">Total</span>
        <span class="col col-4" id="your-score-total">6570</span>
      </div>

      <div class="row summary summary-rank">
        <span class="col col-12">You are ranked <span id="your-score-rank-value">-/-</span> in the leaderboards on this
          level!</span>
      </div>

      {/* <!--  SUBMIT SCORE --> */}
      <div class="submit-score">
        <div class="row submit-score-info"><span class="col col-12">You haven't submitted a score to the leaderboards yet.
          Please choose your name.
          The next time you finish a level, your score will be submitted automatically.</span></div>
        <div class="row submit-score-offline-info"><span class="col col-12">This version of the game has online
          leaderboards disabled. Keep in mind that your scores are only saved locally for now.</span></div>
        <div class="row" id="your-score-name-form">
          <div class="col col-8">
            <div class="form-group">
              <input id="username" class="form-text-input" name="username" value="" type="text" autofocus
                // @ts-ignore
                autocomplete="off" onkeyup="this.setAttribute('value', this.value)" />
              <label for="username" class="floating-label">Your name</label>
            </div>
          </div>
          <button class="col col-4 btn btn-primary" id="btn-score-submit">Submit Score</button>
        </div>
      </div>
      {/* <!-- BACK / REPLAY --> */}
      <div class="row play-again">
        <div class="col col-12">
          <button class="col col-6 btn btn-secondary" id="btn-goto-select-level">
            <i class="material-icons">chevron_left</i>
            <span>Select Level</span>
          </button>
          <button class="col col-6 btn btn-secondary" id="btn-play-again">
            <i class="material-icons">replay</i>
            <span>Replay Level</span>
          </button>
        </div>
      </div>
    </div>
  </>
);

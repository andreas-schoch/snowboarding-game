import './PanelLeaderboards.css';

export const PanelLeaderboards = () => (
  <>
    <div class="panel hidden" id="panel-leaderboards">
      <div class="panel-title">Leaderboards</div>
      <div class="row">
        <div class="col col-12 leaderboard-note">
          Current version of the game doesn't have the online leaderboards enabled. You will only see your own past
          high-scores below.
        </div>
      </div>
      <div class="row leaderboard-header">
        <span class="col col-2 bolder leaderboard">#</span>
        <span class="col col-7 bolder leaderboard">Name</span>
        <span class="col col-3 bolder leaderboard flex-right">Score</span>
      </div>

      {/* <!-- Will be filled in programmatically using the above template --> */}
      <div class="leaderboard-scrollable scrollbar" id="leaderboard-item-container">
        <template id="leaderboard-item-template">
          <div class="row leaderboard-item">
            <span class="col col-2" id="leaderboard-item-rank">1</span>
            <span class="col col-7" id="leaderboard-item-username">AndiOver9000</span>
            <span class="col col-3 flex-right" id="leaderboard-item-score">9001</span>
          </div>
        </template>
      </div>

      {/* <!-- BACK--> */}
      <div class="row last">
        <div class="col col-12 flex-center">
          <button class="btn btn-secondary" id="btn-goto-pause-menu">
            <i class="material-icons">chevron_left</i>
            <span>Back to menu</span>
          </button>
        </div>
      </div>
    </div>
  </>
);

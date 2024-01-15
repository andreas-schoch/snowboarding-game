export const PanelPauseMenu = () => (
  <>
    <i class="material-icons hidden" id="pause-game-icon">pause_circle_outline</i>
    <i class="material-icons hidden" id="how-to-play-icon">help_outline</i>

    <div class="panel hidden" id="panel-pause-menu">
      <div class="panel-title">Pause Menu</div>
      <div class="row">
        <button class="col col-12 btn btn-primary" id="btn-resume-game">Resume Level</button>
      </div>
      <div class="row">
        <button class="col col-12 btn btn-default" id="btn-goto-select-level">Select Level</button>
      </div>
      <div class="row" style="margin-bottom: 4rem;">
        <button class="col col-12 btn btn-default" id="btn-goto-leaderboards">Leaderboard</button>
      </div>
      <div class="row">
        <button class="col col-12 btn btn-default" id="btn-goto-how-to-play">How To Play?</button>
      </div>
      <div class="row">
        <button class="col col-12 btn btn-default" id="btn-goto-settings">Settings</button>
      </div>
      <div class="row">
        <button class="col col-12 btn btn-default" id="btn-goto-credits">Credits</button>
      </div>
    </div>
  </>
);

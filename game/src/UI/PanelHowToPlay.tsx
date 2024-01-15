import './PanelHowToPlay.css';

export const PanelHowToPlay = () => (
  <>
    <div class="panel hidden" id="panel-how-to-play">
      <div class="panel-title">How to play</div>
      <div class="scrollbar">
        <span class="row how-to-play-title"><span class="col col-12">Keyboard controls</span></span>
        <span class="row">
          <span class="col col-4 flex-center control-img">
            <img class="img-center" src="assets/img/controls/Arrow_Up_Key_Light.png" alt="keyboard arrow up key" />
          </span>
          <span class="col col-8 control-text">Jump (press longer for higher jump)</span>
        </span>
        <span class="row">
          <span class="col col-4 flex-center control-img">
            <img src="assets/img/controls/Arrow_Left_Key_Light.png" alt="keyboard arrow left key" />
            <img src="assets/img/controls/Arrow_Right_Key_Light.png" alt="keyboard arrow right key" />
          </span>
          <span class="col col-8 control-text">Balance and perform tricks (frontflip, backflip)</span>
        </span>
        <span class="row">
          <span class="col col-4 flex-center control-img">
            <img class="img-center" src="assets/img/controls/Arrow_Down_Key_Light.png" alt="keyboard arrow down key" />
          </span>
          <span class="col col-8 control-text">Center yourself</span>
        </span>
        <span class="row">
          <span class="col col-4 flex-center control-img">
            <img src="assets/img/controls/Space_Key_Light.png" alt="keyboard space key" />
            <img src="assets/img/controls/Esc_Key_Light.png" alt="keyboard escape key" />
          </span>
          <span class="col col-8 control-text">toggle pause</span>
        </span>
        <span class="row how-to-play-title"><span class="col col-12">Touchscreen controls</span></span>
        <span class="row"><span class="col col-12">(work-in-progress)</span></span>
        <span class="row how-to-play-title"><span class="col col-12">Combo System</span></span>

        <span class="col col-4 flex-center control-img">
          <img class="combo-counter" src="assets/img/controls/combo_counter.png" alt="Combo counter UI" />
        </span>
        <span class="row game-premise"><span class="col col-12">After each trick (backflip, frontflip) you have a few
          seconds to perform the next one to gain extra points.
          The combo counter will eventually run out if you stay on the ground for too long. If you crash, the combo
          points are lost.
          The points are only applied once the counter runs out or you reach the finish line.

          Keeping the combo counter up is the key to high scores!
        </span></span>
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

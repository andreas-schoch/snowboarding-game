export const PanelSelectLevel = () => (
  <>
    <div class="panel hidden" id="panel-select-level">
      <div class="panel-title">Select Level</div>

      <div class="select-level-scrollable scrollbar" id="level-item-container">

        <template id="level-item-template">
          <div class="level-item">
            <span class="level-item-overlay" id="level_001"></span>
            <div class="level-item-number">Level 001</div>
            <div class="level-item-name">Santas Backyard</div>
            <div class="level-item-thumbnail"
              style="background-image: url('assets/img/thumbnails/level_001_santas_backyard.png')"></div>
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

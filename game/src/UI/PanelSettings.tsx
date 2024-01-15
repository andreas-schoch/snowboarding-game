import './PanelSettings.css';

export const PanelSettings = () => (
  <>
    <div class="panel hidden" id="panel-settings">
      <div class="panel-title">Settings</div>
      <form action="#" name="settings-form" id="settings-form">
        {/* <!-- RESOLUTION --> */}
        <div class="row">
          <span class="col col-3 settings-name">Resolution</span>
          <span class="col col-9 settings-resolution-radios">
            <label>
              <input class="with-gap" name="resolution" type="radio" value="0.5" />
              <span>640x360</span>
            </label>
            <label>
              <input class="with-gap" name="resolution" type="radio" value="0.75" />
              <span>960x540</span>
            </label>
            <label>
              <input class="with-gap" name="resolution" type="radio" value="1" checked />
              <span>1280x720</span>
            </label>
          </span>
        </div>
        {/* <!-- VOLUME MUSIC --> */}
        <div class="row">
          <span class="col col-3 settings-name">Volume Music</span>
          <span class="col col-9">
            <div class="range-field">
              <input type="range" id="volumeMusic" name="volumeMusic" min="0" max="100" value="80" aria-label="Music volume" />
            </div>
          </span>
        </div>
        {/* <!-- VOLUME SFX --> */}
        <div class="row">
          <span class="col col-3 settings-name">Volume SFX</span>
          <span class="col col-9">
            <div class="range-field">
              <input type="range" id="volumeSfx" name="volumeSfx" min="0" max="100" value="80" aria-label="SFX volume" />
            </div>
          </span>
        </div>
        {/* <!-- DARK MODE --> */}
        <div class="row">
          <span class="col col-3 settings-name">Darkmode</span>
          <span class="col col-9 settings-darkmode-enabled">
            <div class="switch">
              <label>
                <input type="checkbox" name="darkmodeEnabled" aria-label="darkmode toggle" />
                <span class="lever"></span>
              </label>
            </div>
          </span>
        </div>
        {/* <!-- SAVE SETTINGS --> */}
        <div class="row">
          <div class="col col-12 flex-center">
            <button type="submit" class="btn btn-primary btn-save-settings" id="btn-save-settings">Save Settings</button>
          </div>
        </div>
      </form>
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

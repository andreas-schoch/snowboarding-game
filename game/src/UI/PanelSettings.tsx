import './PanelSettings.css';
import {Component, onMount} from 'solid-js';
import {Settings} from '../Settings';
import {BasePanel} from './BasePanel';
import {ButtonPrimary} from './general/Button';
import {PanelId} from '.';

export const PanelSettings: Component<{setPanel: (id: PanelId) => void}> = props => {
  let submitForm: HTMLFormElement;

  onMount(() => {
    const radios = Array.from(document.querySelectorAll<HTMLInputElement>('#settings-form input[name="resolution"]'));
    if (!radios.length) throw new Error('resolution radio inputs not found');
    for (const radio of radios) if (Number(radio.value) === Settings.resolutionScale()) radio.checked = true;
  });

  const handleSaveSettings = (evt: SubmitEvent) => {
    evt.preventDefault();
    Settings.set('resolution', submitForm.resolution.value || '1');
    Settings.set('volumeMusic', submitForm.volumeMusic.value);
    Settings.set('volumeSfx', submitForm.volumeSfx.value);
    Settings.set('darkmodeEnabled', String(submitForm.darkmodeEnabled.checked));
    location.reload();
  };

  return (
    <BasePanel id='panel-settings' title='Settings' scroll={false} backBtn={true} setPanel={props.setPanel}>

      <form name="settings-form" id="settings-form"class="leading-4" ref={el => submitForm = el} onSubmit={evt => handleSaveSettings(evt)}>
        {/* <!-- RESOLUTION --> */}
        <div class="row">
          <span class="col col-3 settings-name">Resolution</span>
          <span class="col col-9 flex justify-between">
            <label>
              <input class="with-gap" name="resolution" type="radio" value="0.5" />
              <span class="text-neutral-300">640x360</span>
            </label>
            <label>
              <input class="with-gap" name="resolution" type="radio" value="0.75" />
              <span class="text-neutral-300">960x540</span>
            </label>
            <label>
              <input class="with-gap" name="resolution" type="radio" value="1" checked />
              <span class="text-neutral-300">1280x720</span>
            </label>
          </span>
        </div>
        {/* <!-- VOLUME MUSIC --> */}
        <div class="row">
          <span class="col col-3 settings-name">Volume Music</span>
          <span class="col col-9">
            <div class="range-field">
              <input type="range" id="volumeMusic" name="volumeMusic" min="0" max="100" value={Settings.volumeMusic()} aria-label="Music volume" />
            </div>
          </span>
        </div>
        {/* <!-- VOLUME SFX --> */}
        <div class="row">
          <span class="col col-3 settings-name">Volume SFX</span>
          <span class="col col-9">
            <div class="range-field">
              <input type="range" id="volumeSfx" name="volumeSfx" min="0" max="100" value={Settings.volumeSfx()} aria-label="SFX volume" />
            </div>
          </span>
        </div>
        {/* <!-- DARK MODE --> */}
        <div class="row">
          <span class="col col-3 settings-name">Darkmode</span>
          <span class="col col-9 settings-darkmode-enabled">
            <div class="switch">
              <label>
                <input type="checkbox" name="darkmodeEnabled" aria-label="darkmode toggle" checked={Settings.darkmodeEnabled()} />
                <span class="lever" />
              </label>
            </div>
          </span>
        </div>
        {/* <!-- SAVE SETTINGS --> */}
        <div class="row">
          <div class="col col-12 flex-center">
            <ButtonPrimary type='submit'>Save Settings</ButtonPrimary>
          </div>
        </div>
      </form>
    </BasePanel>
  );
};

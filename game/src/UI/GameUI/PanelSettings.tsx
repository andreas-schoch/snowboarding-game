import {Component, onMount} from 'solid-js';
import {PersistedStore} from '../../PersistedStore';
import {ButtonPrimary} from '../general/Button';
import {BasePanel} from './BasePanel';
import {PanelId} from './GameUI';

export const PanelSettings: Component<{setPanel: (id: PanelId) => void}> = props => {
  let submitForm: HTMLFormElement;

  onMount(() => {
    const radios = Array.from(document.querySelectorAll<HTMLInputElement>('#settings-form input[name="resolution"]'));
    if (!radios.length) throw new Error('resolution radio inputs not found');
    for (const radio of radios) if (Number(radio.value) === PersistedStore.resolutionScale()) radio.checked = true;
  });

  const handleSaveSettings = (evt: SubmitEvent) => {
    evt.preventDefault();
    PersistedStore.set('resolution', submitForm.resolution.value || '1');
    PersistedStore.set('volumeMusic', submitForm.volumeMusic.value);
    PersistedStore.set('volumeSfx', submitForm.volumeSfx.value);
    PersistedStore.set('darkmodeEnabled', String(submitForm.darkmodeEnabled.checked));
    PersistedStore.set('fps', String(submitForm.fpsCounter.checked));
    PersistedStore.set('betaFeaturesEnabled', String(submitForm.betaFeaturesEnabled.checked));
    location.reload();
  };

  return (
    <BasePanel id='panel-settings' title='Settings' backBtn={true} setPanel={props.setPanel} class="!w-[600px] !text-[10px]">

      <form name="settings-form" id="settings-form"class="mb-[-10px] leading-4" ref={el => submitForm = el} onSubmit={evt => handleSaveSettings(evt)}>
        {/* <!-- RESOLUTION --> */}
        <div class="row">
          <span class="col col-3">Resolution</span>
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
          <span class="col col-3">Volume Music</span>
          <span class="col col-9">
            <div class="range-field">
              <input type="range" id="volumeMusic" name="volumeMusic" min="0" max="100" value={PersistedStore.volumeMusic()} aria-label="Music volume" />
            </div>
          </span>
        </div>
        {/* <!-- VOLUME SFX --> */}
        <div class="row">
          <span class="col col-3">Volume SFX</span>
          <span class="col col-9">
            <div class="range-field">
              <input type="range" id="volumeSfx" name="volumeSfx" min="0" max="100" value={PersistedStore.volumeSfx()} aria-label="SFX volume" />
            </div>
          </span>
        </div>
        {/* <!-- DARK MODE --> */}
        <div class="row">
          <span class="col col-3">Darkmode</span>
          <span class="col col-9">
            <div class="switch">
              <label>
                <input type="checkbox" name="darkmodeEnabled" aria-label="darkmode toggle" checked={PersistedStore.darkmodeEnabled()} />
                <span class="lever" />
              </label>
            </div>
          </span>
        </div>
        {/* <!-- FPS Display --> */}
        <div class="row">
          <span class="col col-3">Show FPS</span>
          <span class="col col-9">
            <div class="switch">
              <label>
                <input type="checkbox" name="fpsCounter" aria-label="show fps toggle" checked={PersistedStore.fps()} />
                <span class="lever" />
              </label>
            </div>
          </span>
        </div>
        {/* <!-- BETA FEATURES --> */}
        <div class="row">
          <span class="col col-3">Beta Features</span>
          <span class="col col-9">
            <div class="switch">
              <label>
                <input type="checkbox" name="betaFeaturesEnabled" aria-label="enable beta features" checked={PersistedStore.betaFeaturesEnabled()} />
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

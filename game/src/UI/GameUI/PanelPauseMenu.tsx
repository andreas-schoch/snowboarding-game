import './PanelPauseMenu.css';
import {Component, Show} from 'solid-js';
import {GameInfo} from '../../GameInfo';
import {Settings} from '../../Settings';
import {EDITOR_OPEN, RESUME_GAME} from '../../eventTypes';
import {ButtonPrimary, ButtonSecondary} from '../general/Button';
import {BasePanel} from './BasePanel';
import {PanelId} from './GameUI';

export const PanelPauseMenu: Component<{setPanel: (id: PanelId) => void}> = props => {
  const handleResumeGame = () => {
    props.setPanel('none');
    GameInfo.observer.emit(RESUME_GAME);
  };

  const handleOpenEditor = () => {
    props.setPanel('none');
    GameInfo.observer.emit(EDITOR_OPEN);
  };

  return <>
    <BasePanel id='panel-pause-menu' title='Pause Menu' scroll={false} backBtn={false} setPanel={props.setPanel}>

      <div class="row">
        <ButtonPrimary class="col col-12" onClick={() => handleResumeGame()}>Resume Level</ButtonPrimary>
      </div>
      <div class="row">
        <ButtonSecondary class="col col-12" onClick={() => props.setPanel('panel-select-level')}>Select Level</ButtonSecondary>
      </div>
      <Show when={Settings.betaFeaturesEnabled()}>
        <div class="row">
          <ButtonSecondary class="col col-12" onClick={() => handleOpenEditor()}>Level Editor</ButtonSecondary>
        </div>
      </Show>
      <div class="row mb-[4rem]">
        <ButtonSecondary class="col col-12" onClick={() => props.setPanel('panel-leaderboards')}>Leaderboard</ButtonSecondary>
      </div>
      <div class="row">
        <ButtonSecondary class="col col-12" onClick={() => props.setPanel('panel-how-to-play')}>How To Play?</ButtonSecondary>
      </div>
      <div class="row">
        <ButtonSecondary class="col col-12" onClick={() => props.setPanel('panel-settings')}>Settings</ButtonSecondary>
      </div>
      <div class="row">
        <ButtonSecondary class="col col-12" onClick={() => props.setPanel('panel-credits')}>Credits</ButtonSecondary>
      </div>

    </BasePanel>
  </>;
};

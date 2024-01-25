import './PanelPauseMenu.css';
import {Component} from 'solid-js';
import {GameInfo} from '../GameInfo';
import {RESUME_GAME} from '../eventTypes';
import {BasePanel} from './BasePanel';
import {ButtonPrimary, ButtonSecondary} from './general/Button';
import {PanelId} from '.';

export const PanelPauseMenu: Component<{setPanel: (id: PanelId) => void}> = props => {
  const handleResumeGame = () => {
    props.setPanel('none');
    GameInfo.observer.emit(RESUME_GAME);
  };

  return <>
    <BasePanel id='panel-pause-menu' title='Pause Menu' scroll={false} backBtn={false} setPanel={props.setPanel}>

      <div class="row">
        <ButtonPrimary class="col col-12" onClick={() => handleResumeGame()}>Resume Level</ButtonPrimary>
      </div>
      <div class="row">
        <ButtonSecondary class="col col-12" onClick={() => props.setPanel('panel-select-level')}>Select Level</ButtonSecondary>
      </div>
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

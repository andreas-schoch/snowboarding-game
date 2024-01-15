import './PanelPauseMenu.css';
import { Component } from 'solid-js';
import { BasePanel } from './BasePanel';
import { GameInfo } from '../GameInfo';
import { RESUME_GAME } from '../eventTypes';
import { PanelId } from '.';

export const PanelPauseMenu: Component<{ setPanel: (id: PanelId) => void }> = props => {
  const handleResumeGame = () => {
    props.setPanel('none');
    GameInfo.observer.emit(RESUME_GAME);
  };

  return (
    <>
      <i class="material-icons hidden" id="pause-game-icon">pause_circle_outline</i>
      <i class="material-icons hidden" id="how-to-play-icon">help_outline</i>

      <BasePanel id='panel-pause-menu' title='Pause Menu' scroll={false} backBtn={false} setPanel={props.setPanel}>

        <div class="row">
          <button class="col col-12 btn btn-primary" id="btn-resume-game" onclick={() => handleResumeGame()}>Resume Level</button>
        </div>
        <div class="row">
          <button class="col col-12 btn btn-default" id="btn-goto-select-level" onclick={() => props.setPanel('panel-select-level')}>Select Level</button>
        </div>
        <div class="row" style="margin-bottom: 4rem;">
          <button class="col col-12 btn btn-default" id="btn-goto-leaderboards" onclick={() => props.setPanel('panel-leaderboards')}>Leaderboard</button>
        </div>
        <div class="row">
          <button class="col col-12 btn btn-default" id="btn-goto-how-to-play" onclick={() => props.setPanel('panel-how-to-play')}>How To Play?</button>
        </div>
        <div class="row">
          <button class="col col-12 btn btn-default" id="btn-goto-settings" onclick={() => props.setPanel('panel-settings')}>Settings</button>
        </div>
        <div class="row">
          <button class="col col-12 btn btn-default" id="btn-goto-credits" onclick={() => props.setPanel('panel-credits')}>Credits</button>
        </div>

      </BasePanel>
    </>
  );
};

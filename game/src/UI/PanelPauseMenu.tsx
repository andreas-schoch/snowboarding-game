import './PanelPauseMenu.css';
import {Component} from 'solid-js';
import {GameInfo} from '../GameInfo';
import {RESUME_GAME} from '../eventTypes';
import {BasePanel} from './BasePanel';
import {PanelId} from '.';

export const PanelPauseMenu: Component<{setPanel: (id: PanelId) => void}> = props => {
  const handleResumeGame = () => {
    props.setPanel('none');
    GameInfo.observer.emit(RESUME_GAME);
  };

  return (
    <>
      <BasePanel id='panel-pause-menu' title='Pause Menu' scroll={false} backBtn={false} setPanel={props.setPanel}>

        <div class="row">
          <button class="col col-12 btn btn-primary" id="btn-resume-game" onClick={() => handleResumeGame()}>Resume Level</button>
        </div>
        <div class="row">
          <button class="col col-12 btn btn-default" id="btn-goto-select-level" onClick={() => props.setPanel('panel-select-level')}>Select Level</button>
        </div>
        <div class="row" style={{'margin-bottom':'4rem'}}>
          <button class="col col-12 btn btn-default" id="btn-goto-leaderboards" onClick={() => props.setPanel('panel-leaderboards')}>Leaderboard</button>
        </div>
        <div class="row">
          <button class="col col-12 btn btn-default" id="btn-goto-how-to-play" onClick={() => props.setPanel('panel-how-to-play')}>How To Play?</button>
        </div>
        <div class="row">
          <button class="col col-12 btn btn-default" id="btn-goto-settings" onClick={() => props.setPanel('panel-settings')}>Settings</button>
        </div>
        <div class="row">
          <button class="col col-12 btn btn-default" id="btn-goto-credits" onClick={() => props.setPanel('panel-credits')}>Credits</button>
        </div>

      </BasePanel>
    </>
  );
};

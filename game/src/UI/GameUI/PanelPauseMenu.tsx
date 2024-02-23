import './PanelPauseMenu.css';
import {Component, Show} from 'solid-js';
import {GameInfo} from '../../GameInfo';
import {Settings} from '../../Settings';
import {EDITOR_OPEN, RESUME_GAME} from '../../eventTypes';
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
    Settings.set('editorOpen', 'true');
  };

  return <>
    <BasePanel id='panel-pause-menu' title='Pause Menu' scroll={false} backBtn={false} setPanel={props.setPanel}>
      <div class="flex grow flex-col gap-4">
        <button class="col col-12 btn-primary" onClick={() => handleResumeGame()}>Resume Level</button>
        <button class="col col-12 btn-secondary" onClick={() => props.setPanel('panel-select-level')}>Select Level</button>
        <Show when={Settings.betaFeaturesEnabled()}>
          <button class="col col-12 btn-secondary" onClick={() => handleOpenEditor()}>Open in Editor</button>
        </Show>
        <button class="col col-12 btn-secondary mb-14" onClick={() => props.setPanel('panel-leaderboards')}>Leaderboard</button>
        <button class="col col-12 btn-secondary" onClick={() => props.setPanel('panel-how-to-play')}>How To Play?</button>
        <button class="col col-12 btn-secondary" onClick={() => props.setPanel('panel-settings')}>Settings</button>
        <button class="col col-12 btn-secondary mb-4" onClick={() => props.setPanel('panel-credits')}>Credits</button>
      </div>

    </BasePanel>
  </>;
};

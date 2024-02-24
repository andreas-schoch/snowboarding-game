import {Component, Show} from 'solid-js';
import {gameConfig} from '../..';
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
    const level = GameInfo.currentLevel;
    if (!level) throw new Error('Current level not set');
    GameInfo.observer.emit(EDITOR_OPEN, level);
    Settings.set('editorOpen', 'true');
  };

  return <>
    <BasePanel id='panel-pause-menu' title='Pause Menu' backBtn={false} setPanel={props.setPanel} class="!w-[500px]">
      <div class="flex grow flex-col gap-4">
        <button class="col col-12 btn-primary" onClick={() => handleResumeGame()}>Resume Level</button>
        <button class="col col-12 btn-secondary" onClick={() => props.setPanel('panel-select-level')}>Select Level</button>
        <Show when={Settings.betaFeaturesEnabled()}>
          <button class="col col-12 btn-secondary" onClick={() => handleOpenEditor()}>Open in Editor (Beta)</button>
        </Show>
        <button class="col col-12 btn-secondary mb-14" onClick={() => props.setPanel('panel-leaderboards')}>Leaderboard</button>
        <button class="col col-12 btn-secondary" onClick={() => props.setPanel('panel-how-to-play')}>How To Play?</button>
        <button class="col col-12 btn-secondary" onClick={() => props.setPanel('panel-settings')}>Settings</button>
        <button class="col col-12 btn-secondary" onClick={() => props.setPanel('panel-credits')}>Credits</button>
      </div>

      <div class="absolute bottom-3 left-1/2 translate-x-[-50%] text-[10px] text-stone-500">v{gameConfig.version}</div>

    </BasePanel>
  </>;
};

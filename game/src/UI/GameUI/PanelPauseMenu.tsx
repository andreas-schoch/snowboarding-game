import {Component, Show} from 'solid-js';
import {gameConfig} from '../..';
import {GameInfo} from '../../GameInfo';
import {PersistedStore} from '../../PersistedStore';
import {EDITOR_OPEN, SET_PAUSE_GAME} from '../../eventTypes';
import {BasePanel} from './BasePanel';
import {PanelId} from './GameUI';

export const PanelPauseMenu: Component<{setPanel: (id: PanelId) => void}> = props => {
  const handleResumeGame = () => {
    props.setPanel('none');
    GameInfo.observer.emit(SET_PAUSE_GAME, false);
  };

  const handleOpenEditor = () => {
    props.setPanel('none');
    const level = GameInfo.currentLevel;
    const rubefile = GameInfo.currentLevelScene;
    if (!level) throw new Error('Current level not set');
    if (!rubefile) throw new Error('RubeFile not found for level: ' + level);
    PersistedStore.addEditorRecentLevel(level, rubefile);
    GameInfo.observer.emit(EDITOR_OPEN, level);
    PersistedStore.set('editorOpen', 'true');
  };

  return <>
    <BasePanel id='panel-pause-menu' title='Pause Menu' backBtn={false} setPanel={props.setPanel} class="!w-[500px]">
      <div class="flex grow flex-col gap-4">
        <button class="col col-12 btn-primary" onClick={() => handleResumeGame()}>Resume Level</button>
        <button class="col col-12 btn-secondary" onClick={() => props.setPanel('panel-select-level')}>Select Level</button>
        <Show when={PersistedStore.betaFeaturesEnabled()}>
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

import './PanelSelectLevel.css';
import {Component, For, createSignal} from 'solid-js';
import {leaderboardService} from '..';
import {GameInfo} from '../GameInfo';
import {Settings} from '../Settings';
import {RESTART_GAME} from '../eventTypes';
import {ILevel, LevelKeys, localLevels} from '../levels';
import {BasePanel} from './BasePanel';
import {PanelId} from '.';

export const PanelSelectLevel: Component<{ setPanel: (id: PanelId) => void }> = props => {
  const [levels] = createSignal<ILevel[]>(localLevels);

  const handleSelectLevel = (id: LevelKeys) => {
    Settings.set('levelCurrent', id);
    leaderboardService.setLevel(id);
    GameInfo.observer.emit(RESTART_GAME);

  };

  return (
    <BasePanel id='panel-select-level' title='Select Level' scroll={true} backBtn={!GameInfo.crashed && !GameInfo.score.finishedLevel} setPanel={props.setPanel} >
      <For each={levels()} fallback={<div>Loading...</div>}>
        {item => (
          <div class="level-item" onClick={() => handleSelectLevel(item.id as LevelKeys)}>
            <span class="level-item-overlay" id={item.id} />
            <div class="level-item-number">{item.number}</div>
            <div class="level-item-name">{item.name}</div>
            <div class="level-item-thumbnail" style={{'background-image': `url("${item.thumbnail}`}} />
          </div>
        )}
      </For>
    </BasePanel>
  );
};

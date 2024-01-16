import './PanelSelectLevel.css';
import {Component, For, createSignal} from 'solid-js';
import {leaderboardService} from '..';
import {GameInfo} from '../GameInfo';
import {Settings} from '../Settings';
import {RESTART_GAME} from '../eventTypes';
import {ILevel, LevelKeys, localLevels} from '../levels';
import {BasePanel} from './BasePanel';
import {PanelId} from '.';

export const PanelSelectLevel: Component<{setPanel: (id: PanelId) => void}> = props => {
  const [levels] = createSignal<ILevel[]>(localLevels);
  const canGoBack = !GameInfo.crashed && !GameInfo.score.finishedLevel;

  const handleSelectLevel = (id: LevelKeys) => {
    Settings.set('levelCurrent', id);
    leaderboardService.setLevel(id);
    GameInfo.observer.emit(RESTART_GAME);

  };

  return (
    <BasePanel id='panel-select-level' title='Select Level' scroll={true} backBtn={canGoBack} setPanel={props.setPanel} >
      <For each={levels()} fallback={<div>Loading...</div>}>
        {item => (
          <div onClick={() => handleSelectLevel(item.id as LevelKeys)} class="relative w-[calc(49.2%_-_0.5rem)] inline-block bg-[color:var(--level-item-background)] transition-[0.2s] mr-[0.4rem] mb-[0.8rem] p-2 rounded-lg border-2 border-solid border-[black] scale-[0.975] hover:scale-100">
            <span id={item.id} class="absolute cursor-pointer rounded-lg -inset-px" />
            <div class="text-[color:var(--level-item-number-color)] leading-[1.15]">Level {String(item.number).padStart(3, '0')}</div>
            <div class="text-[13px] leading-[26px] text-[color:var(--level-item-name-color)]">{item.name}</div>
            <div class="w-full aspect-[16/9] bg-cover rounded-[5px]" style={{'background-image': `url("${item.thumbnail}`}} />
          </div>
        )}
      </For>
    </BasePanel>
  );
};

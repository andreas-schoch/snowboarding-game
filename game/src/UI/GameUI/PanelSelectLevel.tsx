import {Component, For, createResource} from 'solid-js';
import {pb} from '../..';
import {GameInfo} from '../../GameInfo';
import {Settings} from '../../Settings';
import {RESTART_GAME} from '../../eventTypes';
import {ILevel, LocalLevelKeys} from '../../levels';
import {BasePanel} from './BasePanel';
import {PanelId} from './GameUI';

export const PanelSelectLevel: Component<{setPanel: (id: PanelId) => void}> = props => {
  const canGoBack = !GameInfo.crashed && !GameInfo.score?.finishedLevel;

  const [levels] = createResource<ILevel[]>(() => pb.level.list());

  const handleSelectLevel = (id: LocalLevelKeys) => {
    Settings.set('levelCurrent', id);
    GameInfo.observer.emit(RESTART_GAME);
  };

  return (
    <BasePanel id='panel-select-level' title='Select Level' backBtn={canGoBack} setPanel={props.setPanel}>
      <div class='scrollbar max-h-[500px]'>
        <For each={levels()} fallback={<div>Loading...</div>}>
          {item => (
            <div onClick={() => handleSelectLevel(item.id as LocalLevelKeys)} style={{'background-image': `url("${pb.getUrl(item, item.thumbnail)}`}} class="relative mb-3 mr-3 inline-block aspect-video w-[310px] overflow-hidden rounded-lg border-2 border-black bg-cover p-2 transition hover:border-gray-200">
              <span id={item.id} class="absolute -inset-px cursor-pointer rounded-lg" />
              <div class="leading-[1.15] text-neutral-400">Level {String(item.number).padStart(3, '0')}</div>
              <div class="text-xs leading-6 text-neutral-300 [text-shadow:_1px_2px_0_black]">{item.name}</div>
            </div>
          )}
        </For>
      </div>
    </BasePanel>
  );
};

import {ListResult} from 'pocketbase';
import {Component, For, Show, createEffect, createResource, onCleanup, onMount} from 'solid-js';
import {pb} from '../..';
import {GameInfo} from '../../GameInfo';
import {PersistedStore} from '../../PersistedStore';
import {RESTART_GAME} from '../../eventTypes';
import {waitUntil} from '../../helpers/waitUntil';
import {ILevel, LocalLevelKeys} from '../../levels';
import {BackToMenuBtn} from './BackBtn';
import {BasePanel} from './BasePanel';
import {PanelId} from './GameUI';

export const PanelSelectLevel: Component<{setPanel: (id: PanelId) => void}> = props => {
  const canGoBack = !GameInfo.crashed && !GameInfo.score?.finishedLevel;

  const [listResult] = createResource<ListResult<ILevel>>(() => pb.level.listCampaign(1));

  const items = () => listResult()?.items || [];

  const handleSelectLevel = (id: LocalLevelKeys) => {
    PersistedStore.set('levelCurrent', id);
    GameInfo.observer.emit(RESTART_GAME);
  };

  // TODO revisit later. Hacky way to ensure level items height is set correctly. using css aspect-ratio was problematic in my case
  onMount(() => window.addEventListener('resize', () => setLevelItemHeight()));
  onCleanup(() => window.removeEventListener('resize', () => setLevelItemHeight()));
  createEffect(() => {
    const list = listResult();
    if (list) {
      waitUntil(() => document.querySelectorAll('.level-item').length, 1000, 25).catch(() => false).then(arg => {
        if (arg !== false) setLevelItemHeight();
      });
    }
  });

  function setLevelItemHeight() {
    const levelItems = document.querySelectorAll<HTMLElement>('.level-item');
    levelItems.forEach((item: HTMLElement) => item.style.height = (item.offsetWidth * 0.5625) + 'px');
  }

  return (
    <BasePanel id='panel-select-level' title='Select Level' class="!max-h-[90vh] !pr-2">
      <div class='scrollbar grid grid-cols-1 gap-3 overflow-auto pr-3 sm:grid-cols-2'>
        <For each={items()} fallback={<div>Loading...</div>}>
          {item => (
            <div onClick={() => handleSelectLevel(item.id as LocalLevelKeys)} style={{'background-image': `url("${pb.getUrl(item, item.thumbnail, {thumb: '320x180'})}`}} class="level-item relative inline-block overflow-hidden rounded-lg border-2 border-black bg-cover p-2 transition hover:border-gray-200">
              <span id={item.id} class="absolute -inset-px cursor-pointer rounded-lg" />
              <div class="leading-[1.15] text-neutral-400">Level {String(item.number).padStart(3, '0')}</div>
              <div class="text-xs leading-6 text-neutral-300 [text-shadow:_1px_2px_0_black]">{item.name}</div>
            </div>
          )}
        </For>
      </div>

      <Show when={canGoBack} fallback={<div class="h-4" />}>
        <BackToMenuBtn setPanel={props.setPanel} />
      </Show>
    </BasePanel>
  );
};

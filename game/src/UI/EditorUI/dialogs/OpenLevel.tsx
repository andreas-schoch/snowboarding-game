import {Pagination, Tabs} from '@kobalte/core';
import {ListResult} from 'pocketbase';
import {Component, For, createEffect, createSignal, Show} from 'solid-js';
import {pb} from '../../..';
import {EditorInfo} from '../../../EditorInfo';
import {PersistedStore} from '../../../PersistedStore';
import {EDITOR_RESET_RENDERED, RUBE_FILE_LOADED} from '../../../eventTypes';
import {ILevel, isLevel} from '../../../levels';
import {RubeFile} from '../../../physics/RUBE/RubeFile';
import {RubeMetaLoader} from '../../../physics/RUBE/RubeMetaLoader';
import {registerNewLevel} from '../../../physics/RUBE/generateEmptyRubeFile';
import {setActiveDialogName, setEditorItems} from '../globalSignals';

type FilterCategory = 'campaign' | 'user_made' | 'my_own' | 'recent';

type ActiveTab = {tab: FilterCategory, page: number};

export const OpenLevel: Component = () => {
  const [activeTab, setActiveTab] = createSignal<ActiveTab>({tab: 'campaign', page: 1});
  const [expandedLevel, setExpandedLevel] = createSignal<ILevel | null>(null);
  const [listLevelResult, setListLevelResult] = createSignal<ListResult<ILevel>>({page: 1, perPage: 10, totalItems: 0, totalPages: 1, items: []});
  const totalPages = () => listLevelResult()?.totalPages;
  const levels = () => listLevelResult()?.items || [];
  let prevActiveTab: ActiveTab | null = null; // ensures we don't make the same request twice, no need for reactivity here

  createEffect(() => {
    const {tab, page} = activeTab();
    if (prevActiveTab && tab === prevActiveTab.tab && page === prevActiveTab.page) return;

    let request: Promise<ListResult<ILevel>> | null = null;
    if (tab === 'campaign') request = pb.level.listCampaign(page);
    else if (tab === 'user_made') request = pb.level.listUserMade(page);
    else if (tab === 'my_own') request = pb.level.listMine(page);
    else if (tab === 'recent') request = pb.level.listCampaign(page);
    else throw new Error('Invalid tab');

    request.then(res => setListLevelResult(res));
    prevActiveTab = {tab, page};
  });

  const handleSelectLevel = (e: Event, level: ILevel) => {
    e.preventDefault();
    setExpandedLevel(level);
    // TODO
  };

  const handleTabChange = (value: string) => {
    setActiveTab({tab: value as FilterCategory, page: 1});
  };

  const openLevel = (level: ILevel) => {
    getRubefile(level).then(([level, rubefile]) => {
      const items = RubeMetaLoader.load(level, rubefile);
      PersistedStore.addEditorRecentLevel(level, rubefile);
      setEditorItems(items);
      EditorInfo.observer.emit(EDITOR_RESET_RENDERED);
      EditorInfo.observer.emit(RUBE_FILE_LOADED, items);
      setActiveDialogName(null);
    });
  };

  const cloneLevel = (levelToClone: ILevel) => {
    getRubefile(levelToClone).then(([_, rubeFileToClone]) => {
      const [newLevel, rubefile] = registerNewLevel(rubeFileToClone);
      newLevel.name = `Clone of ${levelToClone.name}`.slice(0, 32);
      // newLevel.owner = 

      const items = RubeMetaLoader.load(newLevel, rubefile);
      PersistedStore.addEditorRecentLevel(newLevel, rubefile);
      setEditorItems(items);
      EditorInfo.observer.emit(EDITOR_RESET_RENDERED);
      EditorInfo.observer.emit(RUBE_FILE_LOADED, items);
      setActiveDialogName(null);
    });
  };

  // TODO deduplicate
  async function getRubefile(level: ILevel): Promise<[ILevel, RubeFile]> {
    // TODO at some point need to have a way to check the modified date and show a dialog to the user if they want to load the latest version
    if(isLevel(level)) {
      const rubefile = await pb.level.getRubeFile(level);
      if (rubefile) {
        PersistedStore.addEditorRecentLevel(level, rubefile);
        return [level, rubefile];
      }
    }

    throw new Error('Invalid level');

    // const mostRecentRubefileLocal = PersistedStore.getEditorRubefile(level);
    // if (mostRecentRubefileLocal) return [level, mostRecentRubefileLocal];

    // console.debug('No level found. Creating new one...');
    // const [newLevel, file] = registerNewLevel();
    // PersistedStore.addEditorRecentLevel(newLevel, file);
    // return [newLevel, file];
  }

  return <>
    <div class='relative flex h-[700px] max-h-[95vh] w-[600px] max-w-[95vw] flex-col overflow-hidden rounded-md pt-12 text-white'>

      <div class="absolute inset-x-0 top-0 rounded-t-md border-b border-stone-600 bg-stone-900 px-4 py-2 text-[12px] text-white">Open Level</div>

      <Tabs.Root activationMode='manual' aria-label="Main navigation" class="tabs" onChange={handleTabChange}>
        <Tabs.List class="tabs__list text-[10px]">
          <Tabs.Trigger class="ml-auto inline-block px-4 py-2 outline-none" value="campaign">Campaign</Tabs.Trigger>
          <Tabs.Trigger class="mr-auto inline-block px-4 py-2 outline-none" value="my_own">My Own</Tabs.Trigger>
          <Tabs.Indicator class="absolute inset-y-0 rounded bg-stone-400 opacity-20 transition-all" />
        </Tabs.List>

        <Tabs.Content class="" value="campaign">
          <div class="p-3 text-[10px] leading-4">There are made by the creator of this game. Feel free to clone and use them as a base for your own level.</div>

          <div class="scrollbar !max-h-[30rem] grow p-5" >
            <For each={levels()} fallback={<div>-</div>}>
              {item => (
                <div onClick={e => handleSelectLevel(e, item)} class="mb-4 flex cursor-pointer flex-col rounded-md border border-stone-500 bg-stone-800 px-4 py-2 hover:bg-stone-700">
                  <div class="mb-1 text-white">{item.name}</div>
                  <div class="flex flex-row gap-4 text-[10px] text-stone-500">
                    <div>By: username</div>
                    <div>Rating: 8.64</div>
                  </div>
                  <div class="flex flex-row gap-4 overflow-hidden pt-2 transition-all duration-150 ease-in-out" classList={{'max-h-0': expandedLevel()?.id !== item.id, 'max-h-[48px]': expandedLevel()?.id === item.id}}>
                    <button class="btn-secondary" onClick={() => cloneLevel(item)}>Clone</button>
                  </div>
                </div>
              )}
            </For>
          </div>

        </Tabs.Content>

        <Tabs.Content class="p-3 text-[10px] leading-4" value="my_own">
          <div>These are made by yourself. Both published and unpublished drafts are listed here.</div>

          <div class="scrollbar max-h-[30rem] grow p-5" >
            <For each={levels()} fallback={<div>-</div>}>
              {item => (
                <div onClick={e => handleSelectLevel(e, item)} class="mb-4 flex cursor-pointer flex-col rounded-md border border-stone-500 bg-stone-800 px-4 py-2 hover:bg-stone-700">
                  <div class="mb-1 text-white">{item.name}</div>
                  <div class="flex flex-row gap-4 text-[10px] text-stone-500">
                    <div>By: username</div>
                    <div>Rating: 8.64</div>
                  </div>
                  <div class="flex flex-row gap-4 overflow-hidden pt-2 transition-all duration-150 ease-in-out" classList={{'max-h-0': expandedLevel()?.id !== item.id, 'max-h-[48px]': expandedLevel()?.id === item.id}}>
                    <button class="btn-primary" onClick={() => openLevel(item)}>Open</button>
                    <button class="btn-secondary" onClick={() => cloneLevel(item)}>Clone</button>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Tabs.Content>
      </Tabs.Root>

      <Show when={levels().length}>
        <Pagination.Root
          class="pagination__root absolute inset-x-0 bottom-0 flex justify-center p-4"
          page={activeTab().page}
          count={totalPages()}
          onPageChange={page => setActiveTab({tab: activeTab().tab, page})}
          itemComponent={props => <Pagination.Item class="pagination__item" page={props.page}>{props.page}</Pagination.Item>}
          ellipsisComponent={() => <Pagination.Ellipsis class="pagination__ellipsis">...</Pagination.Ellipsis>}
        >
          <Pagination.Items />
        </Pagination.Root>
      </Show>
    </div>
  </>;
};

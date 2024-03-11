import {Pagination, Tabs} from '@kobalte/core';
import {ListResult} from 'pocketbase';
import {Component, For, createEffect, createSignal} from 'solid-js';
import {pb} from '../../..';
import {ILevel} from '../../../levels';

type FilterCategory = 'campaign' | 'user_made' | 'my_own' | 'recent';

type ActiveTab = {tab: FilterCategory, page: number};

export const OpenLevel: Component = () => {
  const [activeTab, setActiveTab] = createSignal<ActiveTab>({tab: 'campaign', page: 1});
  const [expandedLevel, setExpandedLevel] = createSignal<ILevel | null>(null);
  const [listLevelResult, setListLevelResult] = createSignal<ListResult<ILevel>>({page: 1, perPage: 10, totalItems: 0, totalPages: 1, items: []});
  const totalPages = () => listLevelResult().totalPages;
  const levels = () => listLevelResult().items || [];
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

    request?.then(res => setListLevelResult(res));
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

  return <>
    <div class='relative flex h-[700px] max-h-[95vh] w-[600px] max-w-[95vw] flex-col overflow-hidden rounded-md pt-12 text-white'>

      <div class="absolute inset-x-0 top-0 rounded-t-md border-b border-stone-600 bg-stone-900 px-4 py-2 text-[12px] text-white">Open Level</div>

      <Tabs.Root activationMode='manual' aria-label="Main navigation" class="tabs" onChange={handleTabChange}>
        <Tabs.List class="tabs__list text-[10px]">
          <Tabs.Trigger class="ml-auto inline-block px-4 py-2 outline-none" value="campaign">Campaign</Tabs.Trigger>
          <Tabs.Trigger class="inline-block px-4 py-2 outline-none" value="user_made">User Made</Tabs.Trigger>
          <Tabs.Trigger class="inline-block px-4 py-2 outline-none" value="my_own">My Own</Tabs.Trigger>
          <Tabs.Trigger class="mr-auto inline-block px-4 py-2 outline-none" value="recent">Recent</Tabs.Trigger>
          <Tabs.Indicator class="absolute inset-y-0 rounded bg-stone-400 opacity-20 transition-all" />
        </Tabs.List>
      </Tabs.Root>

      <div class="scrollbar grow p-5" >
        <For each={levels()} fallback={<div>Loading...</div>}>
          {item => (
            <div onClick={e => handleSelectLevel(e, item)} class="mb-4 flex cursor-pointer flex-col rounded-md border border-stone-500 bg-stone-700 px-4 py-2 hover:bg-stone-700">
              <div class="mb-1 text-white">{item.name}</div>
              <div class="flex flex-row gap-4 text-[10px] text-stone-500">
                <div>By: username</div>
                <div>Rating: 8.64</div>
              </div>

              <div class="flex flex-row gap-4 overflow-hidden pt-2 transition-all duration-150 ease-in-out" classList={{'max-h-0': expandedLevel()?.id !== item.id, 'max-h-[48px]': expandedLevel()?.id === item.id}}>
                <button class="btn-primary">Open</button>
                <button class="btn-secondary">Clone</button>
              </div>

            </div>
          )}
        </For>
      </div>

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
    </div>
  </>;
};

import {ListResult} from 'pocketbase';
import {Component, For, Suspense, createMemo, createResource, createSignal} from 'solid-js';
import {pb} from '../..';
import {PersistedStore} from '../../PersistedStore';
import {waitUntil} from '../../helpers/waitUntil';
import {IRank} from '../../pocketbase/types';
import {BackToMenuBtn} from './BackBtn';
import {BasePanel} from './BasePanel';
import {PanelId} from './GameUI';
import {Spinner} from './Spinner';

const PER_PAGE = 50;

// while user doesn't close the leaderboard and switches back to already visited pages, it should not fetch the same page again
function createCachedFetchRanks() {
  const cached: Record<number, ListResult<IRank>> = {};
  const fetchedOrInprogress: Set<number> = new Set();
  return function fetchRanksWrapped(page: number) {
    if (cached[page]) return cached[page];
    if (fetchedOrInprogress.has(page)) return waitUntil(() => cached[page], 5000, 25).catch(() => null);
    fetchedOrInprogress.add(page);
    return pb.leaderboard.list(PersistedStore.currentLevel(), page, PER_PAGE).then(list => cached[page] = list);
  };
}

export const PanelLeaderboards: Component<{setPanel: (id: PanelId) => void}> = props => {
  let scrollbarRef: HTMLElement;
  const [page, setPage] = createSignal(1);
  const fetchRanks = createCachedFetchRanks();
  const [ranks] = createResource(page, fetchRanks);
  const pageOffset = () => (page() - 1) * PER_PAGE;
  const totalPages = () => ranks()?.totalPages || 1;

  const ownScorePseudoStyles = 'after:content-["You"] after:text-[white] after:bg-blue-900 after:text-xs after:ml-2 after:px-2 after:py-1 after:rounded-md';

  const pagesToDisplay = createMemo(() => {
    const total = totalPages();
    const current = page();
    let startPage = 1;
    let endPage = total;

    if (total <= 5) {
      startPage = 1;
      endPage = total;
    } else if (current <= 3) {
      startPage = 1;
      endPage = 5;
    } else if (current >= total - 2) {
      startPage = total - 4;
      endPage = total;
    } else {
      startPage = current - 2;
      endPage = current + 2;
    }

    const pages: number[] = [];
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  });

  function handleSetPage(page: number): void {
    const list = ranks();
    if (!list) return;
    if (page >= 1 && page <= list.totalPages) {
      setPage(page);
      scrollbarRef.scrollTop = 0;
    }
  }

  function preloadPage(page: number): void {
    const total = totalPages();
    if (page < 1 || page > total) return;
    fetchRanks(page);
  }

  return (
    <BasePanel id='panel-leaderboards' title='Leaderboards' class="h-[560px] pr-2">

      <div class="grid h-full grid-rows-[28px_1fr_32px] items-center gap-2">

        <div class="row !m-0 grid grid-cols-[2fr_7fr_3fr] pl-3 pr-4 text-sm">
          <span class="bolder">#</span>
          <span class="bolder">Name</span>
          <span class="bolder text-right">Score</span>
        </div>

        <div ref={el => scrollbarRef = el} class="scrollbar relative" id="leaderboard-item-container">
          <Suspense fallback={<div class="flex justify-center"><Spinner /></div>}>
            <For each={ranks()?.items} fallback={<div>Loading...</div>}>
              {(rank, index) => (
                <div class="mb-5 grid grid-cols-[2fr_7fr_3fr] pl-3 pr-4 text-sm">
                  <span class="" id="leaderboard-item-rank">{(index() + 1) + pageOffset()}</span>
                  <span classList={{[ownScorePseudoStyles]: pb.auth.loggedInUser()?.id === rank.userId}} class="overflow-hidden text-ellipsis">{rank.username}</span>
                  <span class="text-right" id="leaderboard-item-score">{rank.pointsTotal}</span>
                </div>
              )}
            </For>
          </Suspense>
        </div>

        {/* <!-- PAGINATION --> */}
        <div class="grid grid-cols-[2fr_1fr_6fr_1fr_2fr] items-center">
          <span class="" />
          <button class="btn-menu !justify-end" onClick={() => handleSetPage(page() - 1)} onMouseOver={() => preloadPage(page() - 1)}>
            <i class="material-icons mr-2">chevron_left</i>
          </button>

          <div class="flex flex-row justify-center text-[11px]">
            <For each={pagesToDisplay()}>
              {num => <span class="basis-10 cursor-pointer text-center" classList={{'text-white underline': num === page()}} onClick={() => handleSetPage(num)} onMouseOver={() => preloadPage(num)}>{num}</span>}
            </For>
          </div>

          <button class="btn-menu !justify-start" onClick={() => handleSetPage(page() + 1)} onMouseOver={() => preloadPage(page() + 1)}>
            <i class="material-icons mr-2">chevron_right</i>
          </button>
          <span class="" />
        </div>
      </div>

      <BackToMenuBtn setPanel={props.setPanel} />

    </BasePanel>
  );
};

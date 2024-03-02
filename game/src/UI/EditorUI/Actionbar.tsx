import {Menubar} from '@kobalte/core';
import {Component, Show, createSignal} from 'solid-js';
import {Dynamic, Portal} from 'solid-js/web';
import {rubeFileSerializer} from '../..';
import {EditorInfo} from '../../EditorInfo';
import {Settings} from '../../Settings';
import {EditorItemTracker} from '../../editor/items/ItemTracker';
import {EDITOR_EXIT} from '../../eventTypes';
import {downloadBlob} from '../../helpers/binaryTransform';
import {RubeMetaSerializer} from '../../physics/RUBE/RubeMetaSerializer';

type DialogName = 'Help' | 'About' | 'Settings';
const [activeDialog, setActiveDialog] = createSignal<DialogName | null>(null);

export const Actionbar: Component = () => {

  const handleOpenGame = () => {
    EditorInfo.observer.emit(EDITOR_EXIT);
    Settings.set('editorOpen', 'false');
  };

  return <>
    <header class="absolute inset-x-0 top-0 flex h-[76px] items-center border-b border-stone-600 bg-stone-900 text-white">

      <div class="ml-2 mr-4 size-14 cursor-pointer rounded-full border border-stone-600 bg-stone-800 hover:bg-stone-700" onClick={handleOpenGame}>
        <img src="/assets/img/logo.png" class="size-full  hover:scale-105" alt='logo goto main menu' />
      </div>

      <div class="flex h-full flex-col pt-2">
        <div contentEditable class="rounded-sm border border-transparent p-1 text-sm transition-all hover:border-stone-600">Dummy Level Name</div>

        <Menubar.Root class="menubar__root mt-auto flex items-center gap-x-6 pr-5">
          <MenuFile />
          <MenuEdit />
          <MenuView />
          <MenuActions />
          <MenuHelp />
        </Menubar.Root>

      </div>

      <button class="btn-menu-item !w-auto">
        <i class="material-icons text-green-600">play_arrow</i>
      </button>
    </header>

    <Portal>

      <Show when={activeDialog() !== null}>
        <div class="absolute inset-0 z-[3000] bg-stone-950 opacity-75" onClick={() => setActiveDialog(null)} />
        <div class="absolute left-1/2 top-1/2 z-[3001] size-[500px] translate-x-[-50%] translate-y-[-50%] rounded-lg border border-stone-600 bg-stone-800">
          <Dynamic component={dialogNameMap[activeDialog()!]} />
        </div>
      </Show>
    </Portal>
  </>;
};

const MenuFile: Component = () => {
  const metaSerializer = new RubeMetaSerializer();

  function exportAsRube() {
    const items = EditorItemTracker.editorItems;
    const rubefile = metaSerializer.serialize(items);
    downloadBlob(JSON.stringify(rubefile), 'level.rube', 'application/json');
  }

  function exportAsBinary() {
    const items = EditorItemTracker.editorItems;
    const rubefile = metaSerializer.serialize(items);
    const binary = rubeFileSerializer.encode(rubefile);
    downloadBlob(binary, 'level.bin', 'application/octet-stream');
  }

  return <>
    <Menubar.Menu>
      <Menubar.Trigger class="menubar__trigger">File</Menubar.Trigger>

      <Menubar.Portal>
        <Menubar.Content class="menubar__content">

          <Menubar.Item class="menubar__item">
            New <div class="menubar__item-right-slot"><kbd>Alt</kbd>+<kbd>Ctrl</kbd>+<kbd>N</kbd></div>
          </Menubar.Item>

          <Menubar.Item class="menubar__item">
            Open <div class="menubar__item-right-slot"><kbd>Ctrl</kbd>+<kbd>O</kbd></div>
          </Menubar.Item>

          <Menubar.Sub overlap gutter={4} shift={-8}>
            <Menubar.SubTrigger class="menubar__sub-trigger">
              Open Recent
              <div class="menubar__item-right-slot">
                <i class="material-icons size-5 text-gray-400" >chevron_right</i>
              </div>
            </Menubar.SubTrigger>
            <Menubar.Portal>
              <Menubar.SubContent class="menubar__sub-content">
                <Menubar.Item class="menubar__item">Level 001</Menubar.Item>
                <Menubar.Item class="menubar__item">Level 002</Menubar.Item>
                <Menubar.Item class="menubar__item">Level 003</Menubar.Item>
                <Menubar.Item class="menubar__item">Level 004</Menubar.Item>
                <Menubar.Item class="menubar__item">Level 005</Menubar.Item>
              </Menubar.SubContent>
            </Menubar.Portal>
          </Menubar.Sub>

          <Menubar.Separator class="menubar__separator" />

          <Menubar.Item class="menubar__item">
            Save <div class="menubar__item-right-slot"><kbd>Ctrl</kbd>+<kbd>S</kbd></div>
          </Menubar.Item>

          <Menubar.Item class="menubar__item">
            Save as new
          </Menubar.Item>

          <Menubar.Separator class="menubar__separator" />

          <Menubar.Sub overlap gutter={4} shift={-8}>
            <Menubar.SubTrigger class="menubar__sub-trigger">
              Import <div class="menubar__item-right-slot"><i class="material-icons size-5 text-gray-400" >chevron_right</i></div>
            </Menubar.SubTrigger>
            <Menubar.Portal>
              <Menubar.SubContent class="menubar__sub-content">
                <Menubar.Item class="menubar__item">from .bin</Menubar.Item>
                <Menubar.Item class="menubar__item">from .rube</Menubar.Item>
              </Menubar.SubContent>
            </Menubar.Portal>
          </Menubar.Sub>

          <Menubar.Sub overlap gutter={4} shift={-8}>
            <Menubar.SubTrigger class="menubar__sub-trigger">
            Export <div class="menubar__item-right-slot"><i class="material-icons size-5 text-gray-400" >chevron_right</i></div>
            </Menubar.SubTrigger>
            <Menubar.Portal>
              <Menubar.SubContent class="menubar__sub-content">
                <Menubar.Item class="menubar__item" onSelect={exportAsBinary}>as .bin</Menubar.Item>
                <Menubar.Item class="menubar__item" onSelect={exportAsRube}>as .rube</Menubar.Item>
              </Menubar.SubContent>
            </Menubar.Portal>
          </Menubar.Sub>

          <Menubar.Separator class="menubar__separator" />

          <Menubar.Item class="menubar__item">
            Exit <div class="menubar__item-right-slot">⇧+⌘+K</div>
          </Menubar.Item>

        </Menubar.Content>
      </Menubar.Portal>
    </Menubar.Menu>
  </>;
};

const MenuEdit: Component = () => {
  return <>
    <Menubar.Menu>
      <Menubar.Trigger class="menubar__trigger">Edit</Menubar.Trigger>

      <Menubar.Portal>
        <Menubar.Content class="menubar__content">

          <Menubar.Item class="menubar__item">
          undo <div class="menubar__item-right-slot"><kbd>Ctrl</kbd>+<kbd>Z</kbd></div>
          </Menubar.Item>

          <Menubar.Item class="menubar__item">
          redo <div class="menubar__item-right-slot"><kbd>Ctrl</kbd>+<kbd>Y</kbd></div>
          </Menubar.Item>

          <Menubar.Separator class="menubar__separator" />

          <Menubar.Item class="menubar__item">
          copy <div class="menubar__item-right-slot"><kbd>Ctrl</kbd>+<kbd>C</kbd></div>
          </Menubar.Item>

          <Menubar.Item class="menubar__item">
          paste<div class="menubar__item-right-slot"><kbd>Ctrl</kbd>+<kbd>V</kbd></div>
          </Menubar.Item>

        </Menubar.Content>
      </Menubar.Portal>
    </Menubar.Menu>
  </>;
};

const MenuView: Component = () => {
  return <>
    <Menubar.Menu>
      <Menubar.Trigger class="menubar__trigger">View</Menubar.Trigger>

      <Menubar.Portal>
        <Menubar.Content class="menubar__content">

          TODO

        </Menubar.Content>
      </Menubar.Portal>
    </Menubar.Menu>
  </>;
};

const MenuActions: Component = () => {
  return <>
    <Menubar.Menu>
      <Menubar.Trigger class="menubar__trigger">Actions</Menubar.Trigger>

      <Menubar.Portal>
        <Menubar.Content class="menubar__content">

          TODO

        </Menubar.Content>
      </Menubar.Portal>
    </Menubar.Menu>
  </>;
};

const MenuHelp: Component = () => {
  return <>
    <Menubar.Menu>
      <Menubar.Trigger class="menubar__trigger">Help</Menubar.Trigger>

      <Menubar.Portal>
        <Menubar.Content class="menubar__content">

          <Menubar.Item class="menubar__item" onSelect={() => setActiveDialog('Help')}>
            Open Help Docs<div class="menubar__item-right-slot"><kbd>F1</kbd></div>
          </Menubar.Item>

          <Menubar.Item class="menubar__item" onSelect={() => window.open('https://github.com/andreas-schoch/snowboarding-game/discussions','_newtab')}>
            Forum
          </Menubar.Item>

          <Menubar.Item class="menubar__item" onSelect={() => setActiveDialog('About')}>
            About
          </Menubar.Item>
        </Menubar.Content>
      </Menubar.Portal>
    </Menubar.Menu>
  </>;
};

const dialogNameMap: Record<DialogName, Component> = {
  Help: () => <div>Help</div>,
  About: () => <div>About</div>,
  Settings: () => <div>Settings</div>,
};

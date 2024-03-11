import {Menubar} from '@kobalte/core';
import {Component, For} from 'solid-js';
import {rubeFileSerializer} from '../..';
import {EditorInfo} from '../../EditorInfo';
import {PersistedStore} from '../../PersistedStore';
import {Commander} from '../../editor/command/Commander';
import {EDITOR_EXIT, EDITOR_RESET_RENDERED, RUBE_FILE_LOADED} from '../../eventTypes';
import {arrayBufferToString, downloadBlob} from '../../helpers/binaryTransform';
import {openFileSelector} from '../../helpers/openFileSelector';
import {RubeMetaLoader} from '../../physics/RUBE/RubeMetaLoader';
import {editorItemsToRubefile} from '../../physics/RUBE/RubeMetaSerializer';
import {registerNewLevel} from '../../physics/RUBE/generateEmptyRubeFile';
import {editorItems, setActiveDialogName, setEditorItems} from './globalSignals';

export const Actionbar: Component = () => {

  const handleOpenGame = () => {
    EditorInfo.observer.emit(EDITOR_EXIT);
    PersistedStore.set('editorOpen', 'false');
  };

  return <>
    <header class="absolute inset-x-0 top-0 flex h-[76px] items-center border-b border-stone-600 bg-stone-900 text-white">

      <div class="ml-2 mr-4 size-14 cursor-pointer rounded-full border border-stone-600 bg-stone-800 hover:bg-stone-700" onClick={handleOpenGame}>
        <img src="/assets/img/logo.png" class="size-full  hover:scale-105" alt='logo goto main menu' />
      </div>

      <div class="flex h-full flex-col pt-2">
        <div contentEditable class="rounded-sm border border-transparent p-1 text-sm transition-all hover:border-stone-600">{editorItems().level.name}</div>

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
  </>;
};

const MenuFile: Component = () => {

  function openEmptyLevel() {
    const [level, rubefile] = registerNewLevel();
    const items = RubeMetaLoader.load(level, rubefile);
    PersistedStore.addEditorRecentLevel(level, rubefile);
    setEditorItems(items);
    EditorInfo.observer.emit(EDITOR_RESET_RENDERED);
  }

  function exportAsRube() {
    const items = editorItems();
    const rubefile = editorItemsToRubefile(items);
    downloadBlob(JSON.stringify(rubefile), 'level.rube', 'application/json');
  }

  function exportAsBinary() {
    const items = editorItems();
    const rubefile = editorItemsToRubefile(items);
    const binary = rubeFileSerializer.encode(rubefile);
    downloadBlob(binary, 'level.bin', 'application/octet-stream');
  }

  async function importFromRube() {
    const file = await openFileSelector('.rube');
    if (file) {
      const text = await file.text();
      const [level, rubefile] = registerNewLevel(JSON.parse(text));
      const items = RubeMetaLoader.load(level, rubefile);
      PersistedStore.addEditorRecentLevel(level, rubefile);
      setEditorItems(items);
      EditorInfo.observer.emit(EDITOR_RESET_RENDERED);
      EditorInfo.observer.emit(RUBE_FILE_LOADED, items);
    }
  }

  async function importFromBin() {
    const file = await openFileSelector('.bin');
    if (file) {
      const buffer = await file.arrayBuffer();
      const binaryString = arrayBufferToString(buffer);
      const [level, rubefile] = registerNewLevel(rubeFileSerializer.decode(binaryString));
      const items = RubeMetaLoader.load(level, rubefile);
      PersistedStore.addEditorRecentLevel(level, rubefile);
      setEditorItems(items);
      EditorInfo.observer.emit(EDITOR_RESET_RENDERED);
      EditorInfo.observer.emit(RUBE_FILE_LOADED, items);
    }
  }

  const recent = PersistedStore.editorRecentLevels();

  return <>
    <Menubar.Menu>
      <Menubar.Trigger class="menubar__trigger">File</Menubar.Trigger>

      <Menubar.Portal>
        <Menubar.Content class="menubar__content">

          <Menubar.Item class="menubar__item" onSelect={() => openEmptyLevel()}>
            New <div class="menubar__item-right-slot"><kbd>Alt</kbd>+<kbd>Ctrl</kbd>+<kbd>N</kbd></div>
          </Menubar.Item>

          <Menubar.Item class="menubar__item" onSelect={() => setActiveDialogName('Open Level')}>
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
                <For each={recent} fallback={<div>No recent</div>}>
                  {(item) => (
                    <Menubar.Item class="menubar__item">{item.name}</Menubar.Item>
                  )}
                </For>
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
                <Menubar.Item class="menubar__item" onSelect={importFromBin}>from .bin</Menubar.Item>
                <Menubar.Item class="menubar__item" onSelect={importFromRube}>from .rube</Menubar.Item>
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

          <Menubar.Item class="menubar__item" onSelect={() => Commander.undo()}>
            <span>undo</span>
            <div class="menubar__item-right-slot"><kbd>Ctrl</kbd>+<kbd>Z</kbd></div>
          </Menubar.Item>

          <Menubar.Item class="menubar__item" onSelect={() => Commander.redo()}>
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

          <Menubar.Item class="menubar__item" onSelect={() => setActiveDialogName('Help')}>
            Open Help Docs<div class="menubar__item-right-slot"><kbd>F1</kbd></div>
          </Menubar.Item>

          <Menubar.Item class="menubar__item" onSelect={() => window.open('https://github.com/andreas-schoch/snowboarding-game/discussions','_newtab')}>
            Forum
          </Menubar.Item>

          <Menubar.Item class="menubar__item" onSelect={() => setActiveDialogName('About')}>
            About
          </Menubar.Item>
        </Menubar.Content>
      </Menubar.Portal>
    </Menubar.Menu>
  </>;
};

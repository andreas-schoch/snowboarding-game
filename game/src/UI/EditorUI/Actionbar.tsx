import {Checkbox, Menubar} from '@kobalte/core';
import {Component, For, createEffect, createSignal, on} from 'solid-js';
import {game, pb, rubeFileSerializer} from '../..';
import {EditorInfo} from '../../EditorInfo';
import {PersistedStore} from '../../PersistedStore';
import {Commander} from '../../editor/command/Commander';
import {EDITOR_EXIT, EDITOR_RESET_RENDERED, EDITOR_SET_FIXTURE_OUTLINE, EDITOR_SET_GRID_VISIBLE, RUBE_FILE_LOADED} from '../../eventTypes';
import {arrayBufferToString, downloadBlob} from '../../helpers/binaryTransform';
import {openFileSelector} from '../../helpers/openFileSelector';
import {ILevel, ILevelNew, isLevel} from '../../levels';
import {RubeFile} from '../../physics/RUBE/RubeFile';
import {RubeMetaLoader} from '../../physics/RUBE/RubeMetaLoader';
import {editorItemsToRubefile} from '../../physics/RUBE/RubeMetaSerializer';
import {registerNewLevel} from '../../physics/RUBE/generateEmptyRubeFile';
import {editorItems, recentLevels, setActiveDialogName, setEditorItems, triggerResetLayout} from './globalSignals';

// TODO implement detect changes to properly (broken right now) update save button state for
//  - Changes after saved level loaded
//  - Changes made before refreshing page are preserved even when save button not clicked
//  - Saving changes should disable button and update backend
//  - If local changes are behind backend, indicate the discerpancy and allow user to pull latest changes from backend
export const Actionbar: Component = () => {
  let saveBtnRef: HTMLButtonElement | null = null;

  const [label, setLabel] = createSignal<'Clone' | 'Upload New' | 'Save Changes' | 'Saved'>('Save Changes');

  const [levelRemote, setLevelRemote] = createSignal<ILevel | null>(null);
  const [lastCommand, setLastCommand] = createSignal(Commander.lastCommandId());
  // const hasChanges = () => lastCommand() !== Commander.lastCommandId();

  const alreadyUploaded = () => isLevel(editorItems().level);
  const isOwner = () => editorItems()!.level.user === pb.auth.loggedInUser()!.id;

  // const labelSaveButton = () => {
  //   if (!isOwner()) return 'Clone';
  //   else if (!alreadyUploaded()) return 'Upload New';
  //   else if (hasChanges()) return 'Save Changes';
  //   return 'Saved';
  // };

  createEffect(on(editorItems, async () => {
    const items = editorItems();
    let remote = levelRemote();

    if (isLevel(items.level) && !remote) {
      remote = await pb.level.get(items.level.id);
      setLevelRemote(remote);
      // if (fetched && fetched.id === items.level.id) return;
    }

    const hasChanges = remote && new Date(items.level.localLastUpdated) > new Date(remote!.updated);

    if (!isOwner()) setLabel('Clone');
    else if (!alreadyUploaded()) setLabel('Upload New');
    else if (hasChanges) setLabel('Save Changes');
    else setLabel('Saved');

    if (label() === 'Saved') saveBtnRef!.setAttribute('disabled', 'true');
    else saveBtnRef!.removeAttribute('disabled');

    // const label = labelSaveButton();
    // console.log('changed', label, lastCommand(), Commander.lastCommandId());

    // if (label === 'Saved') saveBtnRef!.setAttribute('disabled', 'true');
    // else saveBtnRef!.removeAttribute('disabled');

    // const commandId = Commander.lastCommandId();
    // // const lastCommandId = lastCommand();
    // // if (commandId !== lastCommandId) saveBtnRef!.setAttribute('disabled', 'true');
    // setLastCommand(commandId);
  }));

  // createEffect(() => {
  //   const levelLocal = editorItems().level;
  //   if (isLevel(levelLocal)) {
  //     const remote = levelRemote();
  //     if (remote && remote.id === levelLocal.id) return;
  //     pb.level.get(levelLocal.id).then(level => {
  //       setLevelRemote(level);
  //       setHasChanges(hasChanges());
  //       // saveBtnRef?.removeAttribute('disabled');
  //     });
  //   }
  // });

  function handleOpenGame() {
    EditorInfo.observer.emit(EDITOR_EXIT);
    PersistedStore.set('editorOpen', 'false');
  }

  function saveChanges() {
    const currentLabel = label();

    if (currentLabel === 'Saved') return;

    game.renderer.snapshot(async thumbnail => {
      if (!(thumbnail instanceof HTMLImageElement)) throw new Error('Expected HTMLImageElement but got something else');
      let items = editorItems();
      let rubefile = editorItemsToRubefile(items);
      let response: ILevel;

      switch (currentLabel) {
      case 'Upload New':
        response = await pb.level.create(items.level, rubefile, thumbnail.src);
        break;
      case 'Save Changes':
        if (!isLevel(items.level)) throw new Error('Only the owner can save changes');
        response = await pb.level.update(items.level, rubefile, thumbnail.src);
        break;
      case 'Clone': {
        const [clonedLevel, clonedRubefile] = registerNewLevel(rubefile);
        rubefile = clonedRubefile;
        clonedLevel.name = `Clone of ${items.level.name}`.slice(0, 32);
        items = RubeMetaLoader.load(clonedLevel, clonedRubefile);
        PersistedStore.addEditorRecentLevel(clonedLevel, clonedRubefile);
        EditorInfo.observer.emit(EDITOR_RESET_RENDERED);
        EditorInfo.observer.emit(RUBE_FILE_LOADED, items);
        response = await pb.level.create(clonedLevel, clonedRubefile, thumbnail.src);
        break;
      }
      default:
        throw new Error('Invalid label');
      }

      items.level = response;
      setEditorItems(items);
      PersistedStore.addEditorRecentLevel(response, rubefile); // Makes sure the id is set based on the localId and any changes are present
    }, 'image/jpeg', 0.7);
  }

  function renameLevel(val: Event) {
    const input = val.target as HTMLInputElement;
    const items = editorItems();
    items.level.name = input.value;
    setEditorItems(items);
  }

  return <>
    <header class="absolute inset-x-0 top-0 flex h-[76px] items-center border-b border-stone-600 bg-stone-900 text-white">

      <div class="ml-2 mr-4 size-14 cursor-pointer rounded-full border border-stone-600 bg-stone-800 hover:bg-stone-700" onClick={handleOpenGame}>
        <img src="/assets/img/logo.png" class="size-full  hover:scale-105" alt='logo goto main menu' />
      </div>

      <div class="flex h-full flex-col pt-2">
        <input
          type="text"
          maxLength={32}
          class="rounded-sm border border-transparent bg-transparent p-1 text-sm transition-all hover:border-stone-600"
          value={editorItems().level.name}
          onChange={val => renameLevel(val)}
          // onfocus={}
          aria-label='level name'
        />

        <Menubar.Root class="menubar__root mt-auto flex items-center gap-x-6 pr-5">
          <MenuFile />
          <MenuEdit />
          <MenuView />
          <MenuActions />
          <MenuHelp />
        </Menubar.Root>
      </div>

      <button class="btn-menu-item ml-auto mr-4 !w-auto">
        <i class="material-icons text-green-600">play_arrow</i>
        <span>Preview</span>
      </button>

      <button class="btn-primary mr-3" onClick={() => saveChanges()} ref={el => saveBtnRef = el} >
        {label()}
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

  function openRecent(level: ILevel | ILevelNew) {
    getRubefile(level).then(([level, rubefile]) => {
      const items = RubeMetaLoader.load(level, rubefile);
      PersistedStore.addEditorRecentLevel(level, rubefile);
      setEditorItems(items);
      EditorInfo.observer.emit(EDITOR_RESET_RENDERED);
      EditorInfo.observer.emit(RUBE_FILE_LOADED, items);
      setActiveDialogName(null);
    });
  }

  // TODO deduplicate
  async function getRubefile(level: ILevel | ILevelNew): Promise<[ILevel | ILevelNew, RubeFile]> {
    // TODO at some point need to have a way to check the modified date and show a dialog to the user if they want to load the latest version
    if(isLevel(level)) {
      const rubefile = await pb.level.getRubeFile(level);
      if (rubefile) {
        PersistedStore.addEditorRecentLevel(level, rubefile);
        return [level, rubefile];
      }
    }

    const mostRecentRubefileLocal = PersistedStore.getEditorRubefile(level);
    if (mostRecentRubefileLocal) return [level, mostRecentRubefileLocal];

    console.debug('No level found. Creating new one...');
    const [newLevel, file] = registerNewLevel();
    PersistedStore.addEditorRecentLevel(newLevel, file);
    return [newLevel, file];
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
                <For each={recentLevels()} fallback={<div>No recent</div>}>
                  {(item) => (
                    <Menubar.Item class="menubar__item" onSelect={() => openRecent(item)}>{item.name}</Menubar.Item>
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
  const [showGrid, setShowGrid] = createSignal(PersistedStore.editorShowGrid());
  const [showFixtureOutline, setShowFixtureOutline] = createSignal(PersistedStore.editorShowFixture());
  const [darkmodeEnabled, setDarkMode] = createSignal(PersistedStore.darkmodeEnabled());

  createEffect(on(showGrid, () => {
    const showGridValue = showGrid();
    PersistedStore.set('editor_show_grid', String(showGridValue));
    EditorInfo.observer.emit(EDITOR_SET_GRID_VISIBLE, showGridValue);
  }));

  createEffect(on(showFixtureOutline, () => {
    const showFixtureOutlineValue = showFixtureOutline();
    // TODO
    EditorInfo.observer.emit(EDITOR_SET_FIXTURE_OUTLINE, showFixtureOutlineValue);
  }));

  // TODO fix issue with backdrop not updating correctly
  createEffect(on(darkmodeEnabled, () => {
    const darkmodeEnabledValue = darkmodeEnabled();
    const items = editorItems();
    PersistedStore.set('darkmodeEnabled', String(darkmodeEnabledValue));
    EditorInfo.observer.emit(EDITOR_RESET_RENDERED, darkmodeEnabledValue);
    EditorInfo.observer.emit(RUBE_FILE_LOADED, items);
    EditorInfo.observer.emit('darkmode_toggled', darkmodeEnabledValue);
  }));

  return <>
    <Menubar.Menu>
      <Menubar.Trigger class="menubar__trigger">View</Menubar.Trigger>

      <Menubar.Portal>
        <Menubar.Content class="menubar__content flex flex-col gap-2 !px-6 !py-3">
          {/* TOGGLE SHOW GRID */}
          <Checkbox.Root class="checkbox block" checked={showGrid()} onChange={setShowGrid}>
            <Checkbox.Input class="checkbox__input" />
            <Checkbox.Control class="checkbox__control">
              <Checkbox.Indicator><i class="material-icons text-[18px]">check</i></Checkbox.Indicator>
            </Checkbox.Control>
            <Checkbox.Label class="checkbox__label">Show grid</Checkbox.Label>
          </Checkbox.Root>
          {/* TOGGLE SHOW FIXTURE */}
          <Checkbox.Root class="checkbox block" checked={showFixtureOutline()} onChange={setShowFixtureOutline}>
            <Checkbox.Input class="checkbox__input" />
            <Checkbox.Control class="checkbox__control">
              <Checkbox.Indicator><i class="material-icons text-[18px]">check</i></Checkbox.Indicator>
            </Checkbox.Control>
            <Checkbox.Label class="checkbox__label">Show Fixture outline</Checkbox.Label>
          </Checkbox.Root>
          {/* TOGGLE DARKMODE */}
          <Checkbox.Root class="checkbox block" checked={darkmodeEnabled()} onChange={setDarkMode}>
            <Checkbox.Input class="checkbox__input" />
            <Checkbox.Control class="checkbox__control">
              <Checkbox.Indicator><i class="material-icons text-[18px]">check</i></Checkbox.Indicator>
            </Checkbox.Control>
            <Checkbox.Label class="checkbox__label">Enable Darkmode</Checkbox.Label>
          </Checkbox.Root>

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

          <Menubar.Item class="menubar__item" onSelect={() => triggerResetLayout()}>
            Reset Layout
          </Menubar.Item>

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

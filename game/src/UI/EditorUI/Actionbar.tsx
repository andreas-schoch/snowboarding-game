import {Component, ParentComponent, Show, createEffect, createSignal} from 'solid-js';
import {Dynamic, Portal} from 'solid-js/web';
import {EditorInfo} from '../../EditorInfo';
import {Settings} from '../../Settings';
import {EDITOR_EXIT} from '../../eventTypes';

type MenuName = 'File' | 'Edit' | 'View' | 'Actions' | 'Help';
type DialogName = 'Help' | 'About' | 'Settings';
const [activeDialog, setActiveDialog] = createSignal<DialogName | null>(null);

export const Actionbar: Component = () => {
  const [activeMenu, setActiveMenu] = createSignal<MenuName | null>(null);

  function setMenu(menu: MenuName | null) {
    if (activeMenu() === menu) setActiveMenu(null); // toggle when clicking and already open
    else setActiveMenu(menu); // open when none or another menu is open
  }

  createEffect(() => {
    if (activeDialog() !== null) setActiveMenu(null);
  });

  const handleOpenGame = () => {
    EditorInfo.observer.emit(EDITOR_EXIT);
    Settings.set('editorOpen', 'false');
  };

  // TODO how can I dynamically do this?
  // EditorInfo.observer.on('open_dialog', (content: Component) => dialogRef.innerHTML = dialogContent());

  return <>
    <header class="absolute inset-x-0 top-0 flex h-[76px] items-center border-b border-stone-600 bg-stone-900 text-white">

      <div class="ml-2 mr-4 size-14 cursor-pointer rounded-full border border-stone-600 bg-stone-800 hover:bg-stone-700" onClick={handleOpenGame}>
        <img src="/assets/img/logo.png" class="size-full  hover:scale-105" alt='logo goto main menu' />
      </div>

      <div class="flex h-full flex-col pt-2">
        <div contentEditable class="rounded-sm border border-transparent p-1 text-sm transition-all hover:border-stone-600">Dummy Level Name"</div>

        <ul class="mt-auto flex items-center gap-x-6 pr-5">
          <Menu name="File" activeName={activeMenu()} setActive={setMenu}><MenuFile /></Menu>
          <Menu name="Edit" activeName={activeMenu()} setActive={setMenu}><MenuEdit /></Menu>
          <Menu name="View" activeName={activeMenu()} setActive={setMenu}><MenuView /></Menu>
          <Menu name="Actions" activeName={activeMenu()} setActive={setMenu}><MenuActions /></Menu>
          <Menu name="Help" activeName={activeMenu()} setActive={setMenu}><MenuHelp /></Menu>
        </ul>

      </div>

      <button class="btn-menu-item !w-auto">
        <i class="material-icons text-green-600">play_arrow</i>
      </button>
    </header>

    <Portal>
      <div class="absolute inset-0 z-[2000]" classList={{hidden: activeMenu() === null}} onClick={() => setMenu(null)} />

      <Show when={activeDialog() !== null}>
        <div class="absolute inset-0 z-[3000] bg-stone-950 opacity-75" onClick={() => setActiveDialog(null)} />
        <div class="absolute left-1/2 top-1/2 z-[3001] size-[500px] translate-x-[-50%] translate-y-[-50%] rounded-lg border border-stone-600 bg-stone-800">
          <Dynamic component={dialogNameMap[activeDialog()!]} />
        </div>
      </Show>
    </Portal>
  </>;

};

const Menu: ParentComponent<{name: MenuName, activeName: MenuName | null, setActive: (name: MenuName | null) => void}> = props => {
  const isOpen = () => props.activeName === props.name;
  return <>
    <li class="btn-menu z-[2002]" tabIndex={-1}>
      <button class="btn-menu" classList={{underline: isOpen()}} onClick={() => props.setActive(props.name)}>{props.name}</button>
      <div classList={{hidden: !isOpen()}} class="absolute left-[-10px] top-[32px] z-[2001] flex min-h-fit w-[350px] grow flex-col gap-y-1 overflow-y-auto rounded-b-lg border border-t-0 border-stone-600 bg-stone-900 p-3" >
        {props.children}
      </div>
    </li>

  </>;
};

const MenuFile: Component = () => {
  const [recentOpen, setRecentOpen] = createSignal(false);
  const [exportOpen, setExportOpen] = createSignal(false);
  const [importOpen, setImportOpen] = createSignal(false);

  return <>
    {/* NEW */}
    <button class="btn-menu-item">
      <i class="material-icons text-stone-600">folder_open</i>New
    </button>

    {/* OPEN */}
    <button class="btn-menu-item">
      <i class="material-icons text-stone-600">folder_open</i>Open
    </button>

    {/* OPEN  RECENT*/}
    <div>
      <button onClick={() => setRecentOpen(!recentOpen())} class="btn-menu-item">
        <i class="material-icons text-stone-600">folder_open</i>Open Recent
        <i class="material-icons ml-auto size-5 shrink-0 text-gray-400" >{recentOpen() ? 'expand_less' : 'expand_more'}</i>
      </button>
      <ul classList={{hidden: !recentOpen()}} class="mt-1 px-2" id="sub-menu-2">
        <li><div class="block rounded-md py-2 pl-9 pr-2 text-sm leading-6 text-gray-400 hover:bg-gray-50">Level 001</div></li>
        <li><div class="block rounded-md py-2 pl-9 pr-2 text-sm leading-6 text-gray-400 hover:bg-gray-50">Level 002</div></li>
        <li><div class="block rounded-md py-2 pl-9 pr-2 text-sm leading-6 text-gray-400 hover:bg-gray-50">Level 003</div></li>
        <li><div class="block rounded-md py-2 pl-9 pr-2 text-sm leading-6 text-gray-400 hover:bg-gray-50">Level 004</div></li>
      </ul>
    </div>

    <div class='my-2 h-[1px] bg-stone-500' />

    {/* SAVE */}
    <button class="btn-menu-item">
      <i class="material-icons text-stone-600">save</i>Save
    </button>

    {/* SAVE AS NEW */}
    <button class="btn-menu-item">
      <i class="material-icons text-stone-600">save</i>Save as New
    </button>

    <div class='my-2 h-[1px] bg-stone-500' />

    {/* IMPORT */}
    <div>
      <button onClick={() => setImportOpen(!importOpen())} class="btn-menu-item">
        <i class="material-icons text-stone-600">folder_open</i>Import
        <i class="material-icons ml-auto size-5 shrink-0 text-gray-400" >{importOpen() ? 'expand_less' : 'expand_more'}</i>
      </button>
      <ul classList={{hidden: !importOpen()}} class="mt-1 px-2" id="sub-menu-2">
        <li><a href="#" class="block rounded-md py-2 pl-9 pr-2 text-sm leading-6 text-gray-400 hover:bg-gray-50">from Binary</a></li>
        <li><a href="#" class="block rounded-md py-2 pl-9 pr-2 text-sm leading-6 text-gray-400 hover:bg-gray-50">from RUBE</a></li>
      </ul>
    </div>

    {/* EXPORT */}
    <div>
      <button onClick={() => setExportOpen(!exportOpen())} class="btn-menu-item">
        <i class="material-icons text-stone-600">folder_open</i>Export
        <i class="material-icons ml-auto size-5 shrink-0 text-gray-400" >{exportOpen() ? 'expand_less' : 'expand_more'}</i>
      </button>
      <ul classList={{hidden: !exportOpen()}} class="mt-1 px-2" id="sub-menu-2">
        <li><a href="#" class="block rounded-md py-2 pl-9 pr-2 text-sm leading-6 text-gray-400 hover:bg-gray-50">as Binary</a></li>
        <li><a href="#" class="block rounded-md py-2 pl-9 pr-2 text-sm leading-6 text-gray-400 hover:bg-gray-50">as RUBE</a></li>
      </ul>
    </div>

    <div class='my-2 h-[1px] bg-stone-500' />

    {/* EXIT */}
    <button class="btn-menu-item mb-4 mt-auto">
      <i class="material-icons text-stone-600">exit_to_app</i>Exit
    </button>
  </>;
};

const MenuEdit: Component = () => {
  return <>
    <button class="btn-menu-item">
      <i class="material-icons text-stone-600">undo</i>Undo
    </button>
    <button class="btn-menu-item">
      <i class="material-icons text-stone-600">redo</i>Redo
    </button>

    <div class='my-2 h-[1px] bg-stone-500' />

    <button class="btn-menu-item">
      <i class="material-icons text-stone-600">content_copy</i>Copy
    </button>
    <button class="btn-menu-item">
      <i class="material-icons text-stone-600">content_paste</i>Paste
    </button>

  </>;
};

const MenuView: Component = () => {
  return <div>View</div>;
};

const MenuActions: Component = () => {
  return <div>Actions</div>;
};

const MenuHelp: Component = () => {
  return <>
    <button class="btn-menu-item" onClick={() => setActiveDialog('Help')}>
      <i class="material-icons text-stone-600">help_outline</i>Open Help Docs
    </button>
    <a class="btn-menu-item" href='https://github.com/andreas-schoch/snowboarding-game/discussions' target="_blank" rel='noopener'>
      <i class="material-icons text-stone-600">forum</i>Forum
    </a>
    <button class="btn-menu-item">
      <i class="material-icons text-stone-600">info</i>About
    </button>
  </>;
};

const dialogNameMap: Record<DialogName, Component> = {
  Help: () => <div>Help</div>,
  About: () => <div>About</div>,
  Settings: () => <div>Settings</div>,
};

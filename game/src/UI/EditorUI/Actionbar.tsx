import {Component, ParentComponent, Show, createEffect, createSignal} from 'solid-js';
import {Dynamic, Portal} from 'solid-js/web';
import {ButtonIcon} from '../general/Button';

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

  // TODO how can I dynamically do this?
  // EditorInfo.observer.on('open_dialog', (content: Component) => dialogRef.innerHTML = dialogContent());

  return <>
    <header class="absolute top-0 left-0 right-0 h-[76px] flex items-center bg-stone-900 border-stone-600 border-b text-white">

      <div class="w-14 h-14 ml-2 mr-4 bg-stone-800 border border-stone-600 rounded-full hover:bg-stone-700 cursor-pointer">
        <img src="/assets/img/logo.png" class="size-full  hover:scale-105" alt='logo goto main menu' />
      </div>

      <div class="flex flex-col pt-2 h-full">
        <div contentEditable class="p-1 border border-transparent transition-all hover:border-stone-600 rounded-sm text-sm">Dummy Level Name"</div>

        <ul class="mt-auto pr-5 flex gap-x-6 items-center">
          <Menu name="File" activeName={activeMenu()} setActive={setMenu}><MenuFile /></Menu>
          <Menu name="Edit" activeName={activeMenu()} setActive={setMenu}><MenuEdit /></Menu>
          <Menu name="View" activeName={activeMenu()} setActive={setMenu}><MenuView /></Menu>
          <Menu name="Actions" activeName={activeMenu()} setActive={setMenu}><MenuActions /></Menu>
          <Menu name="Help" activeName={activeMenu()} setActive={setMenu}><MenuHelp /></Menu>

          {/* <ButtonBorderless class="actionbar-menu-btn" onClick={() => setMenu('menu-actions')} ref={el => menuBtnActions = el}>Actions</ButtonBorderless>
          <ButtonBorderless class="actionbar-menu-btn" onClick={() => setMenu('menu-help')} ref={el => menuBtnHelp = el}>Help</ButtonBorderless> */}
        </ul>

      </div>

      <ButtonIcon icon='play_arrow' class="text-green-700 !text-4xl !mx-auto" />
      <ButtonIcon icon='cloud_upload' />
    </header>

    <Portal>
      <div class="absolute inset-0 z-[2000]" classList={{hidden: activeMenu() === null}} onClick={() => setMenu(null)} />

      <Show when={activeDialog() !== null}>
        <div class="absolute inset-0 z-index-[3000] bg-stone-950 opacity-75" onClick={() => setActiveDialog(null)} />
        <div class="absolute w-[500px] h-[500px] bg-stone-800 rounded-lg border border-stone-600 z-[3001] top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]">
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
      <div classList={{hidden: !isOpen()}} class="top-[32px] left-[-10px] absolute w-[350px] min-h-fit bg-stone-900 p-3 z-[2001] border border-t-0 border-stone-600 rounded-b-lg flex grow flex-col gap-y-1 overflow-y-auto" >
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
        <i class="material-icons text-gray-400 ml-auto h-5 w-5 shrink-0" >{recentOpen() ? 'expand_less' : 'expand_more'}</i>
      </button>
      <ul classList={{hidden: !recentOpen()}} class="mt-1 px-2" id="sub-menu-2">
        <li><div class="hover:bg-gray-50 block rounded-md py-2 pr-2 pl-9 text-sm leading-6 text-gray-400">Level 001</div></li>
        <li><div class="hover:bg-gray-50 block rounded-md py-2 pr-2 pl-9 text-sm leading-6 text-gray-400">Level 002</div></li>
        <li><div class="hover:bg-gray-50 block rounded-md py-2 pr-2 pl-9 text-sm leading-6 text-gray-400">Level 003</div></li>
        <li><div class="hover:bg-gray-50 block rounded-md py-2 pr-2 pl-9 text-sm leading-6 text-gray-400">Level 004</div></li>
      </ul>
    </div>

    <div class='bg-stone-500 h-[1px] my-2' />

    {/* SAVE */}
    <button class="btn-menu-item">
      <i class="material-icons text-stone-600">save</i>Save
    </button>

    {/* SAVE AS NEW */}
    <button class="btn-menu-item">
      <i class="material-icons text-stone-600">save</i>Save as New
    </button>

    <div class='bg-stone-500 h-[1px] my-2' />

    {/* IMPORT */}
    <div>
      <button onClick={() => setImportOpen(!importOpen())} class="btn-menu-item">
        <i class="material-icons text-stone-600">folder_open</i>Import
        <i class="material-icons text-gray-400 ml-auto h-5 w-5 shrink-0" >{importOpen() ? 'expand_less' : 'expand_more'}</i>
      </button>
      <ul classList={{hidden: !importOpen()}} class="mt-1 px-2" id="sub-menu-2">
        <li><a href="#" class="hover:bg-gray-50 block rounded-md py-2 pr-2 pl-9 text-sm leading-6 text-gray-400">from Binary</a></li>
        <li><a href="#" class="hover:bg-gray-50 block rounded-md py-2 pr-2 pl-9 text-sm leading-6 text-gray-400">from RUBE</a></li>
      </ul>
    </div>

    {/* EXPORT */}
    <div>
      <button onClick={() => setExportOpen(!exportOpen())} class="btn-menu-item">
        <i class="material-icons text-stone-600">folder_open</i>Export
        <i class="material-icons text-gray-400 ml-auto h-5 w-5 shrink-0" >{exportOpen() ? 'expand_less' : 'expand_more'}</i>
      </button>
      <ul classList={{hidden: !exportOpen()}} class="mt-1 px-2" id="sub-menu-2">
        <li><a href="#" class="hover:bg-gray-50 block rounded-md py-2 pr-2 pl-9 text-sm leading-6 text-gray-400">as Binary</a></li>
        <li><a href="#" class="hover:bg-gray-50 block rounded-md py-2 pr-2 pl-9 text-sm leading-6 text-gray-400">as RUBE</a></li>
      </ul>
    </div>

    <div class='bg-stone-500 h-[1px] my-2' />

    {/* EXIT */}
    <button class="mt-auto mb-4 btn-menu-item">
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

    <div class='bg-stone-500 h-[1px] my-2' />

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

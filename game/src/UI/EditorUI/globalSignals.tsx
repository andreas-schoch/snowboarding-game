import {Component, createSignal} from 'solid-js';
import {ILevel, ILevelNew} from '../../levels';
import {EditorItems, EditorItem} from '../../physics/RUBE/RubeMetaLoader';
import {generateEmptyRubeFile, generateNewLevel} from '../../physics/RUBE/generateEmptyRubeFile';
import {BrowserItem} from './Browser';
import {OpenLevel} from './dialogs/OpenLevel';

// For now I decided to keep it simple and have global signals despite them being discouraged in SolidJS
// I don't want to pass signals as props and I don't want to use context or state for this just yet
// Also for now I always want changes to be detected when calling the setter. Will change this only if it becomes a problem

export const initial: EditorItems = {
  rubefile: generateEmptyRubeFile(), // TODO maybe bettet to already use registerNewLevel() here?
  level: generateNewLevel(),
  object: {},
  terrain: {},
  sensor: {},
  image: {},
  // fixture: {},
};

export const [recentLevels, setRecentLevels] = createSignal<(ILevel | ILevelNew)[]>([]);
export const [editorItems, setEditorItems] = createSignal<EditorItems>(initial, {equals: false});
export const [selected, setSelected] = createSignal<EditorItem | null>(null, {equals: false});
export const [activeBrowserItem, setActiveBrowserItem] = createSignal<BrowserItem | null>(null, {equals: false});

export type DialogName = 'Help' | 'About' | 'Settings' | 'Open Level';
export const [activeDialogName, setActiveDialogName] = createSignal<DialogName | null>(null);
export const activeDialog = () => activeDialogName() && dialogNameMap[activeDialogName()!];

export const dialogNameMap: Record<DialogName, Component> = {
  Help: () => <div>Help</div>,
  About: () => <div>About</div>,
  Settings: () => <div>Settings</div>,
  'Open Level': () => <OpenLevel />,
};

export const iconMap: Record<EditorItem['type'], string> = {
  object: 'view_in_ar',
  terrain: 'terrain',
  image: 'wallpaper',
  sensor: 'border_clear',
  // fixture: 'NOT_DIRECTLY_DISPLAYED_IN_UI',
};

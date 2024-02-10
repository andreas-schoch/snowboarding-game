import {Component, createSignal} from 'solid-js';
import {EditorItem} from '../../physics/RUBE/RubeMetaLoader';
import {ItemProperties} from './ItemProperties';
import {ItemExplorer} from './SceneExplorer';

export const EditorUI: Component = () => {
  const [selected, setSelected] = createSignal<EditorItem | null>(null);
  return <>
    <ItemExplorer selected={selected()} setSelected={setSelected} />
    <ItemProperties selected={selected()} />
  </>;
};

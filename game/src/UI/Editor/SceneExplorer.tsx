import './SceneExplorer.css';
import {Component, For, createSignal} from 'solid-js';
import {GameInfo} from '../../GameInfo';
import {RUBE_SCENE_LOADED} from '../../eventTypes';
import {MetaBody, MetaImage, MetaObject, RubeFile} from '../../physics/RUBE/RubeFile';

export const SceneExplorer = () => {
  const [rube, setRube] = createSignal<RubeFile | null>(null);
  const metaObjects = () => rube()?.metaworld?.metaobject;
  const metaBodies = () => rube()?.metaworld?.metabody;
  const metaImages = () => rube()?.metaworld?.metaimage;

  GameInfo.observer.on(RUBE_SCENE_LOADED, (scene: RubeFile) => {
    console.log('SceneExplorer on RUBE_SCENE_LOADED', scene, scene.metaworld.metaobject);
    setRube(scene);
  });

  return (
    <div class="pane" id="pane-scene-items">
      <div class="pane-title">Scene Items</div>

      <div class="scene-items-scrollable scrollbar" id="scene-items-container" >

        <For each={metaObjects()} fallback={<div>Empty</div>}>
          {(metaObject) => <ExplorerItem item={metaObject} icon='data_object' />}
        </For>

        <For each={metaBodies()} fallback={<div>Empty</div>}>
          {(metaBody) => <ExplorerItem item={metaBody} icon='window' />}
        </For>

        <For each={metaImages()} fallback={<div>Empty</div>}>
          {(metaImage) => <ExplorerItem item={metaImage} icon='wallpaper' />}
        </For>

      </div>
    </div>
  );
};

const ExplorerItem: Component<{item: MetaBody | MetaImage | MetaObject, icon: 'window' | 'border_clear' | 'polyline' | 'wallpaper' | 'view_in_ar' | 'data_object'}> = props => <>
  <div class="scene-item-wrapper">
    <div class="scene-item">
      <i class="material-icons scene-item-collapse invisible">expand_more</i>
      <i class="scene-item-type-icon material-icons">{props.icon}</i>
      <div class="scene-item-name">{props.item.name}</div>
    </div>
    <div class="scene-item-children hidden" />
  </div>
</>;

// TODO add custom prop "groupId", get list of all groupIds, show Items within collapsable groups, then the rest of ungrouped ones

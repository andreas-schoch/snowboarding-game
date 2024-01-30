import './SceneExplorer.css';
import {onMount} from 'solid-js';
import {b2, recordLeak} from '../..';
import {GameInfo} from '../../GameInfo';
import {BodyEntityData, Entity} from '../../physics/RUBE/RubeLoader';

export const SceneExplorer = () => {
  const physics = GameInfo.physics;

  onMount(() => {
    const sceneItemsContainer = document.getElementById('scene-items-container');
    if (!sceneItemsContainer) throw new Error('no container for scene items');
    // BODY and nested FIXTURES, JOINTS, IMAGES
    for (let body = recordLeak(physics.world.GetBodyList()); b2.getPointer(body) !== b2.getPointer(b2.NULL); body = recordLeak(body.GetNext())) {
      if (!body) continue;
      const sceneItemBody = createSceneItem(body, 'body');
      const sceneItemChildren = sceneItemBody.querySelector('.scene-item-children');
      if (!sceneItemChildren) throw new Error('no container for scene item children');
      for (let f = body.GetFixtureList(); f; f = f.GetNext()) sceneItemChildren.appendChild(createSceneItem(f, 'fixture', body));
      for (let j = body.GetJointList(); j; j = j.next) sceneItemChildren.appendChild(createSceneItem(j.joint, 'joint', body));
      const bodyEntityData = physics.loader.entityData.get(body) as BodyEntityData | undefined;
      const image = bodyEntityData?.image;
      if (image) sceneItemChildren.appendChild(createSceneItem(image, 'image', body));
      if (sceneItemBody.querySelector('.scene-item-children')?.children.length) sceneItemBody.querySelector('.scene-item-collapse')?.classList.remove('invisible');
      sceneItemsContainer.appendChild(sceneItemBody);
    }
  });

  const createSceneItem = (entity: Entity, type: 'body' | 'fixture' | 'joint' | 'image', parent?: Entity): HTMLElement => {
    const typeToIconMap = {
      body: 'window',
      fixture: 'border_clear',
      joint: 'polyline',
      image: 'wallpaper',
    };

    const entityData = physics.loader.entityData.get(entity);
    const parentEntityData = physics.loader.entityData.get(parent);
    if (!entityData) throw new Error('no entity data');
    if (parent && !parentEntityData) throw new Error('no parent entity data');

    const sceneItemTemplate: HTMLTemplateElement | null = document.getElementById('scene-item-template') as HTMLTemplateElement;
    const clone: HTMLElement = sceneItemTemplate.content.cloneNode(true) as HTMLElement;
    const sceneItem: HTMLElement | null = clone.querySelector('.scene-item');
    if (!sceneItem) throw new Error('no scene item');
    if (parent && parentEntityData) sceneItem.dataset.parentId = parentEntityData.id;
    sceneItem.dataset.id = entityData.id;
    sceneItem.dataset.type = type;
    const cloneElName = clone.querySelector('.scene-item-name');
    const cloneElIcon = clone.querySelector('.scene-item-type-icon');
    const name = entityData.name;
    if (cloneElName) cloneElName.innerHTML = name || type;
    if (cloneElIcon) cloneElIcon.innerHTML = typeToIconMap[type];
    return clone;
  };

  return (
    <div class="pane" id="pane-scene-items">
      <div class="pane-title">Scene Items</div>

      <template id="scene-item-template">
        <div class="scene-item-wrapper">
          <div class="scene-item">
            <i class="material-icons scene-item-collapse invisible">expand_more</i>
            <i class="scene-item-type-icon material-icons">window</i>
            <div class="scene-item-name">Body 001</div>
          </div>
          <div class="scene-item-children hidden" />
        </div>
      </template>

      <div class="scene-items-scrollable scrollbar" id="scene-items-container" />
    </div>
  );
};

// export const SceneItem = (props: {entity: Entity}) => <>
//   <div class="scene-item-wrapper">
//     <div class="scene-item">
//       <i class="material-icons scene-item-collapse invisible">expand_more</i>
//       <i class="scene-item-type-icon material-icons">window</i>
//       <div class="scene-item-name">Body 001</div>
//     </div>
//     <div class="scene-item-children hidden" />
//   </div>
// </>;

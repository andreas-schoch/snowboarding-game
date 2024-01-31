import './SceneExplorer.css';
import {b2, recordLeak} from '../..';
import {GameInfo} from '../../GameInfo';
import {EDITOR_SCENE_LOADED} from '../../eventTypes';
import {BodyEntityData, Entity} from '../../physics/RUBE/RubeLoader';

export const SceneExplorer = () => {
  const physics = GameInfo.physics;
  GameInfo.observer.on(EDITOR_SCENE_LOADED, id => {
    console.log('--------------------EDITOR_SCENE_LOADED', id);
    refresh();
  });

  const refresh = () => {
    const sceneItemsContainer = document.getElementById('scene-items-container');
    if (!sceneItemsContainer) throw new Error('no container for scene items');
    // BODY and nested FIXTURES, JOINTS, IMAGES
    for (let body = recordLeak(physics.world.GetBodyList()); b2.getPointer(body) !== b2.getPointer(b2.NULL); body = recordLeak(body.GetNext())) {
      if (!body) continue;
      const sceneItemBody = createSceneItem(body, 'body');
      const sceneItemChildren = sceneItemBody.querySelector('.scene-item-children');
      if (!sceneItemChildren) throw new Error('no container for scene item children');

      for (let f = recordLeak(body.GetFixtureList()); b2.getPointer(f) !== b2.getPointer(b2.NULL); f = recordLeak(f.GetNext())) {
        sceneItemChildren.appendChild(createSceneItem(f, 'fixture', body));
      }

      for (let j = recordLeak(body.GetJointList()); b2.getPointer(j) !== b2.getPointer(b2.NULL); j = recordLeak(j.next)) {
        sceneItemChildren.appendChild(createSceneItem(j.joint, 'joint', body));
      }

      const bodyEntityData = physics.loader.entityData.get(body) as BodyEntityData | undefined;
      const image = bodyEntityData?.image;
      if (image) sceneItemChildren.appendChild(createSceneItem(image, 'image', body));
      if (sceneItemBody.querySelector('.scene-item-children')?.children.length) sceneItemBody.querySelector('.scene-item-collapse')?.classList.remove('invisible');
      sceneItemsContainer.appendChild(sceneItemBody);
    }
  };

  const handleClick = (evt: Event) => {
    const target = evt.target as HTMLElement;
    if (target.classList.contains('scene-item-collapse')) handleCollapseEntity(target);
    // else if (target.classList.contains('scene-item-name')) this.handleSelectEntity(target);
    // else if (target.classList.contains('context')) this.handleSwitchContext(target);
    // else console.log('clicked unknown target', target);
  // })
  };

  const handleCollapseEntity = (target: HTMLElement, forceExpand?: boolean) => {
    const children = target.parentElement?.parentElement?.querySelector('.scene-item-children');
    if (!children) return;
    const isHidden = children.classList.contains('hidden');

    if (forceExpand && isHidden) children.classList.remove('hidden');
    else children.classList.toggle('hidden');

    target.innerHTML = isHidden || forceExpand ? 'expand_more' : 'expand_less';
  };

  const createSceneItem = (entity: Entity, type: 'body' | 'fixture' | 'joint' | 'image', parent?: Entity): HTMLElement => {
    const typeToIconMap = {
      body: 'window',
      fixture: 'border_clear',
      joint: 'polyline',
      image: 'wallpaper',
    };

    const entityData = physics.loader.entityData.get(entity);
    const parentEntityData = physics.loader.entityData.get(parent);
    console.log('entityData', entityData, entity, type);
    if (!entityData) {
      const fixture = entity as Box2D.b2Fixture;
      const body = fixture.GetBody();
      const bodyEntityData = physics.loader.entityData.get(body);
      console.log('---------------------- bodyEntityData of broken fixture', bodyEntityData);

      throw new Error('no entity data');
    }
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
    <div class="pane" id="pane-scene-items" onClick={evt => handleClick(evt)}>
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

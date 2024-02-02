import './SceneExplorer.css';
import {GameInfo} from '../../GameInfo';
import {RUBE_SCENE_LOADED} from '../../eventTypes';
import {iterBodies, iterBodyFixtures, iterBodyJoints} from '../../helpers/B2Iterators';
import {Entity, EntityData} from '../../physics/RUBE/otherTypes';

export const SceneExplorer = () => {
  const physics = GameInfo.physics;
  const entityDataMap = physics.loader.entityData;

  GameInfo.observer.on(RUBE_SCENE_LOADED, scene => {
    refresh(scene.id);
  });

  // TODO use the scene passed to the event to populate the scene explorer instead of iterating over bodies. 
  // For now the loaded in scene is passed but it should actually be the .rube file from the metaObject or terrain
  // Maybe the terrain can also be of .rube but we use it as a template to parametrize the points and if it is line or loop?
  // Maybe make it so that instead of a file path it has an inlined MetaBody[]? 
  const refresh = (sceneId: string) => {
    // TODO update this legacy code to use SolidJS properly and show a loaded scene as a single item in the explorer
    // This code was mostly written 9 months ago when I had the intention to make a generic editor and only used vanilla js for the UI...
    // For my game's editor I don't want to burden level creators with the concept of bodies, fixtures, joints, etc.
    // I will create "prefabs" in the RUBE editor which will be shown as a single item in the scene explorer.
    // At some point (and if there is demand) I may want to make the creation of prefabs possible within the game.
    console.debug('refreshing SceneExplorer. New scene id', sceneId);
    const sceneItemsContainer = document.getElementById('scene-items-container');
    if (!sceneItemsContainer) throw new Error('no container for scene items');

    // BODIES
    for (const body of iterBodies(physics.worldEntity.world)) {
      const bodyEntity = entityDataMap.get(body);
      if (!bodyEntity || bodyEntity.type !== 'body') throw new Error('no body entity data');
      const sceneItemBody = createSceneItem(bodyEntity, 'body');

      const sceneItemChildren = sceneItemBody.querySelector('.scene-item-children');
      if (!sceneItemChildren) throw new Error('no container for scene item children');

      // FIXTURES
      for (const fixture of iterBodyFixtures(body)) {
        const fixtureEntity = entityDataMap.get(fixture);
        sceneItemChildren.appendChild(createSceneItem(fixtureEntity, 'fixture', body));
      }

      // JOINTS
      for (const joint of iterBodyJoints(body)) {
        const jointEntity = entityDataMap.get(joint);
        console.log('jointEntity', jointEntity, joint);
        sceneItemChildren.appendChild(createSceneItem(jointEntity, 'joint', body));
      }

      // IMAGES
      const imageEntity = bodyEntity.image;
      if (imageEntity) sceneItemChildren.appendChild(createSceneItem(imageEntity, 'image', body));

      if (sceneItemBody.querySelector('.scene-item-children')?.children.length) sceneItemBody.querySelector('.scene-item-collapse')?.classList.remove('invisible');
      sceneItemsContainer.appendChild(sceneItemBody);
    }

    // TODO images without body
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

  const createSceneItem = (entityData: EntityData | undefined, type: 'body' | 'fixture' | 'joint' | 'image', parent?: Entity): HTMLElement => {
    const typeToIconMap = {
      body: 'window',
      fixture: 'border_clear',
      joint: 'polyline',
      image: 'wallpaper',
    };

    const parentEntityData = entityDataMap.get(parent);
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

import './SceneExplorer.css';
import {GameInfo} from '../../GameInfo';
import {RUBE_SCENE_LOADED} from '../../eventTypes';
import {iterBodyFixtures, iterBodyJoints} from '../../helpers/B2Iterators';
import {Entity, EntityData, LoadedScene} from '../../physics/RUBE/otherTypes';

export const SceneExplorer = () => {
  GameInfo.observer.on(RUBE_SCENE_LOADED, scene => {
    refresh(scene);
  });

  // TODO use the scene passed to the event to populate the scene explorer instead of iterating over bodies. 
  // For now the loaded in scene is passed but it should actually be the .rube file from the metaObject or terrain
  // Maybe the terrain can also be of .rube but we use it as a template to parametrize the points and if it is line or loop?
  // Maybe make it so that instead of a file path it has an inlined MetaBody[]? 
  const refresh = (loadedScene: LoadedScene) => {
    // TODO update this legacy code to use SolidJS properly and show a loaded scene as a single item in the explorer
    // This code was mostly written 9 months ago when I had the intention to make a generic editor and only used vanilla js for the UI...
    // For my game's editor I don't want to burden level creators with the concept of bodies, fixtures, joints, etc.
    // I will create "prefabs" in the RUBE editor which will be shown as a single item in the scene explorer.
    // At some point (and if there is demand) I may want to make the creation of prefabs possible within the game.
    console.debug('refreshing SceneExplorer. New scene id', loadedScene.id);
    const sceneItemsContainer = document.getElementById('scene-items-container');
    if (!sceneItemsContainer) throw new Error('no container for scene items');

    const worldEntityData = loadedScene.worldEntity.entityData;

    // BODIES
    for (const {body} of loadedScene.bodies) {
      const sceneItemBody = createSceneItem(loadedScene, body);

      const sceneItemChildren = sceneItemBody.querySelector('.scene-item-children');
      if (!sceneItemChildren) throw new Error('no container for scene item children');

      // FIXTURES
      for (const fixture of iterBodyFixtures(body)) {
        sceneItemChildren.appendChild(createSceneItem(loadedScene, fixture, body));
      }

      // JOINTS
      for (const joint of iterBodyJoints(body)) {
        sceneItemChildren.appendChild(createSceneItem(loadedScene, joint, body));
      }

      // IMAGES
      const bodyEntity = worldEntityData.get(body);
      if (!bodyEntity || bodyEntity.type !== 'body') throw new Error('no body entity');
      const imageEntity = bodyEntity.image;
      if (imageEntity) sceneItemChildren.appendChild(createSceneItem(loadedScene, imageEntity.image, body));

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

  const createSceneItem = (loadedScene: LoadedScene, item: Entity, parentItem?: Entity): HTMLElement => {
    const itemEntityData = loadedScene.entityData.get(item);
    if (!itemEntityData) throw new Error('no entity data');

    const parentEntityData = parentItem ? loadedScene.entityData.get(parentItem) : undefined;
    if (parentItem && !parentEntityData) throw new Error('no parent entity data');

    const typeToIconMap: Record<EntityData['type'], string> = {
      body: 'window',
      fixture: 'border_clear',
      joint: 'polyline',
      image: 'wallpaper',
    };

    const sceneItemTemplate: HTMLTemplateElement | null = document.getElementById('scene-item-template') as HTMLTemplateElement;
    const clone: HTMLElement = sceneItemTemplate.content.cloneNode(true) as HTMLElement;
    const sceneItem: HTMLElement | null = clone.querySelector('.scene-item');
    if (!sceneItem) throw new Error('no scene item');
    if (parent && parentEntityData) sceneItem.dataset.parentId = parentEntityData.id;
    sceneItem.dataset.id = itemEntityData.id;
    sceneItem.dataset.type = itemEntityData.type;
    const cloneElName = clone.querySelector('.scene-item-name');
    const cloneElIcon = clone.querySelector('.scene-item-type-icon');
    const name = itemEntityData.name;
    if (cloneElName) cloneElName.innerHTML = name || itemEntityData.type;
    if (cloneElIcon) cloneElIcon.innerHTML = typeToIconMap[itemEntityData.type];
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

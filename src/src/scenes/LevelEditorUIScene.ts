import * as Ph from "phaser";
import * as Pl from '@box2d/core';
import {DEFAULT_WIDTH, SceneKeys} from "../index";
import {Physics} from "../components/Physics";
import {RubeBody, RubeEntity, RubeImage} from "../util/RUBE/RubeLoaderInterfaces";
import {DraggableInput} from "../components/web/DraggableInput";

export class LevelEditorUIScene extends Ph.Scene {
  private b2Physics: Physics;
  private resolutionMod: number;
  private mainScene: Phaser.Scene;

  constructor() {
    super({key: SceneKeys.LEVEL_EDITOR_UI_SCENE});
  }

  init([physics, mainScene]: [Physics, Ph.Scene]) {
    this.resolutionMod = this.game.canvas.width / DEFAULT_WIDTH;
    this.b2Physics = physics;
    this.mainScene = mainScene;
  }

  create() {
    const el = this.initUI();
    el.pointerEvents = 'none';

    // this.game.canvas.addEventListener('contextmenu', (e) => {
    //   console.log('---------context canvas');
    //   e.preventDefault();
    // });
    //
    // el.on('contextmenu', (e) => {
    //   console.log('---------context');
    //   e.preventDefault();
    // });

    document.getElementById('phaser-wrapper')?.addEventListener('contextmenu', e => this.handleContextMenu(e));
  }


  private initUI(): Ph.GameObjects.DOMElement {
    const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

    const element = this.add.dom(screenCenterX, screenCenterY, 'div', 'pointer-events: none;').createFromCache('dom_level_editor_ui');
    element.setScale(this.resolutionMod).addListener('click pointerdown pointerup pointermove');

    const sceneItemsContainer = document.getElementById('scene-items-container');
    if (!sceneItemsContainer) throw new Error('no container for scene items');
    // BODY and nested FIXTURES, JOINTS, IMAGES
    for (let body = this.b2Physics.world.GetBodyList(); body; body = body.GetNext()) {
      const sceneItemBody = this.createSceneItem(body as RubeEntity, 'body');
      const sceneItemChildren = sceneItemBody.querySelector('.scene-item-children');
      if (!sceneItemChildren) throw new Error('no container for scene item children');
      for (let fixture = body.GetFixtureList(); fixture; fixture = fixture.GetNext()) sceneItemChildren.appendChild(this.createSceneItem(fixture as RubeEntity, 'fixture'));
      for (let je = body.GetJointList(); je; je = je.next) sceneItemChildren.appendChild(this.createSceneItem(je.joint as RubeEntity, 'joint'));
      let bodyRepresentation = body.GetUserData() as Ph.GameObjects.Image;
      if (bodyRepresentation) sceneItemChildren.appendChild(this.createSceneItem(bodyRepresentation, 'image'));
      if (sceneItemBody.querySelector('.scene-item-children')?.children.length) sceneItemBody.querySelector('.scene-item-collapse')?.classList.remove('invisible');
      sceneItemsContainer.appendChild(sceneItemBody);
    }

    // IMAGES WITHOUT BODY
    // @ts-ignore
    const imagesWithoutBody = this.mainScene.children.list.filter(child => child.type === 'Image' && !child.b2Body);
    for (let image of imagesWithoutBody) sceneItemsContainer.appendChild(this.createSceneItem(image, 'image'));

    element.on('click', async (evt) => {
      const target = evt.target as HTMLElement;
      if (target.classList.contains('scene-item-collapse')) this.handleCollapseEntity(target);
      else if (target.classList.contains('scene-item-name')) this.handleSelectEntity(target);
    });

    return element;
  }

  private createSceneItem(entity: RubeEntity, type: 'body' | 'fixture' | 'joint' | 'image'): HTMLElement {
    const typeToIconMap = {
      body: 'window',
      fixture: 'border_clear',
      joint: 'polyline',
      image: 'wallpaper',
    };

    const sceneItemTemplate: HTMLTemplateElement | null = document.getElementById('scene-item-template') as HTMLTemplateElement;
    const clone: HTMLElement = sceneItemTemplate.content.cloneNode(true) as HTMLElement;
    const sceneItem: HTMLElement | null = clone.querySelector('.scene-item');
    if (!sceneItem) throw new Error('no scene item');
    sceneItem.dataset.id = entity.id;
    sceneItem.dataset.type = type;
    const cloneElName = clone.querySelector('.scene-item-name');
    const cloneElIcon = clone.querySelector('.scene-item-type-icon');
    if (cloneElName) cloneElName.innerHTML = entity.name || type;
    if (cloneElIcon) cloneElIcon.innerHTML = typeToIconMap[type];
    return clone;
  }

  private handleCollapseEntity(target: HTMLElement) {
    const children = target.parentElement?.parentElement?.querySelector('.scene-item-children');
    if (children) children.classList.toggle('hidden');
    target.innerHTML = children?.classList.contains('hidden') ? 'expand_more' : 'expand_less';
  }

  private handleSelectEntity(target: HTMLElement) {
    if (!target.parentElement) return;
    const sceneItems = document.querySelectorAll('.scene-item');
    sceneItems.forEach((el) => el === target.parentElement ? el.classList.toggle('selected') : el.classList.remove('selected'));
    this.handleUpdatePropertiesPane(target.parentElement);
  }


  private handleContextMenu(e: MouseEvent) {
    e.preventDefault();
    console.log('---------context');

    // // detect which element was clicked
    // const element: HTMLElement | null = e.target;
    //
    // // if element is scene-item, get the type and get properties for it
    // if (element?.classList.contains('scene-item')) {
    //   const type = element.dataset.type;
    //   const id = element.dataset.id;
    //   if (!type || !id) return;
    //   const entity = this.b2Physics.rubeLoader.getEntityById(id);
    //   if (!entity) return;
    //   const properties = this.getEntityProperties(entity, type);
    //   console.log('---------properties', properties);
    // }

  }

  private handleUpdatePropertiesPane(parentElement: HTMLElement | null) {
    const propertiesContainer = document.querySelector('#pane-item-properties .pane-item-properties-container');
    if (!propertiesContainer) throw new Error('no container for scene item properties');
    propertiesContainer.innerHTML = '';
    if (!parentElement?.classList.contains('selected')) return;
    if (!parentElement?.dataset.type || !parentElement.dataset.id) return;
    const type = parentElement.dataset.type;

    switch (type) {
      case 'body': {
        const body = this.b2Physics.rubeLoader.getBodyById(parentElement.dataset.id);
        if (!body) return;
        const template: HTMLTemplateElement | null = document.getElementById('scene-item-body-properties-template') as HTMLTemplateElement;
        const clone: HTMLElement = template.content.cloneNode(true) as HTMLElement;
        propertiesContainer.appendChild(clone);
        (propertiesContainer.querySelector('#property-type') as HTMLSelectElement).setAttribute('value', String(body.GetType()));
        (propertiesContainer.querySelector('#property-name') as HTMLInputElement).setAttribute('value', String(body.name || ''));
        (propertiesContainer.querySelector('#property-linear-damping') as DraggableInput).setAttribute('value', String(body.GetLinearDamping()));
        (propertiesContainer.querySelector('#property-angular-damping') as HTMLInputElement).setAttribute('value', String(body.GetAngularDamping()));
        (propertiesContainer.querySelector('#property-mass') as HTMLInputElement).setAttribute('value', String(body.GetMass()));
        (propertiesContainer.querySelector('#property-gravity-scale') as HTMLInputElement).setAttribute('value', String(body.GetGravityScale()));
        const pos = body.GetPosition();
        const propPosX = (propertiesContainer.querySelector('#property-position-x') as HTMLInputElement)
        propPosX.setAttribute('value', String(pos.x));
        propPosX.addEventListener('change', e => body.SetTransformXY(Number((e.target as DraggableInput).valueInput.value), pos.y, body.GetAngle()));
        const propPosY = (propertiesContainer.querySelector('#property-position-y') as HTMLInputElement)
        propPosY.setAttribute('value', String(pos.y));
        propPosY.addEventListener('change', e => body.SetTransformXY(pos.x, Number((e.target as DraggableInput).valueInput.value), body.GetAngle()));
        (propertiesContainer.querySelector('#property-angle') as HTMLInputElement).setAttribute('value', String(body.GetAngle()));
        const linVel = body.GetLinearVelocity();
        (propertiesContainer.querySelector('#property-linear-velocity-x') as HTMLInputElement).setAttribute('value', String(linVel.x));
        (propertiesContainer.querySelector('#property-linear-velocity-y') as HTMLInputElement).setAttribute('value', String(linVel.y));
        (propertiesContainer.querySelector('#property-angular-velocity') as HTMLInputElement).setAttribute('value', String(body.GetAngularVelocity()));
        (propertiesContainer.querySelector('#property-bullet') as HTMLInputElement).checked = body.IsBullet();
        (propertiesContainer.querySelector('#property-fixed-rotation') as HTMLInputElement).checked = body.IsFixedRotation();
        (propertiesContainer.querySelector('#property-sleeping-allowed') as HTMLInputElement).checked = body.IsSleepingAllowed();
        (propertiesContainer.querySelector('#property-awake') as HTMLInputElement).checked = body.IsAwake();
        (propertiesContainer.querySelector('#property-active') as HTMLInputElement).checked = body.IsEnabled();

        const form = propertiesContainer.querySelector('#form-properties') as HTMLFormElement;
        form.addEventListener('change', console.log);

        const formData = new FormData(form);
        formData.forEach((value, key) => console.log(key, value));
        debugger;

        break;
      }
      case 'fixture': {
        const fixture = this.b2Physics.rubeLoader.getFixtureById(parentElement.dataset.id);
        if (!fixture) return;
        const template: HTMLTemplateElement | null = document.getElementById('scene-item-fixture-properties-template') as HTMLTemplateElement;
        const clone: HTMLElement = template.content.cloneNode(true) as HTMLElement;
        (clone.querySelector('#property-name') as HTMLSelectElement).value = String(fixture.name || 'Fixture');
        (clone.querySelector('#property-friction') as HTMLSelectElement).value = String(fixture.GetFriction());
        (clone.querySelector('#property-restitution') as HTMLSelectElement).value = String(fixture.GetRestitution());
        (clone.querySelector('#property-density') as HTMLSelectElement).value = String(fixture.GetDensity());
        (clone.querySelector('#property-filter-category-bits') as HTMLSelectElement).value = String(fixture.GetFilterData().categoryBits);
        (clone.querySelector('#property-filter-mask-bits') as HTMLSelectElement).value = String(fixture.GetFilterData().maskBits);
        (clone.querySelector('#property-filter-group-index') as HTMLSelectElement).value = String(fixture.GetFilterData().groupIndex);
        propertiesContainer.appendChild(clone);
        break;
      }
      case 'joint': {
        const joint = this.b2Physics.rubeLoader.getJointById(parentElement.dataset.id);
        console.log('joint', joint, parentElement.dataset.id);
        if (!joint) return;
        const template: HTMLTemplateElement | null = document.getElementById('scene-item-joint-properties-template') as HTMLTemplateElement;
        const clone: HTMLElement = template.content.cloneNode(true) as HTMLElement;
        (clone.querySelector('#property-type') as HTMLSelectElement).value = String(joint.GetType());
        (clone.querySelector('#property-name') as HTMLInputElement).value = String(joint.name || 'Joint');
        // @ts-ignore
        (clone.querySelector('#property-body-a') as HTMLInputElement).value = String(joint.GetBodyA().name || 'Body A');
        // @ts-ignore
        (clone.querySelector('#property-body-b') as HTMLInputElement).value = String(joint.GetBodyB().name || 'Body B');
        (clone.querySelector('#property-anchor-a') as HTMLInputElement).value = String(joint.GetAnchorA({x: 0, y: 0}));
        (clone.querySelector('#property-anchor-b') as HTMLInputElement).value = String(joint.GetAnchorB({x: 0, y: 0}));
        (clone.querySelector('#property-collide-connected') as HTMLInputElement).value = String(joint.GetCollideConnected());
        propertiesContainer.appendChild(clone);
        break;
      }
      case 'image': {
        // @ts-ignore
        const image: Ph.GameObjects.Image = this.mainScene.children.list.find(child => child.type === 'Image' && child.id === parentElement.dataset.id);
        if (!image) return;

        // create from template
        const template: HTMLTemplateElement | null = document.getElementById('scene-item-image-properties-template') as HTMLTemplateElement;
        const clone: HTMLElement = template.content.cloneNode(true) as HTMLElement;
        // @ts-ignore
        (clone.querySelector('#property-name') as HTMLSelectElement).value = String(image.name || 'Image');
        // @ts-ignore
        (clone.querySelector('#property-body') as HTMLSelectElement).value = String(image.b2Body);
        // (clone.querySelector('#property-file') as HTMLInputElement).value = String(image.texture.key);
        // (clone.querySelector('#property-center') as HTMLSelectElement).value = String(image);
        // (clone.querySelector('#property-angle') as HTMLInputElement).value = image.originX
        (clone.querySelector('#property-height') as HTMLInputElement).value = String(image.height);
        // (clone.querySelector('#property-aspect-scale') as HTMLInputElement).value = String(image.aspectScale);
        (clone.querySelector('#property-opacity') as HTMLInputElement).value = String(image.alpha);
        (clone.querySelector('#property-flip') as HTMLInputElement).value = String(image.flipX);
        // (clone.querySelector('#property-filter') as HTMLInputElement).value = String(image.filter);
        (clone.querySelector('#property-render-order') as HTMLInputElement).value = String(image.depth);
        // (clone.querySelector('#property-color-tint') as HTMLInputElement).value = String(image.tint);
        propertiesContainer.appendChild(clone);
        break;
      }
    }
  }
}

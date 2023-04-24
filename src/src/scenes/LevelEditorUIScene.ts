import * as Ph from "phaser";
import * as Pl from '@box2d/core';
import {DEFAULT_WIDTH, SceneKeys} from "../index";
import {Physics} from "../components/Physics";
import {RubeEntity} from "../util/RUBE/RubeLoaderInterfaces";
import {DraggableInput} from "../components/web/DraggableInput";
import {getB2FixtureAtPoint} from "../util/getB2FixtureAtPoint";
import LevelEditorScene from "./LevelEditorScene";

export class LevelEditorUIScene extends Ph.Scene {
  private b2Physics: Physics;
  private resolutionMod: number;
  private mainScene: LevelEditorScene;

  constructor() {
    super({key: SceneKeys.LEVEL_EDITOR_UI_SCENE});
  }

  init([physics, mainScene]: [Physics, LevelEditorScene]) {
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

    // document.querySelector('#phaser-wrapper canvas')?.addEventListener('click', e => this.handleClick(e));

    this.mainScene.input/*.setTopOnly(false)*/.on('pointerdown', (pointer: Ph.Input.Pointer, objs: Ph.GameObjects.GameObject[]) => this.handlePointerDown(pointer, objs));
  }

  private initUI(): Ph.GameObjects.DOMElement {
    const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

    const element = this.add.dom(screenCenterX, screenCenterY, 'div', 'pointer-events: none;').createFromCache('dom_level_editor_ui');
    element.setScale(this.resolutionMod).addListener('click pointerdown pointerup pointermove');

    const sceneItemsContainer = document.getElementById('scene-items-container');
    if (!sceneItemsContainer) throw new Error('no container for scene items');
    // BODY and nested FIXTURES, JOINTS, IMAGES
    for (let body: Pl.b2Body & RubeEntity | null = this.b2Physics.world.GetBodyList(); body; body = body.GetNext()) {
      const sceneItemBody = this.createSceneItem(body as RubeEntity, 'body');
      const sceneItemChildren = sceneItemBody.querySelector('.scene-item-children');
      if (!sceneItemChildren) throw new Error('no container for scene item children');
      for (let f = body.GetFixtureList(); f; f = f.GetNext()) sceneItemChildren.appendChild(this.createSceneItem(f as RubeEntity, 'fixture', body));
      for (let j = body.GetJointList(); j; j = j.next) sceneItemChildren.appendChild(this.createSceneItem(j.joint as RubeEntity, 'joint', body));
      let bodyRepresentation = body.GetUserData() as Ph.GameObjects.Image;
      if (bodyRepresentation) sceneItemChildren.appendChild(this.createSceneItem(bodyRepresentation, 'image', body));
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
      else if (target.classList.contains('context')) this.handleSwitchContext(target);
      else console.log('clicked unknown target', target);
    });

    return element;
  }

  private createSceneItem(entity: RubeEntity, type: 'body' | 'fixture' | 'joint' | 'image', parent?: RubeEntity): HTMLElement {
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
    if (parent) sceneItem.dataset.parentId = parent.id;
    sceneItem.dataset.id = entity.id;
    sceneItem.dataset.type = type;
    const cloneElName = clone.querySelector('.scene-item-name');
    const cloneElIcon = clone.querySelector('.scene-item-type-icon');
    if (cloneElName) cloneElName.innerHTML = entity.name || type;
    if (cloneElIcon) cloneElIcon.innerHTML = typeToIconMap[type];
    return clone;
  }

  private handleCollapseEntity(target: HTMLElement, forceExpand?: boolean) {
    const children = target.parentElement?.parentElement?.querySelector('.scene-item-children');
    if (!children) return;
    const isHidden = children.classList.contains('hidden');

    if (forceExpand && isHidden) children.classList.remove('hidden');
    else children.classList.toggle('hidden');

    target.innerHTML = isHidden || forceExpand ? 'expand_more' : 'expand_less';
  }

  private handleSelectEntity(target: HTMLElement | null) {
    const sceneItems = document.querySelectorAll('.scene-item');
    if (!target) {
      sceneItems.forEach((el) => el.classList.remove('selected'));
      this.handleUpdatePropertiesPane(null);
      return;
    }

    if (!target.parentElement) return;
    target.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'center'})
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

        // let bodyRepresentation = body.GetUserData() as Ph.GameObjects.Image;
        // this.mainScene.cameras.main.setScroll(bodyRepresentation.x, bodyRepresentation.y);
        // this.mainScene.cameras.main.startFollow(bodyRepresentation, true, 0.00001, 0.00001);

        const template: HTMLTemplateElement | null = document.getElementById('scene-item-body-properties-template') as HTMLTemplateElement;
        const clone: HTMLElement = template.content.cloneNode(true) as HTMLElement;
        propertiesContainer.appendChild(clone);

        const propType = propertiesContainer.querySelector('#property-type') as HTMLSelectElement;
        propType.selectedIndex = body.GetType();
        propType.addEventListener('change', e => body.SetType(Number((e.target as HTMLSelectElement).value)));

        const propName = propertiesContainer.querySelector('#property-name') as HTMLInputElement
        propName.setAttribute('value', String(body.name || 'unnamed Body'));
        propName.addEventListener('change', e => body.name = (e.target as HTMLInputElement).value || 'unnamed Body');

        const propLinDamp = propertiesContainer.querySelector('#property-linear-damping') as DraggableInput;
        propLinDamp.setAttribute('value', String(body.GetLinearDamping()));
        propLinDamp.addEventListener('change', e => body.SetLinearDamping(Number((e.target as DraggableInput).valueInput.value)));

        const propAngDamp = propertiesContainer.querySelector('#property-angular-damping') as HTMLInputElement;
        propAngDamp.setAttribute('value', String(body.GetAngularDamping()));
        propAngDamp.addEventListener('change', e => body.SetAngularDamping(Number((e.target as DraggableInput).valueInput.value)));

        const propMass = propertiesContainer.querySelector('#property-mass') as HTMLInputElement;
        propMass.setAttribute('value', String(body.GetMass()));
        propMass.addEventListener('change', e => body.SetMassData({
          mass: Number((e.target as DraggableInput).valueInput.value),
          center: body.GetLocalCenter(),
          I: body.GetInertia()
        }));

        const propGravScale = propertiesContainer.querySelector('#property-gravity-scale') as HTMLInputElement;
        propGravScale.setAttribute('value', String(body.GetGravityScale()));
        propGravScale.addEventListener('change', e => body.SetGravityScale(Number((e.target as DraggableInput).valueInput.value)));

        const pos = body.GetPosition();
        const propPosX = (propertiesContainer.querySelector('#property-position-x') as HTMLInputElement)
        propPosX.setAttribute('value', String(pos.x));
        propPosX.addEventListener('change', e => body.SetTransformXY(Number((e.target as DraggableInput).valueInput.value), pos.y, body.GetAngle()));

        const propPosY = (propertiesContainer.querySelector('#property-position-y') as HTMLInputElement)
        propPosY.setAttribute('value', String(pos.y));
        propPosY.addEventListener('change', e => body.SetTransformXY(pos.x, Number((e.target as DraggableInput).valueInput.value), body.GetAngle()));

        const propAngle = propertiesContainer.querySelector('#property-angle') as HTMLInputElement;
        propAngle.setAttribute('value', String(body.GetAngle()));
        propAngle.addEventListener('change', e => body.SetAngle(Number((e.target as DraggableInput).valueInput.value)));

        const linVel = body.GetLinearVelocity();
        const propLinVelX = propertiesContainer.querySelector('#property-linear-velocity-x') as HTMLInputElement;
        propLinVelX.setAttribute('value', String(linVel.x));
        propLinVelX.addEventListener('change', e => body.SetLinearVelocity({x: Number((e.target as DraggableInput).valueInput.value), y: linVel.y}));

        const propLinVelY = propertiesContainer.querySelector('#property-linear-velocity-y') as HTMLInputElement;
        propLinVelY.setAttribute('value', String(linVel.y));
        propLinVelY.addEventListener('change', e => body.SetLinearVelocity({x: linVel.x, y: Number((e.target as DraggableInput).valueInput.value)}));

        const propAngVel = propertiesContainer.querySelector('#property-angular-velocity') as HTMLInputElement;
        propAngVel.setAttribute('value', String(body.GetAngularVelocity()));
        propAngVel.addEventListener('change', e => body.SetAngularVelocity(Number((e.target as DraggableInput).valueInput.value)));

        const propBullet = propertiesContainer.querySelector('#property-bullet') as HTMLInputElement;
        propBullet.checked = body.IsBullet();
        propBullet.addEventListener('change', e => body.SetBullet((e.target as HTMLInputElement).checked));

        const propFixedRot = propertiesContainer.querySelector('#property-fixed-rotation') as HTMLInputElement;
        propFixedRot.checked = body.IsFixedRotation();
        propFixedRot.addEventListener('change', e => body.SetFixedRotation((e.target as HTMLInputElement).checked));

        const propSleepingAllowed = propertiesContainer.querySelector('#property-sleeping-allowed') as HTMLInputElement;
        propSleepingAllowed.checked = body.IsSleepingAllowed();
        propSleepingAllowed.addEventListener('change', e => body.SetSleepingAllowed((e.target as HTMLInputElement).checked));

        const propAwake = propertiesContainer.querySelector('#property-awake') as HTMLInputElement;
        propAwake.checked = body.IsAwake();
        propAwake.addEventListener('change', e => body.SetAwake((e.target as HTMLInputElement).checked));

        const propActive = propertiesContainer.querySelector('#property-active') as HTMLInputElement;
        propActive.checked = body.IsEnabled();
        propActive.addEventListener('change', e => body.SetEnabled((e.target as HTMLInputElement).checked));
        break;
      }
      case 'fixture': {
        const fixture = this.b2Physics.rubeLoader.getFixtureById(parentElement.dataset.id);
        if (!fixture) return;

        const template = document.getElementById('scene-item-fixture-properties-template') as HTMLTemplateElement;
        const clone = template.content.cloneNode(true) as HTMLElement;
        propertiesContainer.appendChild(clone);

        const propName = propertiesContainer.querySelector('#property-name') as HTMLInputElement;
        propName.setAttribute('value', String(fixture.name || 'Fixture'));
        propName.addEventListener('change', e => fixture.name = (e.target as HTMLInputElement).value);

        const propFriction = propertiesContainer.querySelector('#property-friction') as HTMLInputElement;
        propFriction.setAttribute('value', String(fixture.GetFriction()));
        propFriction.addEventListener('change', e => fixture.SetFriction(Number((e.target as HTMLInputElement).value)));

        const propRestitution = propertiesContainer.querySelector('#property-restitution') as HTMLInputElement;
        propRestitution.setAttribute('value', String(fixture.GetRestitution()));
        propRestitution.addEventListener('change', e => fixture.SetRestitution(Number((e.target as HTMLInputElement).value)));

        const propDensity = propertiesContainer.querySelector('#property-density') as HTMLInputElement;
        propDensity.setAttribute('value', String(fixture.GetDensity()));
        propDensity.addEventListener('change', e => fixture.SetDensity(Number((e.target as HTMLInputElement).value)));

        const propSensor = propertiesContainer.querySelector('#property-sensor') as HTMLInputElement;
        propSensor.checked = fixture.IsSensor();
        propSensor.addEventListener('change', e => fixture.SetSensor((e.target as HTMLInputElement).checked));

        const propFilterCatBits = propertiesContainer.querySelector('#property-filter-category-bits') as HTMLInputElement;
        propFilterCatBits.setAttribute('value', String(fixture.GetFilterData().categoryBits));
        propFilterCatBits.addEventListener('change', e => fixture.SetFilterData({
          ...fixture.GetFilterData(),
          categoryBits: Number((e.target as HTMLInputElement).value)
        }));

        const propFilterMaskBits = propertiesContainer.querySelector('#property-filter-mask-bits') as HTMLInputElement;
        propFilterMaskBits.setAttribute('value', String(fixture.GetFilterData().maskBits));
        propFilterMaskBits.addEventListener('change', e => fixture.SetFilterData({
          ...fixture.GetFilterData(),
          maskBits: Number((e.target as HTMLInputElement).value)
        }));

        const propFilterGroupIndex = propertiesContainer.querySelector('#property-filter-group-index') as HTMLInputElement;
        propFilterGroupIndex.setAttribute('value', String(fixture.GetFilterData().groupIndex));
        propFilterGroupIndex.addEventListener('change', e => fixture.SetFilterData({
          ...fixture.GetFilterData(),
          groupIndex: Number((e.target as HTMLInputElement).value)
        }));

        const propShapeType = propertiesContainer.querySelector('#property-shape-type') as HTMLSelectElement;
        propShapeType.selectedIndex = fixture.GetType();
        propShapeType.addEventListener('change', e => console.log('CANNOT CHANGE SHAPE TYPE YET (Does this even make sense to support?)'));
        break;
      }
      case 'joint': {
        // TODO allow creation of joints. Existing joints need to be deleted/recreated when some values change (e.g. bodies, anchors)
        const joint = this.b2Physics.rubeLoader.getJointById(parentElement.dataset.id);
        if (!joint) return;
        const template: HTMLTemplateElement | null = document.getElementById('scene-item-joint-properties-template') as HTMLTemplateElement;
        const clone: HTMLElement = template.content.cloneNode(true) as HTMLElement;

        const propType = clone.querySelector('#property-type') as HTMLSelectElement
        propType.selectedIndex = joint.GetType();

        const propName = clone.querySelector('#property-name') as HTMLInputElement
        propName.value = String(joint.name || 'Joint');
        propName.addEventListener('change', e => joint.name = (e.target as HTMLInputElement).value);

        const propBodyA = clone.querySelector('#property-body-a') as HTMLInputElement
        propBodyA.value = String((joint.GetBodyA() as RubeEntity).name || 'Body A');

        const propBodyB = clone.querySelector('#property-body-b') as HTMLInputElement
        propBodyB.value = String((joint.GetBodyB() as RubeEntity).name || 'Body B');

        const anchorA = joint.GetAnchorA({x: 0, y: 0});
        const propAnchorAX = clone.querySelector('#property-anchor-a-x') as HTMLInputElement
        propAnchorAX.setAttribute('value', String(anchorA.x));

        const propAnchorAY = clone.querySelector('#property-anchor-a-y') as HTMLInputElement
        propAnchorAY.setAttribute('value', String(anchorA.y));

        const anchorB = joint.GetAnchorA({x: 0, y: 0});
        const propAnchorBX = clone.querySelector('#property-anchor-b-x') as HTMLInputElement
        propAnchorBX.setAttribute('value', String(anchorB.x));
        const propAnchorBY = clone.querySelector('#property-anchor-b-y') as HTMLInputElement
        propAnchorBY.setAttribute('value', String(anchorB.y));

        const propCollideConnected = clone.querySelector('#property-collide-connected') as HTMLInputElement
        propCollideConnected.value = String(joint.GetCollideConnected());
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

        const propName = clone.querySelector('#property-name') as HTMLSelectElement;
        propName.setAttribute('value', String(image.name || 'Image'));

        const propBody = clone.querySelector('#property-body') as HTMLSelectElement;
        // @ts-ignore
        propBody.setAttribute('value', String(image.b2Body));

        // const propXXX = clone.querySelector('#property-file') as HTMLInputElement;
        // propXXX.setAttribute('value', String(image.texture.key));

        // const propXXX = clone.querySelector('#property-center') as HTMLSelectElement;
        // propXXX.setAttribute('value', String(image));

        // const propXXX = clone.querySelector('#property-angle') as HTMLInputElement;
        // propXXX.setAttribute('value', image.originX

        const propHeight = clone.querySelector('#property-height') as HTMLInputElement;
        propHeight.setAttribute('value', String(image.height));

        // const propXXX = clone.querySelector('#property-aspect-scale') as HTMLInputElement;
        // propXXX.setAttribute('value', String(image.aspectScale));

        const propOpacity = clone.querySelector('#property-opacity') as HTMLInputElement;
        propOpacity.setAttribute('value', String(image.alpha));

        const propFlip = clone.querySelector('#property-flip') as HTMLInputElement;
        propFlip.setAttribute('value', String(image.flipX));

        // const propXXX = clone.querySelector('#property-filter') as HTMLInputElement;
        // propXXX.setAttribute('value', String(image.filter));

        const propRenderOrder = clone.querySelector('#property-render-order') as HTMLInputElement;
        propRenderOrder.setAttribute('value', String(image.depth));

        // const propXXX = clone.querySelector('#property-color-tint') as HTMLInputElement;
        // propXXX.setAttribute('value', String(image.tint));
        propertiesContainer.appendChild(clone);
        break;
      }
    }
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer, objectsClicked: Phaser.GameObjects.GameObject[]) {
    let entity: RubeEntity | null = null;

    const p = {x: pointer.worldX / this.b2Physics.worldScale, y: -pointer.worldY / this.b2Physics.worldScale};
    const fixture = getB2FixtureAtPoint(this.b2Physics.world, p, new Set([Pl.b2BodyType.b2_dynamicBody, Pl.b2BodyType.b2_staticBody]));

    if (this.mainScene.context === 'body') entity = fixture && fixture.GetBody() as RubeEntity;
    else if (this.mainScene.context === 'fixture') entity = fixture as RubeEntity;
    else if (this.mainScene.context === 'image') entity = objectsClicked.find(obj => obj.type === 'Image') as Ph.GameObjects.Image;
    else if (this.mainScene.context === 'joint') console.log('TODO: handle joint click');
    else throw new Error(`Unknown context: ${this.mainScene.context}`);

    if (!entity) return this.handleSelectEntity(null);
    if (this.mainScene.selectedEntity) this.mainScene.selectedEntity.selected = false;
    this.mainScene.selectedEntity = entity;
    this.mainScene.selectedEntity.selected = true;

    const el = document.querySelector(`[data-id="${entity.id}"] .scene-item-name`);
    // FIXME this.handleCollapseEntity(document.querySelector(`[data-parent-id="${el?.data}"] .scene-item-collapse`) as HTMLElement), true);
    this.handleSelectEntity(el as HTMLElement)
  }

  private handleSwitchContext(target: HTMLElement) {
    this.mainScene.context = target.dataset.context as typeof this.mainScene.context;
    document.querySelectorAll('#context-switch .context').forEach(el => el === target ? el.classList.add('active') : el.classList.remove('active'));
  }
}

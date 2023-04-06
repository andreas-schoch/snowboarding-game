import * as Ph from "phaser";
import {DEFAULT_WIDTH, SceneKeys} from "../index";
import {Physics} from "../components/Physics";

export class LevelEditorUIScene extends Ph.Scene {
  private b2Physics: Physics;
  private resolutionMod: number;

  constructor() {
    super({key: SceneKeys.LEVEL_EDITOR_UI_SCENE});
  }

  init([physics]: [Physics]) {
    this.resolutionMod = this.game.canvas.width / DEFAULT_WIDTH;
    this.b2Physics = physics;
  }

  create() {
    const el = this.initUI();
    el.pointerEvents = 'none';

    // this.game.canvas.addEventListener('contextmenu', (e) => {
    //   e.preventDefault();
    // });
  }


  private initUI(): Ph.GameObjects.DOMElement {
    const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

    const element = this.add.dom(screenCenterX, screenCenterY, 'div', 'pointer-events: none;').createFromCache('dom_level_editor_ui');
    element.setScale(this.resolutionMod).addListener('pointerdown pointerup pointermove');

    const sceneItemsContainer = document.getElementById('scene-items-container');
    if (!sceneItemsContainer) throw new Error('no container for scene items');

    for (let body = this.b2Physics.world.GetBodyList(); body; body = body.GetNext()) {
      if (!body) continue;
      body.GetJointList();
      // @ts-ignore
      const sceneItemBody = this.createSceneItem(body.name, 'body');
      const sceneItemChildren = sceneItemBody.querySelector('.scene-item-children');
      if (!sceneItemChildren) throw new Error('no container for scene item children');
      for (let fixture = body.GetFixtureList(); fixture; fixture = fixture.GetNext()) {
        if (!fixture) continue;
        // @ts-ignore
        const sceneItemFixture = this.createSceneItem(fixture.name, 'fixture');
        sceneItemChildren.appendChild(sceneItemFixture);
      }

      for (let jointEdge = body.GetJointList(); jointEdge; jointEdge = jointEdge.next) {
        if (!jointEdge) continue;
        console.log('------joint', jointEdge);
        // @ts-ignore
        const sceneItemFixture = this.createSceneItem(jointEdge.joint.name, 'joint');
        sceneItemChildren.appendChild(sceneItemFixture);
      }

      let bodyRepresentation = body.GetUserData() as Ph.GameObjects.Image;
      if (bodyRepresentation) {
        // @ts-ignore
        const sceneItemFixture = this.createSceneItem(bodyRepresentation.name || 'Texture', 'image');
        sceneItemChildren.appendChild(sceneItemFixture);
      }
      sceneItemsContainer.appendChild(sceneItemBody);
    }
    return element;
  }

  private createSceneItem(name: string, type: 'body' | 'fixture' | 'joint' | 'image'): HTMLElement {
    const typeToIconMap = {
      body: 'window',
      fixture: 'border_clear',
      joint: 'polyline',
      image: 'wallpaper',
    };

    const sceneItemTemplate: HTMLTemplateElement | null = document.getElementById('scene-item-template') as HTMLTemplateElement;
    const clone: HTMLElement = sceneItemTemplate.content.cloneNode(true) as HTMLElement;
    const cloneElName = clone.querySelector('.scene-item-name');
    const cloneElIcon = clone.querySelector('.scene-item-type-icon');
    if (cloneElName) cloneElName.innerHTML = name;
    if (cloneElIcon) cloneElIcon.innerHTML = typeToIconMap[type];
    return clone;
  }
}

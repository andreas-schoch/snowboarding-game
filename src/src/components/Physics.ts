import * as Ph from 'phaser';
import { CharacterKeys, LevelKeys, b2 } from '../index';
import GameScene from '../scenes/GameScene';
import { RubeImage, RubeScene } from '../util/RUBE/RubeLoaderInterfaces';
import { RubeLoader } from '../util/RUBE/RubeLoader';

export interface IBeginContactEvent {
  contact: Box2D.b2Contact;
  fixtureA: Box2D.b2Fixture;
  fixtureB: Box2D.b2Fixture;
  bodyA: Box2D.b2Body;
  bodyB: Box2D.b2Body;
}

export interface IPostSolveEvent {
  contact: Box2D.b2Contact;
  impulse: Box2D.b2ContactImpulse;
  fixtureA: Box2D.b2Fixture;
  fixtureB: Box2D.b2Fixture;
  bodyA: Box2D.b2Body;
  bodyB: Box2D.b2Body;
}


export class Physics extends Phaser.Events.EventEmitter {
  isPaused: boolean = false;
  worldScale: number;
  world: Box2D.b2World;
  private readonly scene: GameScene;
  private readonly stepDeltaTime = 1 / 60;
  private readonly stepConfig = { positionIterations: 12, velocityIterations: 12 };
  debugDraw: Ph.GameObjects.Graphics;
  rubeLoader: RubeLoader;

  constructor(scene: GameScene, worldScale: number, gravity: { x: number, y: number }) {
    super();
    this.debugDraw = scene.add.graphics();
    this.scene = scene;
    this.worldScale = worldScale;

    const gravityVec = new b2.b2Vec2(gravity.x, gravity.y);
    this.world = new b2.b2World(gravityVec);
    this.world.SetAutoClearForces(true);

    const listeners = new b2.JSContactListener();
    listeners.BeginContact = (contactPtr: number) => {
      const contact = b2.wrapPointer(contactPtr, b2.b2Contact);
      const fixtureA: Box2D.b2Fixture = contact.GetFixtureA();
      const fixtureB: Box2D.b2Fixture = contact.GetFixtureB();
      const bodyA = fixtureA.GetBody();
      const bodyB = fixtureB.GetBody();
      const data: IBeginContactEvent = { contact, fixtureA, fixtureB, bodyA, bodyB };
      this.emit('begin_contact', data);
    };
    listeners.EndContact = () => null;
    listeners.PreSolve = () => null;
    listeners.PostSolve = (contactPtr: number, impulsePtr: number) => {
      const contact = b2.wrapPointer(contactPtr, b2.b2Contact);
      const impulse = b2.wrapPointer(impulsePtr, b2.b2ContactImpulse);
      const fixtureA = contact.GetFixtureA()
      const fixtureB = contact.GetFixtureB()
      const bodyA = fixtureA.GetBody();
      const bodyB = fixtureB.GetBody();
      const data: IPostSolveEvent = { contact, impulse, fixtureA, fixtureB, bodyA, bodyB };
      this.emit('post_solve', data);
    }
    this.world.SetContactListener(listeners);
    b2.destroy(gravityVec);
    // b2.destroy(listeners); // error when we destroy this

    this.rubeLoader = new RubeLoader(this.world);
    this.rubeLoader.handleLoadImage = (imageJson: RubeImage, bodyObj: Box2D.b2Body) => {
      const { file, center, customProperties, angle, aspectScale, scale, flip, renderOrder } = imageJson;
      const pos = bodyObj ? bodyObj.GetPosition() : this.rubeLoader.rubeToVec2(center);

      if (!pos) return null;
      const props = this.rubeLoader.customPropertiesArrayToMap(customProperties || []);

      const textureFallback = (file || '').split('/').reverse()[0];
      const texture = props['phaserTexture'] as string || textureFallback;
      const textureFrame = props['phaserTextureFrame'] as string || textureFallback; // TODO obsolete if filename matches texture name in altas
      const img: Ph.GameObjects.Image = this.scene.add.image(pos.x * this.worldScale, pos.y * -this.worldScale, texture, textureFrame);
      img.rotation = bodyObj ? -bodyObj.GetAngle() + -(angle || 0) : -(angle || 0);
      img.scaleY = (this.worldScale / img.height) * scale;
      img.scaleX = img.scaleY * aspectScale;
      img.alpha = imageJson.opacity || 1;
      img.flipX = flip;
      img.setDepth(renderOrder);
      img.setDataEnabled();
      img.data.set('angle_offset', -(angle || 0)); // need to preserve original angle it was expeorted with
      this.rubeLoader.customPropertiesArrayMap.set(img, customProperties || []);
      this.rubeLoader.customPropertiesMapMap.set(img, props);
      return img;
    }
  }

  loadRubeScene(rubeScene: LevelKeys | CharacterKeys) {
    const sceneJson: RubeScene = this.scene.cache.json.get(rubeScene);
    if (this.rubeLoader.loadScene(sceneJson)) console.log('RUBE scene loaded successfully.');
    else throw new Error('Failed to load RUBE scene');
  }

  update() {
    if (this.isPaused) return;
    console.time('update physics');
    this.world.Step(this.stepDeltaTime, this.stepConfig.positionIterations, this.stepConfig.positionIterations);
    this.world.ClearForces(); // recommended after each time step if flag not set which does it automatically
    console.timeEnd('update physics');
    const worldScale = this.worldScale;
    for (let body = this.world.GetBodyList(); b2.getPointer(body) !== b2.getPointer(b2.NULL); body = body.GetNext()) {
      if (!body) continue;
      const bodyRepresentation = this.rubeLoader.bodyUserDataMap.get(body) as Ph.GameObjects.Image;
      if (!bodyRepresentation) continue;
      if (body.IsEnabled()) {
        let pos = body.GetPosition();
        bodyRepresentation.setVisible(true);
        bodyRepresentation.x = pos.x * worldScale
        bodyRepresentation.y = -pos.y * worldScale;
        bodyRepresentation.rotation = -body.GetAngle() + (bodyRepresentation.data.get('angle_offset') || 0); // in radians;
      } else {
        bodyRepresentation.visible = false;
      }
    }
  }
}

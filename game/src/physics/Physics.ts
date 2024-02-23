import {GameInfo} from '../GameInfo';
import {B2_BEGIN_CONTACT, B2_POST_SOLVE} from '../eventTypes';
import {iterBodies} from '../helpers/B2Iterators';
import {b2} from '../index';
import {DebugDrawer} from './DebugDraw';
import {WorldEntityConfig, WorldEntityData} from './RUBE/EntityTypes';
import {RubeScene} from './RUBE/RubeFileExport';
import {RubeImageAdapter as PhaserImageAdapter} from './RUBE/RubeImageAdapter';
import {RubeLoader} from './RUBE/RubeLoader';
import {RubeSerializer} from './RUBE/RubeSerializer';

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

export class Physics {
  worldEntity: WorldEntityData;
  serializer: RubeSerializer;
  loader: RubeLoader;

  constructor(private scene: Phaser.Scene, config: WorldEntityConfig) {
    GameInfo.physics = this;
    this.worldEntity = this.initWorld(config);

    const adapter = new PhaserImageAdapter(scene, this);
    this.loader = new RubeLoader(this.worldEntity, adapter);
    this.serializer = new RubeSerializer(this.worldEntity, adapter, this.loader);
  }

  setDebugDraw(enabled: boolean) {
    this.worldEntity.debugDrawEnabled = enabled;
    // this.debugDrawer.instance.SetFlags(enabled ? 1 : 0);
  }

  load(rubeScene: RubeScene, offsetX: number = 0, offsetY: number = 0) {
    // const sceneJson: RubeScene = this.scene.cache.json.get(rubeScene);
    const loadedScene = this.loader.load(rubeScene, offsetX, offsetY);
    if (this.worldEntity.debugDrawEnabled) this.worldEntity.world.DebugDraw();
    // GameInfo.observer.emit(RUBE_SCENE_LOADED, loadedScene); // Ensure editor open emitted before this, so scene explorer is already in the DOM
    return loadedScene;
  }

  update() {
    const {isPaused, debugDrawEnabled, world, stepsPerSecond, velocityIterations, positionIterations, pixelsPerMeter, entityData} = this.worldEntity;
    if (isPaused) return;
    world.Step(1 / stepsPerSecond, velocityIterations, positionIterations);
    if (debugDrawEnabled) world.DebugDraw();
    for (const body of iterBodies(world)) {
      const bodyEntity = entityData.get(body);
      if (bodyEntity?.type !== 'body') throw new Error('Expected bodyEntity to be of type "body"');
      const imageEntity = bodyEntity?.image;
      if (!imageEntity) continue;
      const image = imageEntity.image as Phaser.GameObjects.Image;
      if (body.IsEnabled()) {
        const pos = body.GetPosition();
        image.setVisible(true);
        image.x = pos.x * pixelsPerMeter;
        image.y = -pos.y * pixelsPerMeter;
        image.rotation = -body.GetAngle() + (image.data.get('angle_offset') || 0); // in radians;
      } else {
        image.visible = false;
      }
    }

    if (this.worldEntity.debugDrawEnabled) this.worldEntity.debugDrawer.clear();
  }

  private initWorld(config: WorldEntityConfig) {
    const gravityVec = new b2.b2Vec2(config.gravityX, config.gravityY);

    const worldEntity: WorldEntityData = {
      ...config,
      type: 'world',
      world:  new b2.b2World(gravityVec),
      debugDrawer: new DebugDrawer(this.scene, config.pixelsPerMeter, 1),
      observer: new Phaser.Events.EventEmitter(), // TODO get rid of phaser dependency
      entityData: new Map(),
      stepsPerSecond: 60,
      positionIterations: 12,
      velocityIterations: 12,
      isPaused: false
    };

    worldEntity.world.SetAutoClearForces(true);
    worldEntity.world.SetDebugDraw(worldEntity.debugDrawer.instance);
    this.initContactListeners(worldEntity);

    b2.destroy(gravityVec);
    return worldEntity;
  }

  private initContactListeners(worldEntity: WorldEntityData) {
    const listeners = new b2.JSContactListener();
    const observer = worldEntity.observer;
    listeners.BeginContact = (contactPtr: number) => {
      const contact = b2.wrapPointer(contactPtr, b2.b2Contact);
      const fixtureA: Box2D.b2Fixture = contact.GetFixtureA();
      const fixtureB: Box2D.b2Fixture = contact.GetFixtureB();
      const bodyA = fixtureA.GetBody();
      const bodyB = fixtureB.GetBody();
      const data: IBeginContactEvent = {contact, fixtureA, fixtureB, bodyA, bodyB};
      observer.emit(B2_BEGIN_CONTACT, data);
    };
    listeners.EndContact = () => null;
    listeners.PreSolve = () => null;
    listeners.PostSolve = (contactPtr: number, impulsePtr: number) => {
      const contact = b2.wrapPointer(contactPtr, b2.b2Contact);
      const impulse = b2.wrapPointer(impulsePtr, b2.b2ContactImpulse);
      const fixtureA = contact.GetFixtureA();
      const fixtureB = contact.GetFixtureB();
      const bodyA = fixtureA.GetBody();
      const bodyB = fixtureB.GetBody();
      const data: IPostSolveEvent = {contact, impulse, fixtureA, fixtureB, bodyA, bodyB};
      observer.emit(B2_POST_SOLVE, data);
    };
    worldEntity.world.SetContactListener(listeners);
    // b2.destroy(listeners); // error when we destroy this so don't do it
  }
}

import {GameInfo} from '../GameInfo';
import {B2_BEGIN_CONTACT, B2_POST_SOLVE, RUBE_SCENE_LOADED} from '../eventTypes';
import {iterBodies} from '../helpers/B2Iterators';
import {b2} from '../index';
import {DebugDrawer} from './DebugDraw';
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

export class Physics extends Phaser.Events.EventEmitter {
  world: Box2D.b2World;
  serializer: RubeSerializer;
  loader: RubeLoader;
  worldScale: number;
  debugDrawEnabled = false;
  isPaused: boolean = false;
  private readonly debugDrawer: DebugDrawer;
  private readonly stepDeltaTime = 1 / 60;
  private readonly stepConfig = {positionIterations: 12, velocityIterations: 12};

  constructor(private scene: Phaser.Scene, private config: {worldScale: number, gravityX: number, gravityY: number, debugDrawEnabled?: boolean}) {
    super();
    GameInfo.physics = this;
    this.worldScale = config.worldScale;
    this.debugDrawEnabled = Boolean(config.debugDrawEnabled);
    this.debugDrawer = new DebugDrawer(scene, this.config.worldScale, 1);
    this.world = this.initWorld();

    const adapter = new PhaserImageAdapter(scene, this);
    this.loader = new RubeLoader(this.world, adapter);
    this.serializer = new RubeSerializer(this.world, adapter, this.loader);

    this.initContactListeners();
  }

  setDebugDraw(enabled: boolean) {
    this.debugDrawEnabled = enabled;
    // this.debugDrawer.instance.SetFlags(enabled ? 1 : 0);
  }

  load(rubeScene: RubeScene, offsetX: number = 0, offsetY: number = 0) {
    // const sceneJson: RubeScene = this.scene.cache.json.get(rubeScene);
    const [success, id] = this.loader.load(rubeScene, offsetX, offsetY);
    if (!success) throw new Error('Failed to load RUBE scene');
    if (this.debugDrawEnabled) this.world.DebugDraw();
    GameInfo.observer.emit(RUBE_SCENE_LOADED, id); // Ensure editor open emitted before this, so scene explorer is already in the DOM
    return id;
  }

  update() {
    if (this.isPaused) return;
    this.world.Step(this.stepDeltaTime, this.stepConfig.positionIterations, this.stepConfig.positionIterations);
    if (this.debugDrawEnabled) this.world.DebugDraw();
    const worldScale = this.worldScale;
    for (const body of iterBodies(this.world)) {
      const bodyEntity = this.loader.entityData.get(body);
      if (bodyEntity?.type !== 'body') throw new Error('Expected bodyEntity to be of type "body"');
      const imageEntity = bodyEntity?.image;
      if (!imageEntity) continue;
      const image = imageEntity.image as Phaser.GameObjects.Image;
      if (body.IsEnabled()) {
        const pos = body.GetPosition();
        image.setVisible(true);
        image.x = pos.x * worldScale;
        image.y = -pos.y * worldScale;
        image.rotation = -body.GetAngle() + (image.data.get('angle_offset') || 0); // in radians;
      } else {
        image.visible = false;
      }
    }

    if (this.debugDrawEnabled) this.debugDrawer.clear();
  }

  private initWorld() {
    const gravityVec = new b2.b2Vec2(this.config.gravityX, this.config.gravityY);
    const world = new b2.b2World(gravityVec);
    world.SetAutoClearForces(true);
    world.SetDebugDraw(this.debugDrawer.instance);
    b2.destroy(gravityVec);
    return world;
  }

  private initContactListeners() {
    const listeners = new b2.JSContactListener();
    listeners.BeginContact = (contactPtr: number) => {
      const contact = b2.wrapPointer(contactPtr, b2.b2Contact);
      const fixtureA: Box2D.b2Fixture = contact.GetFixtureA();
      const fixtureB: Box2D.b2Fixture = contact.GetFixtureB();
      const bodyA = fixtureA.GetBody();
      const bodyB = fixtureB.GetBody();
      const data: IBeginContactEvent = {contact, fixtureA, fixtureB, bodyA, bodyB};
      this.emit(B2_BEGIN_CONTACT, data);
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
      this.emit(B2_POST_SOLVE, data);
    };
    this.world.SetContactListener(listeners);
    // b2.destroy(listeners); // error when we destroy this so don't do it
  }
}

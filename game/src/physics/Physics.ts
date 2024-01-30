import {B2_BEGIN_CONTACT, B2_POST_SOLVE} from '../eventTypes';
import {b2, recordLeak} from '../index';
import {GameScene} from '../scenes/GameScene';
import {DebugDrawer} from './DebugDraw';
import {RubeImageAdapter as PhaserImageAdapter} from './RUBE/RubeImageAdapter';
import {RubeLoader} from './RUBE/RubeLoader';
import {RubeScene} from './RUBE/RubeLoaderInterfaces';
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
  isPaused: boolean = false;
  private readonly debugDrawer: DebugDrawer;
  private readonly stepDeltaTime = 1 / 60;
  private readonly stepConfig = {positionIterations: 12, velocityIterations: 12};

  constructor(private scene: GameScene, private config: {worldScale: number, gravityX: number, gravityY: number}) {
    super();
    this.worldScale = config.worldScale;
    this.debugDrawer = new DebugDrawer(this.scene.add.graphics().setDepth(5000), this.config.worldScale);
    this.world = this.initWorld();

    const adapter = new PhaserImageAdapter(this.scene, this);
    this.loader = new RubeLoader(this.world, adapter);
    this.serializer = new RubeSerializer(this.world, adapter, this.loader);

    // this.serializer.getImages = () => adapter.images;
    // this.serializer.handleSerializeImage = adapter.serializeImage.bind(adapter);
    // this.loader.getImages = () => adapter.images;
    // this.loader.handleLoadImage = adapter.loadImage.bind(adapter);

    this.initContactListeners();
  }

  load(rubeScene: RubeScene, offsetX: number = 0, offsetY: number = 0) {
    // const sceneJson: RubeScene = this.scene.cache.json.get(rubeScene);
    const [success, id] = this.loader.load(rubeScene, offsetX, offsetY);
    if (!success) throw new Error('Failed to load RUBE scene');
    // this.world.DebugDraw();
    return id;
  }

  update() {
    if (this.isPaused) return;
    this.world.Step(this.stepDeltaTime, this.stepConfig.positionIterations, this.stepConfig.positionIterations);
    // this.world.DebugDraw();
    const worldScale = this.worldScale;
    for (let body = recordLeak(this.world.GetBodyList()); b2.getPointer(body) !== b2.getPointer(b2.NULL); body = recordLeak(body.GetNext())) {
      if (!body) continue;
      const image = this.loader.bodyImage.get(body) as Phaser.GameObjects.Image | null;
      if (!image) continue;
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
    // this.debugDrawer.clear();
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

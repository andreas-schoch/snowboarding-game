import { b2, recordLeak } from './index';
import GameScene from './scenes/GameScene';
import { RubeImage, RubeScene } from './util/RUBE/RubeLoaderInterfaces';
import { RubeLoader } from './util/RUBE/RubeLoader';
import DebugDrawer from './DebugDraw';
import { RubeSerializer } from './util/RUBE/RubeSerializer';
import { B2_BEGIN_CONTACT, B2_POST_SOLVE } from './eventTypes';
import { CharacterKeys, Settings } from './Settings';
import { LevelKeys } from './levels';

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
  serializer: RubeSerializer<Phaser.GameObjects.Image>;
  loader: RubeLoader<Phaser.GameObjects.Image>;
  worldScale: number;
  isPaused: boolean = false;
  private readonly debugDrawer: DebugDrawer;
  private readonly stepDeltaTime = 1 / 60;
  private readonly stepConfig = { positionIterations: 12, velocityIterations: 12 };

  constructor(private scene: GameScene, private config: { worldScale: number, gravityX: number, gravityY: number }) {
    super();
    this.worldScale = config.worldScale;
    this.debugDrawer = new DebugDrawer(this.scene.add.graphics().setDepth(5000), this.config.worldScale);
    this.world = this.initWorld();
    this.loader = this.initLoader();
    this.serializer = this.initSerializer();
    this.initContactListeners();
  }

  load(rubeScene: CharacterKeys | LevelKeys, offsetX: number = 0, offsetY: number = 0) {
    const sceneJson: RubeScene = this.scene.cache.json.get(rubeScene);
    const [success, id] = this.loader.load(sceneJson, offsetX, offsetY);
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
      const userdata = this.loader.userData.get(body);
      const image = userdata?.image;
      if (!image) continue;
      if (body.IsEnabled()) {
        let pos = body.GetPosition();
        image.setVisible(true);
        image.x = pos.x * worldScale
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

  private initLoader() {
    const loader = new RubeLoader<Phaser.GameObjects.Image>(this.world);
    loader.handleLoadImage = (imageJson: RubeImage, bodyObj: Box2D.b2Body | null, customPropsMap: { [key: string]: unknown }) => {
      const { file, center, angle, aspectScale, scale, flip, renderOrder } = imageJson;
      const pos = bodyObj ? bodyObj.GetPosition() : this.loader.rubeToVec2(center);

      // For any player character part, we interject and choose a texture atlas based on what skin the player has selected.
      const bodyProps = bodyObj ? this.loader.customProps.get(bodyObj) : null;
      const isPlayerCharacterPart = Boolean(bodyProps?.['phaserPlayerCharacterPart']);

      if (!pos) return null;

      const textureFrame = (file || '').split('/').reverse()[0];
      const textureAtlas = isPlayerCharacterPart ? Settings.selectedCharacterSkin() : customPropsMap['phaserTexture'] as string;
      const img: Phaser.GameObjects.Image = this.scene.add.image(pos.x * this.worldScale, pos.y * -this.worldScale, textureAtlas || textureFrame, textureFrame);
      img.rotation = bodyObj ? -bodyObj.GetAngle() + -(angle || 0) : -(angle || 0);
      img.scaleY = (this.worldScale / img.height) * scale;
      img.scaleX = img.scaleY * aspectScale;
      img.alpha = imageJson.opacity || 1;
      img.flipX = flip;
      img.setDepth(renderOrder);
      img.setDataEnabled();

      if (Settings.darkmodeEnabled()) {
        // img.setPipeline('Light2D');
        const isLight = bodyProps?.['light'] === true || textureFrame === 'present_temp.png';
        if (isPlayerCharacterPart) img.setTintFill(0x000000);
        else if (isLight) img.setTintFill(0xbbbbbb);
        else img.setTintFill(0x222222);
      }
      // TODO not sure if this is the way to go. If I want to keep full compatibility with RUBE, I need to somehow keep the opengl specific data.
      //  I don't know yet if I can derive them fully from just the generated phaser image. Once I start with the level editor, I'll look into it.
      img.data.set('image-json', imageJson);
      img.data.set('angle_offset', -(angle || 0)); // need to preserve original angle it was expeorted with
      return img;
    }
    return loader;
  }

  private initSerializer() {
    const serializer = new RubeSerializer(this.world, this.loader);
    serializer.handleSerializeImage = (image) => (image as Phaser.GameObjects.Image).data.get('image-json') as RubeImage;
    return serializer;
  }

  private initContactListeners() {
    const listeners = new b2.JSContactListener();
    listeners.BeginContact = (contactPtr: number) => {
      const contact = b2.wrapPointer(contactPtr, b2.b2Contact);
      const fixtureA: Box2D.b2Fixture = contact.GetFixtureA();
      const fixtureB: Box2D.b2Fixture = contact.GetFixtureB();
      const bodyA = fixtureA.GetBody();
      const bodyB = fixtureB.GetBody();
      const data: IBeginContactEvent = { contact, fixtureA, fixtureB, bodyA, bodyB };
      this.emit(B2_BEGIN_CONTACT, data);
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
      this.emit(B2_POST_SOLVE, data);
    }
    this.world.SetContactListener(listeners);
    // b2.destroy(listeners); // error when we destroy this so don't do it
  }
}

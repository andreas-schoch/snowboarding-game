import { CharacterKeys, CharacterSkinKeys, LevelKeys, b2 } from '../index';
import GameScene from '../scenes/GameScene';
import { RubeImage, RubeScene } from '../util/RUBE/RubeLoaderInterfaces';
import { RubeLoader } from '../util/RUBE/RubeLoader';
import DebugDrawer from './DebugDraw';
import { RubeSerializer } from '../util/RUBE/RubeSerializer';
import { getSelectedCharacterSkin } from '../util/getCurrentCharacter';

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
  private readonly scene: GameScene;
  private readonly debugDrawer: DebugDrawer;
  private readonly stepDeltaTime = 1 / 60;
  private readonly stepConfig = { positionIterations: 12, velocityIterations: 12 };
  private readonly ZERO: Box2D.b2Vec2 = new b2.b2Vec2(0, 0);

  constructor(scene: GameScene, worldScale: number, gravity: { x: number, y: number }) {
    super();
    this.scene = scene;
    this.worldScale = worldScale;

    const gravityVec = new b2.b2Vec2(gravity.x, gravity.y);
    this.world = new b2.b2World(gravityVec);
    this.world.SetAutoClearForces(true);

    this.debugDrawer = new DebugDrawer(this.scene.add.graphics().setDepth(5000), this.worldScale);
    this.world.SetDebugDraw(this.debugDrawer.instance);

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

    this.loader = new RubeLoader(this.world);
    this.loader.handleLoadImage = (imageJson: RubeImage, bodyObj: Box2D.b2Body | null, customPropsMap: { [key: string]: unknown }) => {
      const { file, center, angle, aspectScale, scale, flip, renderOrder } = imageJson;
      const pos = bodyObj ? bodyObj.GetPosition() : this.loader.rubeToVec2(center);

      // For any player character part, we interject and choose a texture atlas based on what skin the player has selected.
      const bodyProps = bodyObj ? this.loader.customPropertiesMap.get(bodyObj) : null;
      const isPlayerCharacterPart = Boolean(bodyProps?.['phaserPlayerCharacterPart']);
      
      if (!pos) return null;

      const textureFrame = (file || '').split('/').reverse()[0];
      const textureAtlas = isPlayerCharacterPart ? getSelectedCharacterSkin() : customPropsMap['phaserTexture'] as string;
      const img: Phaser.GameObjects.Image = this.scene.add.image(pos.x * this.worldScale, pos.y * -this.worldScale, textureAtlas || textureFrame, textureFrame);
      img.rotation = bodyObj ? -bodyObj.GetAngle() + -(angle || 0) : -(angle || 0);
      img.scaleY = (this.worldScale / img.height) * scale;
      img.scaleX = img.scaleY * aspectScale;
      img.alpha = imageJson.opacity || 1;
      img.flipX = flip;
      img.setDepth(renderOrder);
      img.setDataEnabled();
      // TODO not sure if this is the way to go. If I want to keep full compatibility with RUBE, I need to somehow keep the opengl specific data.
      //  I don't know yet if I can derive them fully from just the generated phaser image. Once I start with the level editor, I'll look into it.
      img.data.set('image-json', imageJson);
      img.data.set('angle_offset', -(angle || 0)); // need to preserve original angle it was expeorted with
      return img;
    }

    this.serializer = new RubeSerializer(this.world, this.loader);
    this.serializer.handleSerializeImage = (image) => (image as Phaser.GameObjects.Image).data.get('image-json') as RubeImage;
  }

  loadRubeScene(rubeScene: CharacterKeys | LevelKeys) {
    const sceneJson: RubeScene = this.scene.cache.json.get(rubeScene);
    if (this.loader.loadScene(sceneJson)) console.log('RUBE scene loaded successfully.');
    else throw new Error('Failed to load RUBE scene');
    // this.world.DebugDraw();
  }

  update() {
    if (this.isPaused) return;
    this.world.Step(this.stepDeltaTime, this.stepConfig.positionIterations, this.stepConfig.positionIterations);
    // this.world.DebugDraw();
    const worldScale = this.worldScale;
    for (let body = this.world.GetBodyList(); b2.getPointer(body) !== b2.getPointer(b2.NULL); body = body.GetNext()) {
      if (!body) continue;
      const userdata = this.loader.bodyUserDataMap.get(body);
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
}

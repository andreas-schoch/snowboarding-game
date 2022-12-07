import * as Ph from 'phaser';
import * as Pl from '@box2d/core';
import {stats} from '../index';
import GameScene from '../scenes/game.scene';
import {RubeScene} from '../util/RUBE/RubeLoaderInterfaces';
import {RubeLoader} from '../util/RUBE/RubeLoader';


export class Physics extends Phaser.Events.EventEmitter {
  private scene: GameScene;
  worldScale: number;
  world: Pl.b2World;
  private readonly userDataGraphics: Ph.GameObjects.Graphics;
  private readonly textureKeys: Set<string> = new Set();
  private readonly ZERO: Pl.b2Vec2 = new Pl.b2Vec2(0, 0);
  private bulletTime: { rate: number } = {rate: 1};
  debugDraw: Ph.GameObjects.Graphics;
  rubeLoader: RubeLoader;

  constructor(scene: GameScene, worldScale: number, gravity: Pl.b2Vec2) {
    super();
    this.debugDraw = scene.add.graphics();
    this.scene = scene;
    this.worldScale = worldScale;
    this.world = Pl.b2World.Create(gravity);
    this.world.SetContactListener({
      BeginContact: contact => this.emit('begin-contact', contact),
      EndContact: () => null,
      PreSolve: () => null,
      PostSolve: (contact, impulse) => this.emit('post-solve', contact, impulse),
    });

    this.world.SetAllowSleeping(false);
    this.world.SetWarmStarting(true);
    this.userDataGraphics = scene.add.graphics();

    const sceneJso: RubeScene = this.scene.cache.json.get('santa');
    this.rubeLoader = new RubeLoader(this.world, this.scene.add.graphics(), this.scene, this.worldScale);

    if (this.rubeLoader.loadScene(sceneJso))
      console.log('RUBE scene loaded successfully.');
    else
      throw new Error('Failed to load RUBE scene');
    this.update(); // needs to happen before update of snowman otherwise b2Body.GetPosition() inaccurate

  }

  update() {
    stats.begin('physics');

    // const iterations = Math.floor(Math.max(this.scene.game.loop.actualFps / 3, 9));
    this.world.Step(1 / 60, {positionIterations: 12, velocityIterations: 12});
    this.world.ClearForces(); // recommended after each time step

    // iterate through all bodies
    const worldScale = this.worldScale;
    for (let body = this.world.GetBodyList(); body; body = body.GetNext()) {
      if (!body) continue;
      let bodyRepresentation = body.GetUserData() as Ph.GameObjects.Image;
      if (!bodyRepresentation) continue;

      if (bodyRepresentation) {
        if (body.IsEnabled()) {
          // if (true) {
          let {x, y} = body.GetPosition();
          !bodyRepresentation.visible && bodyRepresentation.setVisible(true);
          bodyRepresentation.x = x * worldScale;
          bodyRepresentation.y = y * -worldScale;
          // @ts-ignore
          bodyRepresentation.rotation = -body.GetAngle() + (bodyRepresentation.custom_origin_angle || 0); // in radians;
        } else {
          bodyRepresentation.setVisible(false);
        }
      } else {
        // @ts-ignore
        // console.log('no image', body.GetPosition(), body.name);
      }
    }
    stats.end('physics');
  }

  enterBulletTime(duration: number, rate: number): void {
    this.bulletTime.rate = rate;
    this.scene.tweens.add({
      delay: duration,
      targets: [this.bulletTime],
      rate: 0.9,
      duration: 500,
      // onComplete: tween => console.log('done tween'),
    });
  }
}

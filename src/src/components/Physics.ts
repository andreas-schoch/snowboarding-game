import * as Ph from 'phaser';
import * as Pl from '@box2d/core';
import {LevelKeys, stats} from '../index';
import {RubeScene} from '../util/RUBE/RubeLoaderInterfaces';
import {RubeLoader} from '../util/RUBE/RubeLoader';


export class Physics extends Phaser.Events.EventEmitter {
  isPaused: boolean = false;
  worldScale: number;
  world: Pl.b2World;
  private readonly scene: Ph.Scene;
  private readonly stepDeltaTime = 1 / 60;
  private readonly stepConfig = {positionIterations: 12, velocityIterations: 12};
  rubeLoader: RubeLoader;

  constructor(scene: Ph.Scene, worldScale: number, gravity: Pl.b2Vec2) {
    super();
    this.scene = scene;
    this.worldScale = worldScale;
    this.world = Pl.b2World.Create(gravity);
    this.world.SetAutoClearForces(true);
    this.world.SetContactListener({
      BeginContact: contact => this.emit('begin_contact', contact),
      EndContact: () => null,
      PreSolve: () => null,
      PostSolve: (contact, impulse) => this.emit('post_solve', contact, impulse),
    });

    this.rubeLoader = new RubeLoader(this.world, this.scene.add.graphics(), this.scene, this.worldScale);
  }

  loadRubeScene(rubeScene: LevelKeys) {
    const sceneJson: RubeScene = this.scene.cache.json.get(rubeScene);
    if (this.rubeLoader.loadScene(sceneJson)) console.log('RUBE scene loaded successfully.');
    else throw new Error('Failed to load RUBE scene');
    // this.update();
  }

  update() {
    if (this.isPaused) return;

    stats.begin('physics');
    this.world.Step(this.stepDeltaTime, this.stepConfig);
    this.updateBodyRepresentations();
    stats.end('physics');
  }

  updateBodyRepresentations() {
    const worldScale = this.worldScale;
    for (let body = this.world.GetBodyList(); body; body = body.GetNext()) {
      let bodyRepresentation = body.GetUserData() as Ph.GameObjects.Image;
      if (!bodyRepresentation) continue;

      if (body.IsEnabled()) {
        let {x, y} = body.GetPosition();
        !bodyRepresentation.visible && bodyRepresentation.setVisible(true);
        bodyRepresentation.x = x * worldScale;
        bodyRepresentation.y = y * -worldScale;
        // @ts-ignore
        bodyRepresentation.rotation = -body.GetAngle() + (bodyRepresentation.custom_origin_angle || 0); // in radians;
      } else {
        bodyRepresentation.setVisible(false);
      }
    }
  }
}

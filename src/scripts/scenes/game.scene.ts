import * as Ph from 'phaser';
import * as Pl from 'planck-js';
import TerrainSimple from '../objects/terrain-simple';
import {TerrainDestructible} from '../objects/terrain-destructible';
import {WickedSnowman} from '../objects/wicked-snowman';

export default class GameScene extends Ph.Scene {
  private terrainSimple: TerrainSimple;
  // private terrainDestructible: TerrainDestructible;
  private wickedSnowman: WickedSnowman;

  private worldScale: number;
  private world: Pl.World;

  constructor() {
    super({key: 'GameScene'});
  }

  async create() {
    const music = this.sound.add('theme');
    music.play({loop: true});

    this.worldScale = 30;
    let gravity = Pl.Vec2(0, 4); // in m/sec
    this.world = Pl.World(gravity);

    this.terrainSimple = new TerrainSimple(this, this.world);
    // this.terrainDestructible = new TerrainDestructible(this, this.world, this.worldScale);
    this.wickedSnowman = new WickedSnowman(this, this.world, this.worldScale);
    this.wickedSnowman.create();

    this.cameras.main.startFollow(this.wickedSnowman.body.getUserData() as Phaser.GameObjects.Graphics, false, 0.8, 0.25);
    this.cameras.main.followOffset.set(-300, 0);
    this.cameras.main.setDeadzone(0, 150);
    this.cameras.main.setBackgroundColor(0x000000);
  }

  update() {
    this.wickedSnowman.update();
    // this.terrainDestructible.update();
    this.terrainSimple.update();
    this.updatePhysics();

    // TODO was stepping twice per update with 1/40 and 1/60 accidentally.
    //  Adjust everything (gravity, dampings, player part HZ etc) to feel the same with only 1 step() per update
    this.world.step(1 / 60);
    this.world.clearForces(); // recommended after each time step
  }

  private updatePhysics() {
    // let timeStep = this.game.loop.delta / 1000;
    let timeStep = 1 / 40;
    let velocityIterations = 10;
    let positionIterations = 8;

    this.world.step(timeStep, velocityIterations, positionIterations);
    this.world.clearForces(); // recommended after each time step

    // iterate through all bodies
    for (let physicsBody = this.world.getBodyList(); physicsBody; physicsBody = physicsBody.getNext()) {
      if (!physicsBody) continue;

      // update the visible graphics object attached to the physics body
      let physicsBodyGraphics = physicsBody.getUserData() as Ph.GameObjects.Graphics;
      if (!physicsBodyGraphics) continue;

      let pos = physicsBody.getPosition();
      physicsBodyGraphics.x = pos.x * this.worldScale;
      physicsBodyGraphics.y = pos.y * this.worldScale;
      physicsBodyGraphics.rotation = physicsBody.getAngle(); // in radians;
    }
  }
}

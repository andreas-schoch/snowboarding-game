import * as Ph from 'phaser';
import * as Pl from '@box2d/core';
import {stats} from '../index';


export interface IRevoluteJointConfig {
  bodyA: Pl.b2Body;
  bodyB: Pl.b2Body;
  anchor: Pl.XY;
  lowerAngle?: number
  upperAngle?: number;
  enableLimit?: true;
}


export interface IDistanceJointConfig {
  length?: number
  minLength?: number
  maxLength?: number
  dampingRatio?: number,
  frequencyHz?: number
}


export interface IBodyConfig {
  friction?: number;
  restitution?: number;
  density?: number;
  color?: number;
  linearDamping?: number;
  angularDamping?: number;
  type?: Pl.b2BodyType;
}


export class Physics extends Phaser.Events.EventEmitter {
  private scene: Ph.Scene;
  worldScale: number;
  world: Pl.b2World;
  private readonly userDataGraphics: Ph.GameObjects.Graphics;
  private readonly textureKeys: Set<string> = new Set();
  private readonly ZERO: Pl.b2Vec2 = new Pl.b2Vec2(0, 0);
  private bulletTime: { rate: number } = {rate: 1};

  constructor(scene: Ph.Scene, worldScale: number, gravity: Pl.b2Vec2) {
    super();
    this.scene = scene;
    this.worldScale = worldScale;
    this.world = Pl.b2World.Create(gravity);
    this.world.SetContactListener({
      BeginContact: () => null,
      EndContact: () => null,
      PreSolve: () => null,
      PostSolve: (contact, impulse) => this.emit('post-solve', contact, impulse),
    });

    this.world.SetAllowSleeping(false);
    this.world.SetWarmStarting(true);
    this.userDataGraphics = scene.add.graphics();
  }

  update() {
    stats.begin('physics');
    let timeStep = (Math.round(this.scene.game.loop.delta) / 640) * this.bulletTime.rate;
    const iterations = Math.floor(Math.max(this.scene.game.loop.actualFps / 3, 6));
    this.world.Step(timeStep, {positionIterations: iterations, velocityIterations: iterations});
    this.world.ClearForces(); // recommended after each time step

    // iterate through all bodies
    const worldScale = this.worldScale;
    for (let body = this.world.GetBodyList(); body; body = body.GetNext()) {
      if (!body) continue;

      // update the visible graphics object attached to the physics body
      // TODO turn user data into an object ---> {type: 'dynamic|obstacle', representation: Image|Graphics|null}
      let bodyRepresentation = body.GetUserData() as Ph.GameObjects.Image;
      if (bodyRepresentation) {
        let {x, y} = body.GetPosition();
        bodyRepresentation.x = x * worldScale;
        bodyRepresentation.y = y * worldScale;
        bodyRepresentation.rotation = body.GetAngle(); // in radians;
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

  createBox(posX: number, posY: number, angle: number, width: number, height: number, isDynamic: boolean, color: number = 0xB68750): Pl.b2Body {
    const shape = new Pl.b2PolygonShape();
    shape.SetAsBox(width / 2 / this.worldScale, height / 2 / this.worldScale);

    const fd: Pl.b2FixtureDef = {
      shape,
      density: 0.1,
      friction: 0.001,
      restitution: 0.005,
    };

    const body = this.world.CreateBody({
      awake: true,
      position: {x: posX / this.worldScale, y: posY / this.worldScale},
      angle: angle,
      linearDamping: 0.15,
      angularDamping: 0.1,
      type: isDynamic ? Pl.b2BodyType.b2_dynamicBody : Pl.b2BodyType.b2_staticBody,
    });
    body.CreateFixture(fd);
    body.SetMassData({mass: 0.5, center: new Pl.b2Vec2(), I: 1});

    let userData = this.scene.add.graphics();
    userData.fillStyle(color);
    userData.fillRect(-width / 2, -height / 2, width * 2, height * 2);
    const key = `box-${width}-${height}-${color}`;
    if (!this.textureKeys.has(key)) {
      this.textureKeys.add(key);
      userData.generateTexture(key, width, height);
    }
    const img = this.scene.add.image(posX, posY, key);
    body.SetUserData(img);
    return body;
  }

  createCircle(posX: number, posY: number, angle: number, radius: number, config: IBodyConfig = {}): Pl.b2Body {
    const shape = new Pl.b2CircleShape();
    shape.m_radius = radius / this.worldScale;

    const fd: Pl.b2FixtureDef = {
      shape,
      density: 1,
      friction: 0.001,
      restitution: 0.005,
    };

    const body = this.world.CreateBody({
      position: {x: posX / this.worldScale, y: posY / this.worldScale},
      angle: angle,
      linearDamping: config.linearDamping,
      angularDamping: config.angularDamping,
      type: config.type,
    });

    body.CreateFixture(fd);
    body.SetMassData({mass: 1, center: this.ZERO, I: 1});

    const key = `circle-${radius}-${config.color || 0x333333}`;
    if (!this.textureKeys.has(key)) {
      this.userDataGraphics.clear();
      this.userDataGraphics.fillStyle(config.color || 0x333333);
      this.userDataGraphics.fillCircle(radius, radius, radius);
      this.textureKeys.add(key);
      this.userDataGraphics.generateTexture(key, radius * 2, radius * 2);
    }
    const img = this.scene.add.image(posX, posY, key);
    body.SetUserData(img);

    return body;
  }

  createRevoluteJoint(config: IRevoluteJointConfig): Pl.b2RevoluteJoint {
    const rjd = new Pl.b2RevoluteJointDef();
    const anchor = new Pl.b2Vec2(config.anchor.x / this.worldScale, config.anchor.y / this.worldScale);
    rjd.Initialize(config.bodyA, config.bodyB, anchor);
    rjd.collideConnected = false;
    if (config.lowerAngle) rjd.lowerAngle = config.lowerAngle;
    if (config.upperAngle) rjd.upperAngle = config.upperAngle;
    if (config.enableLimit) rjd.enableLimit = config.enableLimit;
    return this.world.CreateJoint(rjd);
  }

  createDistanceJoint(bodyA: Pl.b2Body, bodyB: Pl.b2Body, anchorA: Pl.XY, anchorB: Pl.XY, config: IDistanceJointConfig = {}) {
    const djd = new Pl.b2DistanceJointDef();
    const worldScale = this.worldScale;
    djd.Initialize(bodyA, bodyB, {x: anchorA.x / worldScale, y: anchorA.y / worldScale}, {x: anchorB.x / worldScale, y: anchorB.y / worldScale});
    djd.collideConnected = true;
    const length = config.length ? config.length / this.worldScale : 0;
    djd.length = length;
    djd.minLength = length;
    djd.maxLength = length;
    Pl.b2AngularStiffness(djd, config.frequencyHz || 15, config.dampingRatio || 10, djd.bodyA, djd.bodyB);
    return this.world.CreateJoint(djd);
  }

  setDistanceJointLength(joint: Pl.b2DistanceJoint, length: number, minLength?: number, maxLength?: number): void {
    // Note for some reason length does not update when min/max length aren't updated as well
    // min/max need to be called before SetLength, otherwise the hertz & damping settings of joint seem to be ignored
    if (!joint) return;
    joint.SetMinLength(minLength ? minLength / this.worldScale : joint.GetMinLength());
    joint.SetMaxLength(maxLength ? maxLength / this.worldScale : joint.GetMaxLength());
    joint.SetLength(length / this.worldScale);
  }

  isEdge(shape: Pl.b2Shape): shape is Pl.b2EdgeShape {
    return shape.GetType() === Pl.b2ShapeType.e_edge;
  }

  isChain(shape: Pl.b2Shape): shape is Pl.b2ChainShape {
    return shape.GetType() === Pl.b2ShapeType.e_chain;
  }

  isPolygon(shape: Pl.b2Shape): shape is Pl.b2PolygonShape {
    return shape.GetType() === Pl.b2ShapeType.e_polygon;
  }

  isCircle(shape: Pl.b2Shape): shape is Pl.b2CircleShape {
    return shape.GetType() === Pl.b2ShapeType.e_circle;
  }
}

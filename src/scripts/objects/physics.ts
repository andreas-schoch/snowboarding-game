import * as Ph from 'phaser';
import * as Pl from 'planck-js';


export class Physics {
  private scene: Ph.Scene;
  worldScale: number;
  world: Pl.World;
  private readonly textureKeys: Set<string> = new Set();

  constructor(scene: Ph.Scene, worldScale: number, gravity: Pl.Vec2) {
    this.scene = scene;
    this.worldScale = worldScale;
    this.world = Pl.World(gravity);
  }

  createBox(posX: number, posY: number, angle: number, width: number, height: number, isDynamic: boolean, color: number = 0xB68750): Pl.Body {
    // (angle / 180) * Math.PI
    const body = this.world.createBody({angle: angle, linearDamping: 0.15, angularDamping: 0.1});
    if (isDynamic) body.setDynamic();
    body.createFixture(Pl.Box(width / 2 / this.worldScale, height / 2 / this.worldScale), {friction: 0.001, restitution: 0.005, density: 0.1, isSensor: false});
    body.setPosition(Pl.Vec2(posX / this.worldScale, posY / this.worldScale));
    body.setMassData({mass: 0.5, center: Pl.Vec2(), I: 1});

    let userData = this.scene.add.graphics();
    userData.fillStyle(color);
    userData.fillRect(-width / 2, -height / 2, width * 2, height * 2);
    const key = `${width}-${height}-${color}`;
    if (!this.textureKeys.has(key)) {
      this.textureKeys.add(key);
      userData.generateTexture(key, width, height);
    }
    const img = this.scene.add.image(posX, posY, key);
    body.setUserData(img);
    return body;
  }

  createCircle(posX: number, posY: number, angle: number, radius: number, isDynamic: boolean, color: number = 0xF3D9F4): Pl.Body {
    const body = this.world.createBody({angle: (angle / 360) * Math.PI, linearDamping: 0.15, angularDamping: 0.1});
    if (isDynamic) body.setDynamic();
    body.createFixture(Pl.Circle(radius / this.worldScale), {friction: 0, restitution: 0.1, density: 0.1});
    body.setPosition(Pl.Vec2(posX / this.worldScale, posY / this.worldScale));
    body.setMassData({mass: 1, center: Pl.Vec2(), I: 1});

    const userData = this.scene.add.graphics();
    userData.fillStyle(color);
    userData.fillCircle(0, 0, radius);
    body.setUserData(userData);
    return body;
  }

  update() {
    let timeStep = (Math.round(this.scene.game.loop.delta) / 640);
    const iterations = Math.floor(Math.max(this.scene.game.loop.actualFps / 3, 2));

    this.world.step(timeStep, iterations, iterations);
    this.world.clearForces(); // recommended after each time step

    // iterate through all bodies
    const outOfBoundsX = this.scene.cameras.main.scrollX - 450;
    const worldScale = this.worldScale;
    for (let body = this.world.getBodyList(); body; body = body.getNext()) {
      if (!body) continue;

      // update the visible graphics object attached to the physics body
      let bodyRepresentation = body.getUserData() as Ph.GameObjects.Image;
      if (bodyRepresentation) {
        let pos = body.getPosition();
        bodyRepresentation.x = pos.x * worldScale;
        bodyRepresentation.y = pos.y * worldScale;
        bodyRepresentation.rotation = body.getAngle(); // in radians;
      } else {
        // Cleanup terrain fixtures which are out of sight
        for (let fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
          const shape = fixture.getShape();
          this.isChain(shape) && shape.m_vertices[shape.m_count - 1].x * worldScale < outOfBoundsX && body.destroyFixture(fixture);
        }
      }
    }
  }

  isEdge(shape: Pl.Shape): shape is Pl.Edge {
    return shape.getType() === 'edge';
  }

  isChain(shape: Pl.Shape): shape is Pl.Chain {
    return shape.getType() === 'chain';
  }

  isPolygon(shape: Pl.Shape): shape is Pl.Polygon {
    return shape.getType() === 'polygon';
  }

  isCircle(shape: Pl.Shape): shape is Pl.Circle {
    return shape.getType() === 'circle';
  }
}

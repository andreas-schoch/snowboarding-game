/*
*  R.U.B.E. Scene Loader for Phaser3 and https://github.com/lusito/box2d.ts.
* Based on provided example by Chris Campbell: https://www.iforce2d.net/rube/loaders/rube-phaser-sample.zip
*/

import * as Ph from 'phaser';
import * as Pl from '@box2d/core';
import {RubeBody, RubeFixture, RubeEntity, RubeScene, RubeJoint, RubeCustomPropertyTypes, RubeImage, RubeVector, RubeCustomProperty} from './RubeLoaderInterfaces';
import {DEBUG} from '../../index';


export class RubeLoader {
  private world: Pl.b2World;
  private debugGraphics: Ph.GameObjects.Graphics;
  private scene: Ph.Scene;
  private worldSize: number;

  loadedBodies: (Pl.b2Body | null)[];
  loadedJoints: (Pl.b2Joint | null)[];
  loadedImages: ((Ph.GameObjects.Image & RubeEntity) | null)[];

  constructor(world: Pl.b2World, debugGraphics: Ph.GameObjects.Graphics, scene: Ph.Scene, worldSize: number) {
    this.world = world;
    this.debugGraphics = debugGraphics;
    this.scene = scene;
    this.worldSize = worldSize;
  }

  loadScene(scene: RubeScene): boolean {
    this.loadedBodies = scene.body ? scene.body.map(bodyJson => this.loadBody(bodyJson)) : [];
    this.loadedJoints = scene.joint ? scene.joint.map(jointJson => this.loadJoint(jointJson)) : [];
    this.loadedImages = scene.image ? scene.image.map(imageJson => this.loadImage(imageJson)) : [];

    const success = this.loadedBodies.every(b => b) && this.loadedJoints.every(j => j) && this.loadedImages.every(i => i);
    success
      ? console.log(`R.U.B.E. scene loaded successfully`, this.loadedBodies, this.loadedJoints, this.loadedImages)
      : console.error(`R.U.B.E. scene failed to load fully`, this.loadedBodies, this.loadedJoints, this.loadedImages);
    return success;
  }

  private loadBody(bodyJson: RubeBody): Pl.b2Body | null {
    const bd: Pl.b2BodyDef = {};
    bd.type = Math.min(Math.max(bodyJson.type || 0, 0), 2); // clamp between 0-2.
    bd.angle = bodyJson.angle || 0;
    bd.angularVelocity = bodyJson.angularVelocity || 0;
    bd.awake = Boolean(bodyJson.awake);
    bd.enabled = bodyJson.hasOwnProperty('active') ? bodyJson.active : true;
    bd.fixedRotation = Boolean(bodyJson.fixedRotation);
    bd.linearVelocity = this.rubeToXY(bodyJson.linearVelocity);
    bd.linearDamping = bodyJson.linearDamping || 0;
    bd.angularDamping = bodyJson.angularDamping || 0;
    bd.position = this.rubeToXY(bodyJson.position);

    const body: Pl.b2Body & RubeEntity = this.world.CreateBody(bd);
    body.SetMassData({
      mass: bodyJson['massData-mass'] || 1,
      center: this.rubeToVec2(bodyJson['massData-center']),
      I: bodyJson['massData-I'] || 1,
    });

    body.name = bodyJson.name || '';
    body.customProperties = bodyJson.customProperties || [];
    body.customPropertiesMap = this.customPropertiesArrayToMap(body.customProperties || []);

    (bodyJson.fixture || []).map(fixtureJson => this.loadFixture(body, fixtureJson));
    return body;
  }

  private loadFixture(body: Pl.b2Body, fixtureJso: RubeFixture): Pl.b2Fixture {
    const fd: Pl.b2FixtureDef = this.getFixtureDefWithShape(fixtureJso, body);
    fd.friction = fixtureJso.friction || 0;
    fd.density = fixtureJso.density || 0;
    fd.restitution = fixtureJso.restitution || 0;
    fd.isSensor = Boolean(fixtureJso.sensor);
    fd.filter = {
      categoryBits: fixtureJso['filter-categoryBits'],
      maskBits: fixtureJso['filter-maskBits'] || 1,
      groupIndex: fixtureJso['filter-groupIndex'] || 65535,
    };

    const fixture: Pl.b2Fixture & RubeEntity = body.CreateFixture(fd);
    fixture.name = fixtureJso.name || '';
    fixture.customProperties = fixtureJso.customProperties || [];
    fixture.customPropertiesMap = this.customPropertiesArrayToMap(fixture.customProperties);

    return fixture;
  }

  private loadJoint(jointJson: RubeJoint): Pl.b2Joint | null {
    if (jointJson.bodyA >= this.loadedBodies.length) {
      console.error('Index for bodyA is invalid: ' + jointJson);
      return null;
    }
    if (jointJson.bodyB >= this.loadedBodies.length) {
      console.error('Index for bodyB is invalid: ' + jointJson);
      return null;
    }

    const bodyA = this.loadedBodies[jointJson.bodyA];
    const bodyB = this.loadedBodies[jointJson.bodyB];
    if (!bodyA || !bodyB) {
      console.error('bodyA or bodyB are invalid', bodyA, bodyB, this.loadedBodies);
      return null;
    }

    let joint: Pl.b2Joint & RubeEntity;
    switch (jointJson.type) {
      case 'revolute': {
        const jd = new Pl.b2RevoluteJointDef();
        jd.Initialize(bodyA, bodyB, this.rubeToVec2(jointJson.anchorA).Rotate(bodyA.GetAngle()).Add(bodyA.GetPosition()));
        jd.collideConnected = Boolean(jointJson.collideConnected);
        jd.referenceAngle = jointJson.refAngle || 0;
        jd.enableLimit = Boolean(jointJson.enableLimit);
        jd.lowerAngle = jointJson.lowerLimit || 0;
        jd.upperAngle = jointJson.upperLimit || 0;
        jd.enableMotor = Boolean(jointJson.enableMotor);
        jd.maxMotorTorque = jointJson.maxMotorTorque || 0;
        jd.motorSpeed = jointJson.motorSpeed || 0;
        joint = this.world.CreateJoint(jd);
        break;
      }
      // case 'rope': {
      //   // throw new Error('Rope joint not implemented');
      // }
      case 'distance': {
        const jd = new Pl.b2DistanceJointDef();
        jd.length = (jointJson.length || 0);
        jd.Initialize(
          bodyA,
          bodyB,
          this.rubeToVec2(jointJson.anchorA).Rotate(bodyA.GetAngle()).Add(bodyA.GetPosition()),
          this.rubeToVec2(jointJson.anchorB).Rotate(bodyB.GetAngle()).Add(bodyB.GetPosition()),
        );
        jd.collideConnected = Boolean(jointJson.collideConnected);
        jd.length = jointJson.length || 0;
        // Not sure what the proper way is, but without setting min and max length explicitly, it remains stiff.
        jd.minLength = 0;
        jd.maxLength = jd.length * 2;
        Pl.b2LinearStiffness(jd, jointJson.frequency || 0, jointJson.dampingRatio || 0, jd.bodyA, jd.bodyB);
        joint = this.world.CreateJoint(jd);
        break;
      }
      case 'prismatic': {
        const jd = new Pl.b2PrismaticJointDef();
        jd.Initialize(bodyA, bodyB, this.rubeToVec2(jointJson.anchorA).Rotate(bodyA.GetAngle()).Add(bodyA.GetPosition()), this.rubeToXY(jointJson.localAxisA));
        jd.collideConnected = Boolean(jointJson.collideConnected);
        jd.referenceAngle = jointJson.refAngle || 0;
        jd.enableLimit = Boolean(jointJson.enableLimit);
        jd.lowerTranslation = jointJson.lowerLimit || 0;
        jd.upperTranslation = jointJson.upperLimit || 0;
        jd.enableMotor = Boolean(jointJson.enableMotor);
        jd.maxMotorForce = jointJson.maxMotorForce || 0;
        jd.motorSpeed = jointJson.motorSpeed || 0;
        joint = this.world.CreateJoint(jd);
        break;
      }
      case 'wheel': {
        const jd = new Pl.b2WheelJointDef();
        // TODO anchorA is 0 and B is XY in world space, which should be used?
        jd.Initialize(bodyA, bodyB, this.rubeToVec2(jointJson.anchorB), this.rubeToVec2(jointJson.localAxisA));
        jd.collideConnected = Boolean(jointJson.collideConnected);
        jd.enableMotor = Boolean(jointJson.enableMotor);
        jd.maxMotorTorque = jointJson.maxMotorTorque || 0;
        jd.motorSpeed = jointJson.motorSpeed || 0;
        Pl.b2LinearStiffness(jd, jointJson.springFrequency || 0, jointJson.springDampingRatio || 0, jd.bodyA, jd.bodyB);
        joint = this.world.CreateJoint(jd);
        break;
      }
      case 'friction': {
        const jd = new Pl.b2FrictionJointDef();
        jd.Initialize(bodyA, bodyB, this.rubeToVec2(jointJson.anchorA).Rotate(bodyA.GetAngle()).Add(bodyA.GetPosition()));
        jd.collideConnected = Boolean(jointJson.collideConnected);
        jd.maxForce = jointJson.maxForce || 0;
        jd.maxTorque = jointJson.maxTorque || 0;
        joint = this.world.CreateJoint(jd);
        break;
      }
      case 'weld': {
        const jd = new Pl.b2WeldJointDef();
        jd.Initialize(bodyA, bodyB, this.rubeToVec2(jointJson.anchorA).Rotate(bodyA.GetAngle()).Add(bodyA.GetPosition()));
        jd.collideConnected = Boolean(jointJson.collideConnected);
        jd.referenceAngle = jointJson.refAngle || 0;
        Pl.b2AngularStiffness(jd, jointJson.frequency || 0, jointJson.dampingRatio || 0, jd.bodyA, jd.bodyB);
        joint = this.world.CreateJoint(jd);
        break;
      }
      default:
        throw new Error('Unsupported joint type: ' + jointJson.type);
    }

    joint.name = jointJson.name;
    joint.customProperties = jointJson.customProperties || [];
    joint.customPropertiesMap = this.customPropertiesArrayToMap(joint.customProperties);

    return joint;
  }

  private loadImage(imageJson: RubeImage): (Ph.GameObjects.Image & RubeEntity) | null {
    const {file, body, center, customProperties, angle, aspectScale, scale, flip, renderOrder} = imageJson;
    const bodyObj = this.loadedBodies[body];
    const pos = bodyObj ? bodyObj.GetPosition().Add(this.rubeToXY(center)) : this.rubeToXY(center);

    if (!pos) return null;

    const texture = this.getCustomProperty(imageJson, 'string', 'phaserTexture', '');
    // textureFallback is used when the images in the exported RUBE scene don't define the phaserTexture or phaserTextureFrame custom properties.
    // It is quite a hassle to set it within RUBE if not done from the start. In the future only the phaserTexture custom prop will be necessary to specify which atlas to use.
    // The textureFrame will be taken from the image file name.
    const textureFallback = (file || '').split('/').reverse()[0];
    const textureFrame = this.getCustomProperty(imageJson, 'string', 'phaserTextureFrame', textureFallback);
    const img: Ph.GameObjects.Image & RubeEntity = this.scene.add.image(pos.x * this.worldSize, pos.y * -this.worldSize, texture || textureFallback, textureFrame);
    img.rotation = bodyObj ? -bodyObj.GetAngle() + -(angle || 0) : -(angle || 0);
    img.scaleY = (this.worldSize / img.height) * scale;
    img.scaleX = img.scaleY * aspectScale;
    img.flipX = flip;
    img.setDepth(renderOrder);
    // @ts-ignore
    img.custom_origin_angle = -(angle || 0);
    img.customProperties = customProperties || [];
    img.customPropertiesMap = this.customPropertiesArrayToMap(img.customProperties);
    bodyObj && bodyObj.SetUserData(img);
    return img;
  }

///////////////////

  rubeToXY(val?: RubeVector, offset: Pl.XY = {x: 0, y: 0}): Pl.XY {
    return this.isXY(val) ? {x: val.x + offset.x, y: val.y + offset.y} : offset;
  }

  rubeToVec2(val?: RubeVector): Pl.b2Vec2 {
    return this.isXY(val) ? new Pl.b2Vec2(val.x, val.y) : new Pl.b2Vec2(0, 0);
  }

  getBodiesByName(name) {
    const bodies: Pl.b2Body[] = [];
    for (let body = this.world.GetBodyList(); body; body = body.GetNext()) {
      if (!body) continue;
      // @ts-ignore
      if (body.name === name) bodies.push(body);
    }
    return bodies;
  }

  getBodiesByCustomProperty(propertyType: RubeCustomPropertyTypes, propertyName: string, valueToMatch: unknown): Pl.b2Body[] {
    const bodies: Pl.b2Body[] = [];
    type b = Pl.b2Body & RubeEntity | null;
    for (let body: b = this.world.GetBodyList(); body; body = body.GetNext()) {
      if (!body || !body.customProperties) continue;
      for (let i = 0; i < body.customProperties.length; i++) {
        if (!body.customProperties[i].hasOwnProperty('name'))
          continue;
        if (!body.customProperties[i].hasOwnProperty(propertyType))
          continue;
        if (body.customProperties[i].name == propertyName &&
          body.customProperties[i][propertyType] == valueToMatch) // TODO refactor to strict equals
          bodies.push(body);
      }
    }
    return bodies;
  }

  getFixturesByCustomProperty(propertyType: RubeCustomPropertyTypes, propertyName: string, valueToMatch: unknown): Pl.b2Fixture[] {
    const fixtures: Pl.b2Fixture[] = [];
    type f = Pl.b2Fixture & RubeEntity | null;
    for (let body = this.world.GetBodyList(); body; body = body.GetNext()) {
      for (let fixture: f = body.GetFixtureList(); fixture; fixture = fixture.GetNext()) {
        if (!fixture || !fixture.customProperties) continue;
        for (let i = 0; i < fixture.customProperties.length; i++) {
          if (!fixture.customProperties[i].hasOwnProperty('name')) continue;
          if (!fixture.customProperties[i].hasOwnProperty(propertyType)) continue;
          if (fixture.customProperties[i].name == propertyName &&
            fixture.customProperties[i][propertyType] == valueToMatch) // TODO refactor to strict equals
            fixtures.push(fixture);
        }
      }
    }
    return fixtures;
  }

  getJointsByCustomProperty(propertyType: RubeCustomPropertyTypes, propertyName: string, valueToMatch: unknown): Pl.b2Joint[] {
    const joints: Pl.b2Joint[] = [];
    type j = Pl.b2Joint & RubeEntity | null;
    for (let joint: j = this.world.GetJointList(); joint; joint = joint.GetNext()) {
      if (!joint || !joint.customProperties) continue;
      for (let i = 0; i < joint.customProperties.length; i++) {
        if (!joint.customProperties[i].hasOwnProperty('name'))
          continue;
        if (!joint.customProperties[i].hasOwnProperty(propertyType))
          continue;
        if (joint.customProperties[i].name == propertyName &&
          joint.customProperties[i][propertyType] == valueToMatch) // TODO refactor to strict equals
          joints.push(joint);
      }
    }
    return joints;
  }

  // TODO turn into map instead of having to iterate over custom props
  getCustomProperty<T = unknown>(entity: RubeEntity, propertyType: RubeCustomPropertyTypes, propertyName: string, defaultValue: T): T {
    if (!entity.customProperties) return defaultValue;
    for (const prop of entity.customProperties) {
      if (!prop.name || !prop.hasOwnProperty(propertyType)) continue;
      if (prop.name === propertyName) return prop[propertyType] as unknown as T;
    }
    return defaultValue;
  }

  private customPropertiesArrayToMap(customProperties: RubeCustomProperty[]): { [key: string]: unknown } {
    return customProperties.reduce((obj, cur) => {
      if (cur.hasOwnProperty('int')) obj[cur.name] = cur.int;
      else if (cur.hasOwnProperty('float')) obj[cur.name] = cur.float;
      else if (cur.hasOwnProperty('string')) obj[cur.name] = cur.string;
      else if (cur.hasOwnProperty('color')) obj[cur.name] = cur.color;
      else if (cur.hasOwnProperty('bool')) obj[cur.name] = cur.bool;
      else if (cur.hasOwnProperty('vec2')) obj[cur.name] = this.rubeToXY(cur.vec2);
      else throw new Error('invalid or missing custom property type');
      return obj;
    }, {});
  }

  private getFixtureDefWithShape(fixtureJso: RubeFixture, body: Pl.b2Body): Pl.b2FixtureDef {
    if (fixtureJso.hasOwnProperty('circle') && fixtureJso.circle) {
      const shape = new Pl.b2CircleShape();
      shape.Set(this.rubeToXY(fixtureJso.circle.center), fixtureJso.circle.radius);
      const bodyPos = body.GetPosition().Clone().Add(shape.m_p).Scale(this.worldSize);
      DEBUG && this.debugGraphics.strokeCircle(bodyPos.x, -bodyPos.y, fixtureJso.circle.radius * this.worldSize);
      return {shape};
    } else if (fixtureJso.hasOwnProperty('polygon') && fixtureJso.polygon) {
      const verts = this.pointsFromSeparatedVertices(fixtureJso.polygon.vertices).reverse();
      const bodyPos = body.GetPosition();
      if (DEBUG) {
        const pxVerts = verts
        .map(p => bodyPos.Clone().Add(new Pl.b2Vec2(p.x, p.y).Rotate(body.GetAngle())).Scale(this.worldSize))
        .map(({x, y}) => ({x: x, y: -y}));
        this.debugGraphics.strokePoints(pxVerts, true).setDepth(100);
      }
      return {shape: new Pl.b2PolygonShape().Set(verts, verts.length)};
    } else if (fixtureJso.hasOwnProperty('chain') && fixtureJso.chain) {
      const verts = this.pointsFromSeparatedVertices(fixtureJso.chain.vertices).reverse();
      const bodyPos = body.GetPosition();
      if (DEBUG) {
        const pxVerts = verts
        .map(p => bodyPos.Clone().Add(new Pl.b2Vec2(p.x, p.y).Rotate(body.GetAngle())).Scale(this.worldSize))
        .map(({x, y}) => ({x: x, y: -y}));
        this.debugGraphics.strokePoints(pxVerts).setDepth(100);
      }
      const isLoop = fixtureJso.chain.hasNextVertex && fixtureJso.chain.hasPrevVertex && fixtureJso.chain.nextVertex && fixtureJso.chain.prevVertex;
      // TODO should polygon create loop chain instead to avoid ghost collisions? https://box2d.org/posts/2020/06/ghost-collisions/
      const shape = isLoop
        ? new Pl.b2ChainShape().CreateLoop(verts, verts.length)
        : new Pl.b2ChainShape().CreateChain(verts, verts.length, this.rubeToXY(fixtureJso.chain.prevVertex), this.rubeToXY(fixtureJso.chain.nextVertex));
      return {shape};
    } else {
      throw new Error('Could not find shape type for fixture');
    }
  }

  private pointsFromSeparatedVertices(vertices: { x: number[], y: number[] }) {
    const verts: Pl.XY[] = [];
    for (let v = 0; v < vertices.x.length; v++)
      // In RUBE Editor the Y coordinates are upside down when compared to Phaser3
      verts.push(new Pl.b2Vec2(vertices.x[v], vertices.y[v]));
    return verts;
  }

  private isXY(val: unknown): val is Pl.XY {
    return Boolean(val && typeof val === 'object' && val.hasOwnProperty('x') && val.hasOwnProperty('y'));
  }
}

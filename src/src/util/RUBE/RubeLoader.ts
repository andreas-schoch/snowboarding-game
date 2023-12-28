/*
*  R.U.B.E. Scene Loader for Phaser3 and https://github.com/Birch-san/box2d-wasm
* (see commit before SHA 5afd7c2 to find previous RubeLoader version for https://github.com/lusito/box2d.ts)
* Based on provided example by Chris Campbell: https://www.iforce2d.net/rube/loaders/rube-phaser-sample.zip
*/

import { b2 } from '../..';
import { RubeBody, RubeFixture, RubeScene, RubeJoint, RubeImage, RubeVector, RubeCustomProperty } from './RubeLoaderInterfaces';
import { vec2Util } from './Vec2Math';

export type CustomPropOwner = Box2D.b2Body | Box2D.b2Fixture | Box2D.b2Joint;

export class RubeLoader<IMG = unknown> {
  handleLoadImage: (imageJson: RubeImage, bodyObj: Box2D.b2Body | null, customPropsMap: { [key: string]: unknown }) => IMG | null = () => null;

  loadedBodies: (Box2D.b2Body | null)[] = [];
  loadedJoints: (Box2D.b2Joint | null)[] = [];
  loadedImages: (IMG | null)[] = []; // depends on with what engine this loader is used. Maybe make generic

  private world: Box2D.b2World;
  private bodyByName: Map<string, Box2D.b2Body[]> = new Map();

  bodyUserDataMap: Map<Box2D.b2Body, { name: string, image: IMG | null }> = new Map();
  customPropertiesMap: Map<CustomPropOwner | IMG, { [key: string]: unknown }> = new Map();

  constructor(world: Box2D.b2World) {
    this.world = world;
  }

  loadScene(scene: RubeScene): boolean {
    this.loadedBodies = scene.body ? scene.body.map(bodyJson => this.loadBody(bodyJson)) : this.loadedBodies;
    this.loadedJoints = scene.joint ? scene.joint.map(jointJson => this.loadJoint(jointJson)) : this.loadedJoints;
    this.loadedImages = scene.image ? scene.image.map(imageJson => this.loadImage(imageJson)) : this.loadedImages;

    const success = this.loadedBodies.every(b => b) && this.loadedJoints.every(j => j) && this.loadedImages.every(i => i);
    if (success) console.log(`R.U.B.E. scene loaded successfully`, this.loadedBodies, this.loadedJoints, this.loadedImages);
    else console.error(`R.U.B.E. scene failed to load fully`, this.loadedBodies, this.loadedJoints, this.loadedImages);
    return success;
  }

  getBodiesByName(name) {
    const bodies = this.bodyByName.get(name) || [];
    return bodies;
  }

  getBodiesByCustomProperty(propertyName: string, valueToMatch: unknown): Box2D.b2Body[] {
    const bodies: Box2D.b2Body[] = [];
    for (let body = this.world.GetBodyList(); b2.getPointer(body) !== b2.getPointer(b2.NULL); body = body.GetNext()) {
      const props = this.customPropertiesMap.get(body);
      if (!props) continue;
      if (props[propertyName] !== valueToMatch) continue;
      bodies.push(body);
    }
    return bodies;
  }

  getFixturesByCustomProperty(propertyName: string, valueToMatch: unknown): Box2D.b2Fixture[] {
    const fixtures: Box2D.b2Fixture[] = [];
    type f = Box2D.b2Fixture | null;
    for (let body = this.world.GetBodyList(); body; body = body.GetNext()) {
      for (let fixture: f = body.GetFixtureList(); fixture; fixture = fixture.GetNext()) {
        const props = this.customPropertiesMap.get(fixture);
        if (!props) continue;
        if (props[propertyName] !== valueToMatch) continue;
        fixtures.push(fixture);
      }
    }
    return fixtures;
  }

  getJointsByCustomProperty(propertyName: string, valueToMatch: unknown): Box2D.b2Joint[] {
    const joints: Box2D.b2Joint[] = [];
    type j = Box2D.b2Joint | null;
    for (let joint = this.world.GetJointList(); b2.getPointer(joint) !== b2.getPointer(b2.NULL); joint = joint.GetNext()) {
      const props = this.customPropertiesMap.get(joint);
      if (!props) continue;
      if (props[propertyName] !== valueToMatch) continue;
      joints.push(joint);
    }
    return joints;
  }

  rubeToVec2(val?: RubeVector, vec: Box2D.b2Vec2 = new b2.b2Vec2(0, 0)): Box2D.b2Vec2 {
    this.isXY(val) ? vec.Set(val.x, val.y) : vec.Set(0, 0);
    return vec;
  }

  private loadBody(bodyJson: RubeBody): Box2D.b2Body | null {
    const bd = new b2.b2BodyDef();
    bd.set_type(Math.min(Math.max(bodyJson.type || 0, 0), 2)); // clamp between 0-2.
    bd.set_angle(bodyJson.angle || 0);
    bd.set_angularVelocity(bodyJson.angularVelocity || 0);
    bd.set_awake(Boolean(bodyJson.awake));
    bd.set_enabled(bodyJson.hasOwnProperty('active') ? Boolean(bodyJson.active) : true);
    bd.set_fixedRotation(Boolean(bodyJson.fixedRotation));
    bd.set_linearVelocity(this.rubeToVec2(bodyJson.linearVelocity));
    bd.set_linearDamping(bodyJson.linearDamping || 0);
    bd.set_angularDamping(bodyJson.angularDamping || 0);
    bd.set_position(this.rubeToVec2(bodyJson.position));
    bd.set_bullet(Boolean(bodyJson.bullet || false));

    const massData = new b2.b2MassData();
    massData.mass = bodyJson['massData-mass'] || 1;
    massData.center = this.rubeToVec2(bodyJson['massData-center']);
    massData.I = bodyJson['massData-I'] || 1;

    const body: Box2D.b2Body = this.world.CreateBody(bd);
    body.SetMassData(massData);
    b2.destroy(massData);
    b2.destroy(bd);

    this.bodyUserDataMap.set(body, { name: bodyJson.name || '', image: null });
    this.customPropertiesMap.set(body, this.customPropertiesArrayToMap(bodyJson.customProperties || []));
    (bodyJson.fixture || []).forEach(fixtureJson => this.loadFixture(body, fixtureJson));
    return body;
  }

  private loadFixture(body: Box2D.b2Body, fixtureJso: RubeFixture): Box2D.b2Fixture {
    const filter = new b2.b2Filter();
    filter.set_categoryBits(fixtureJso['filter-categoryBits'] || 1);
    filter.set_maskBits(fixtureJso['filter-maskBits'] || 65535);
    filter.set_groupIndex(fixtureJso['filter-groupIndex'] || 0);

    const fd: Box2D.b2FixtureDef = this.getFixtureDefWithShape(fixtureJso);
    fd.set_friction(fixtureJso.friction || 0);
    fd.set_density(fixtureJso.density || 0);
    fd.set_restitution(fixtureJso.restitution || 0);
    fd.set_isSensor(Boolean(fixtureJso.sensor));
    fd.set_filter(filter);

    const fixture: Box2D.b2Fixture = body.CreateFixture(fd);
    b2.destroy(fd);
    b2.destroy(filter);
    this.customPropertiesMap.set(fixture, this.customPropertiesArrayToMap(fixtureJso.customProperties || []));
    return fixture;
  }

  private loadJoint(jointJson: RubeJoint): Box2D.b2Joint | null {
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

    let joint: Box2D.b2Joint;
    switch (jointJson.type) {
      case 'revolute': {
        const jd = new b2.b2RevoluteJointDef();
        jd.Initialize(bodyA, bodyB, vec2Util.Add(vec2Util.Rotate(this.rubeToVec2(jointJson.anchorA), bodyA.GetAngle()), bodyA.GetPosition()));
        jd.collideConnected = Boolean(jointJson.collideConnected);
        jd.referenceAngle = jointJson.refAngle || 0;
        jd.enableLimit = Boolean(jointJson.enableLimit);
        jd.lowerAngle = jointJson.lowerLimit || 0;
        jd.upperAngle = jointJson.upperLimit || 0;
        jd.enableMotor = Boolean(jointJson.enableMotor);
        jd.maxMotorTorque = jointJson.maxMotorTorque || 0;
        jd.motorSpeed = jointJson.motorSpeed || 0;
        joint = this.world.CreateJoint(jd);
        b2.destroy(jd);
        break;
      }
      // case 'rope': {
      //   // throw new Error('Rope joint not implemented');
      // }
      case 'distance': {
        const jd = new b2.b2DistanceJointDef();
        jd.length = (jointJson.length || 0);
        jd.Initialize(
          bodyA,
          bodyB,
          vec2Util.Add(vec2Util.Rotate(this.rubeToVec2(jointJson.anchorA), bodyA.GetAngle()), bodyA.GetPosition()),
          vec2Util.Add(vec2Util.Rotate(this.rubeToVec2(jointJson.anchorB), bodyB.GetAngle()), bodyB.GetPosition()),
        );
        jd.collideConnected = Boolean(jointJson.collideConnected);
        jd.length = jointJson.length || 0;
        // Not sure what the proper way is, but without setting min and max length explicitly, it remains stiff.
        jd.minLength = 0;
        jd.maxLength = jd.length * 2;
        this.setLinearStiffness(jd, jointJson.frequency || 0, jointJson.dampingRatio || 0, jd.bodyA, jd.bodyB);
        joint = this.world.CreateJoint(jd);
        b2.destroy(jd);
        break;
      }
      case 'prismatic': {
        const jd = new b2.b2PrismaticJointDef();
        jd.Initialize(bodyA, bodyB, vec2Util.Add(vec2Util.Rotate(this.rubeToVec2(jointJson.anchorA), bodyA.GetAngle()), bodyA.GetPosition()), this.rubeToVec2(jointJson.localAxisA));
        jd.collideConnected = Boolean(jointJson.collideConnected);
        jd.referenceAngle = jointJson.refAngle || 0;
        jd.enableLimit = Boolean(jointJson.enableLimit);
        jd.lowerTranslation = jointJson.lowerLimit || 0;
        jd.upperTranslation = jointJson.upperLimit || 0;
        jd.enableMotor = Boolean(jointJson.enableMotor);
        jd.maxMotorForce = jointJson.maxMotorForce || 0;
        jd.motorSpeed = jointJson.motorSpeed || 0;
        joint = this.world.CreateJoint(jd);
        b2.destroy(jd);
        break;
      }
      case 'wheel': {
        const jd = new b2.b2WheelJointDef();
        // TODO anchorA is 0 and B is XY in world space, which should be used?
        jd.Initialize(bodyA, bodyB, this.rubeToVec2(jointJson.anchorB), this.rubeToVec2(jointJson.localAxisA));
        jd.collideConnected = Boolean(jointJson.collideConnected);
        jd.enableMotor = Boolean(jointJson.enableMotor);
        jd.maxMotorTorque = jointJson.maxMotorTorque || 0;
        jd.motorSpeed = jointJson.motorSpeed || 0;
        this.setLinearStiffness(jd, jointJson.springFrequency || 0, jointJson.springDampingRatio || 0, jd.bodyA, jd.bodyB);
        joint = this.world.CreateJoint(jd);
        b2.destroy(jd);
        break;
      }
      case 'friction': {
        const jd = new b2.b2FrictionJointDef();
        jd.Initialize(bodyA, bodyB, vec2Util.Add(vec2Util.Rotate(this.rubeToVec2(jointJson.anchorA), bodyA.GetAngle()), bodyA.GetPosition()));
        jd.collideConnected = Boolean(jointJson.collideConnected);
        jd.maxForce = jointJson.maxForce || 0;
        jd.maxTorque = jointJson.maxTorque || 0;
        joint = this.world.CreateJoint(jd);
        b2.destroy(jd);
        break;
      }
      case 'weld': {
        const jd = new b2.b2WeldJointDef();
        jd.Initialize(bodyA, bodyB, vec2Util.Add(vec2Util.Rotate(this.rubeToVec2(jointJson.anchorA), bodyA.GetAngle()), bodyA.GetPosition()));
        jd.collideConnected = Boolean(jointJson.collideConnected);
        jd.referenceAngle = jointJson.refAngle || 0;
        this.setAngularStiffness(jd, jointJson.frequency || 0, jointJson.dampingRatio || 0, jd.bodyA, jd.bodyB);
        joint = this.world.CreateJoint(jd);
        b2.destroy(jd);
        break;
      }
      default:
        throw new Error('Unsupported joint type: ' + jointJson.type);
    }

    this.customPropertiesMap.set(joint, this.customPropertiesArrayToMap(jointJson.customProperties || []));
    return joint;
  }

  private setLinearStiffness(jd: { stiffness: number, damping: number }, frequency: number, dampingRatio: number, bodyA: Box2D.b2Body, bodyB: Box2D.b2Body) {
    // See comment for b2LinearStiffness to see why this is done in such a way
    const output_p = b2._malloc(Float32Array.BYTES_PER_ELEMENT * 2);
    b2.b2LinearStiffness(output_p, output_p + Float32Array.BYTES_PER_ELEMENT, frequency || 0, dampingRatio || 0, bodyA, bodyB);
    const [stiffness, damping] = b2.HEAPF32.subarray(output_p >> 2);
    b2._free(output_p);
    jd.stiffness = stiffness;
    jd.damping = damping;
  }

  private setAngularStiffness(jd: { stiffness: number, damping: number }, frequency: number, dampingRatio: number, bodyA: Box2D.b2Body, bodyB: Box2D.b2Body) {
    // See comment for b2AngularStiffness to see why this is done in such a way
    const output_p = b2._malloc(Float32Array.BYTES_PER_ELEMENT * 2);
    b2.b2AngularStiffness(output_p, output_p + Float32Array.BYTES_PER_ELEMENT, frequency || 0, dampingRatio || 0, bodyA, bodyB);
    const [stiffness, damping] = b2.HEAPF32.subarray(output_p >> 2);
    b2._free(output_p);
    jd.stiffness = stiffness;
    jd.damping = damping;
  }

  private loadImage(imageJson: RubeImage): IMG | null {
    const { body, customProperties } = imageJson;
    const bodyObj = this.loadedBodies[body];
    const customProps = this.customPropertiesArrayToMap(customProperties || []);
    const img = this.handleLoadImage(imageJson, bodyObj, customProps);
    if (!img) return null;
    const props = this.customPropertiesArrayToMap(customProperties || []);
    this.customPropertiesMap.set(img, props);
    if (bodyObj) {
      const userData = this.bodyUserDataMap.get(bodyObj);
      if (!userData) throw new Error('bodyUserDataMap is missing bodyObj. this should never happen');
      userData.image = img;
    }
    return img;
  }

  private customPropertiesArrayToMap(customProperties: RubeCustomProperty[]): Record<string, unknown> {
    return customProperties.reduce((obj, cur) => {
      if (cur.hasOwnProperty('int')) obj[cur.name] = cur.int;
      else if (cur.hasOwnProperty('float')) obj[cur.name] = cur.float;
      else if (cur.hasOwnProperty('string')) obj[cur.name] = cur.string;
      else if (cur.hasOwnProperty('color')) obj[cur.name] = cur.color;
      else if (cur.hasOwnProperty('bool')) obj[cur.name] = cur.bool;
      else if (cur.hasOwnProperty('vec2')) obj[cur.name] = this.rubeToVec2(cur.vec2);
      else throw new Error('invalid or missing custom property type');
      return obj;
    }, {});
  }

  private getFixtureDefWithShape(fixtureJso: RubeFixture): Box2D.b2FixtureDef {
    const def = new b2.b2FixtureDef();
    if (fixtureJso.hasOwnProperty('circle') && fixtureJso.circle) def.shape = this.createCircleShape(fixtureJso.circle);
    else if (fixtureJso.hasOwnProperty('polygon') && fixtureJso.polygon) def.shape = this.createPolygonShape(fixtureJso.polygon);
    else if (fixtureJso.hasOwnProperty('chain') && fixtureJso.chain) def.shape = this.createChainShape(fixtureJso.chain);
    else throw new Error('Could not find shape type for fixture');
    return def;
  }

  private createCircleShape(circle: RubeFixture['circle']): Box2D.b2CircleShape {
    if (!circle) throw new Error('fixtureJson.circle is missing');
    const shape = new b2.b2CircleShape();
    shape.set_m_radius(circle.radius);
    shape.set_m_p(this.rubeToVec2(circle.center));
    return shape;
  }

  private createPolygonShape(polygon: RubeFixture['polygon']): Box2D.b2PolygonShape {
    if (!polygon) throw new Error('fixtureJson.polygon is missing');
    const vertices = this.pointsFromSeparatedVertices(polygon.vertices).reverse();

    const { _malloc, b2Vec2, b2PolygonShape, HEAPF32, wrapPointer } = b2;
    const shape = new b2PolygonShape();
    const buffer = _malloc(vertices.length * 8);
    let offset = 0;
    for (let i = 0; i < vertices.length; i++) {
      HEAPF32[buffer + offset >> 2] = vertices[i].get_x();
      HEAPF32[buffer + (offset + 4) >> 2] = vertices[i].get_y();
      offset += 8;
    }
    const ptr_wrapped = wrapPointer(buffer, b2Vec2);
    shape.Set(ptr_wrapped, vertices.length);
    return shape;
  }

  // Taken from https://github.com/Birch-san/box2d-wasm/blob/c2d7e244787bfc619c1ea80d09e7ceb72294be85/integration-test/src/helpers.ts#L32
  // http://stackoverflow.com/questions/12792486/emscripten-bindings-how-to-create-an-accessible-c-c-array-from-javascript
  private createChainShape(chain: RubeFixture['chain']): Box2D.b2ChainShape {
    if (!chain) throw new Error('fixtureJson.chain is missing');
    const vertices = this.pointsFromSeparatedVertices(chain.vertices).reverse();
    const closedLoop = Boolean(chain.hasNextVertex && chain.hasPrevVertex && chain.nextVertex && chain.prevVertex);

    const { _malloc, b2Vec2, b2ChainShape, HEAPF32, wrapPointer } = b2;
    const shape = new b2ChainShape();
    const buffer = _malloc(vertices.length * 8);
    let offset = 0;
    for (let i = 0; i < vertices.length; i++) {
      HEAPF32[buffer + offset >> 2] = vertices[i].get_x();
      HEAPF32[buffer + (offset + 4) >> 2] = vertices[i].get_y();
      offset += 8;
    }
    const ptr_wrapped = wrapPointer(buffer, b2Vec2);
    if (closedLoop) shape.CreateLoop(ptr_wrapped, vertices.length);
    else shape.CreateChain(ptr_wrapped, vertices.length, this.rubeToVec2(chain.prevVertex), this.rubeToVec2(chain.nextVertex));
    return shape;
  }

  private pointsFromSeparatedVertices(vertices: { x: number[], y: number[] }) {
    const verts: Box2D.b2Vec2[] = [];
    for (let v = 0; v < vertices.x.length; v++)
      // In RUBE Editor the Y coordinates are upside down when compared to Phaser3
      verts.push(new b2.b2Vec2(vertices.x[v], vertices.y[v]));
    return verts;
  }

  private isXY(val: unknown): val is Box2D.b2Vec2 {
    return Boolean(val && typeof val === 'object' && val.hasOwnProperty('x') && val.hasOwnProperty('y'));
  }
}

/*
*  R.U.B.E. Scene Loader for https://github.com/Birch-san/box2d-wasm
* (see commit before SHA 5afd7c2 to find previous RubeLoader version for https://github.com/lusito/box2d.ts)
* Based on example loader by Chris Campbell (creator of RUBE editor): https://github.com/iforce2d/b2dJson/blob/master/js/loadrube.js
*/

import {b2, recordLeak} from '../..';
import {pseudoRandomId} from '../../helpers/pseudoRandomId';
import {RubeBody, RubeFixture, RubeScene, RubeJoint, RubeImage, RubeVector, RubeCustomProperty} from './RubeLoaderInterfaces';
import {vec2Util} from './Vec2Math';
import {sanitizeRubeDefaults} from './sanitizeRubeDefaults';

export type CustomPropOwner = Box2D.b2Body | Box2D.b2Fixture | Box2D.b2Joint;

export interface LoadedScene<IMG = unknown> {
  id: string;
  bodies: (Box2D.b2Body | null)[];
  joints: (Box2D.b2Joint | null)[];
  images: (IMG | null)[];
}

export class RubeLoader<IMG = unknown> {
  handleLoadImage: (imageJson: RubeImage, bodyObj: Box2D.b2Body | null, customPropsMap: {[key: string]: unknown}) => IMG | null = () => null;
  readonly userData: Map<Box2D.b2Body, {name: string, image: IMG | null}> = new Map();
  readonly customProps: Map<CustomPropOwner | IMG, {[key: string]: unknown}> = new Map();
  readonly loadedScenes: Map<LoadedScene['id'], LoadedScene<IMG>> = new Map();

  private loadingBodies: LoadedScene['bodies'] = [];
  private loadingJoints: LoadedScene['joints'] = [];
  private loadingImages: LoadedScene<IMG>['images'] = [];

  constructor(private world: Box2D.b2World) {
  }

  load(scene: RubeScene, offsetX: number = 0, offsetY: number = 0): [boolean, LoadedScene['id']] {
    // Note that all the defaults should already have been set within sanitizeRubeDefaults()
    // But for now we keep setting defaults in this loader as well until continuing work on my own level editor
    scene = sanitizeRubeDefaults(scene);
    this.loadingBodies = scene.body ? scene.body.map(bodyJson => this.loadBody(bodyJson, offsetX, offsetY)) : [];
    this.loadingJoints = scene.joint ? scene.joint.map(jointJson => this.loadJoint(jointJson)) : [];
    this.loadingImages = scene.image ? scene.image.map(imageJson => this.loadImage(imageJson)) : [];

    const success = this.loadingBodies.every(b => b) && this.loadingJoints.every(j => j) && this.loadingImages.every(i => i);
    if (success) console.debug('R.U.B.E. scene loaded successfully', this.loadingBodies, this.loadingJoints, this.loadingImages);
    else console.error('R.U.B.E. scene failed to load fully', this.loadingBodies, this.loadingJoints, this.loadingImages);
    const id = pseudoRandomId();
    this.loadedScenes.set(id, {bodies: this.loadingBodies, joints: this.loadingJoints, images: this.loadingImages, id});
    this.loadingBodies = [];
    this.loadingJoints = [];
    this.loadingImages = [];
    return [success, id];
  }

  getBodiesByCustomProperty(propertyName: string, valueToMatch: unknown, sceneId?: LoadedScene['id']): Box2D.b2Body[] {
    const bodies: Box2D.b2Body[] = [];
    for (let body = recordLeak(this.world.GetBodyList()); b2.getPointer(body) !== b2.getPointer(b2.NULL); body = recordLeak(body.GetNext())) {
      if (sceneId && !this.loadedScenes.get(sceneId)!.bodies.includes(body)) continue; // TODO turn into set
      const props = this.customProps.get(body);
      if (!props) continue;
      if (props[propertyName] !== valueToMatch) continue;
      bodies.push(body);
    }
    return bodies;
  }

  getFixturesByCustomProperty(propertyName: string, valueToMatch: unknown, sceneId?: LoadedScene['id']): Box2D.b2Fixture[] {
    const fixtures: Box2D.b2Fixture[] = [];
    for (let body = recordLeak(this.world.GetBodyList()); b2.getPointer(body) !== b2.getPointer(b2.NULL); body = recordLeak(body.GetNext())) {
      if (sceneId && !this.loadedScenes.get(sceneId)!.bodies.includes(body)) continue; // TODO turn into set
      for (let fixture = recordLeak(body.GetFixtureList()); b2.getPointer(fixture) !== b2.getPointer(b2.NULL); fixture = recordLeak(fixture.GetNext())) {
        const props = this.customProps.get(fixture);
        if (!props) continue;
        if (props[propertyName] !== valueToMatch) continue;
        fixtures.push(fixture);
      }
    }
    return fixtures;
  }

  getJointsByCustomProperty(propertyName: string, valueToMatch: unknown, sceneId?: LoadedScene['id']): Box2D.b2Joint[] {
    const joints: Box2D.b2Joint[] = [];
    for (let joint = recordLeak(this.world.GetJointList()); b2.getPointer(joint) !== b2.getPointer(b2.NULL); joint = recordLeak(joint.GetNext())) {
      if (sceneId && !this.loadedScenes.get(sceneId)!.joints.includes(joint)) continue; // TODO turn into set
      const props = this.customProps.get(joint);
      if (!props) continue;
      if (props[propertyName] !== valueToMatch) continue;
      joints.push(joint);
    }
    return joints;
  }

  rubeToVec2(val?: RubeVector, offsetX = 0, offsetY = 0): Box2D.b2Vec2 {
    const vec = recordLeak(new b2.b2Vec2(0, 0)); // TODO ensure this doesn't cause errors as recordLeak did when I tried wrapping everything in it
    if (this.isXY(val)) vec.Set(val.x + offsetX, val.y + offsetY);
    // Non-compacted scenes seem to be around 5-10% larger in character size but it's negligible for the moment.
    // While the app can handle compact zero vectors, protobuf does not seem to support conditional types like that.
    else if (val === 0) throw new Error('Ensure the option "Compact zero vectors" is disabled for the loaded rube scene.');
    return vec;
  }

  cleanup() {
    // Seems to be recommended https://github.com/Birch-san/box2d-wasm/blob/master/docs/memory-model.md
    for (let body = recordLeak(this.world.GetBodyList()); b2.getPointer(body) !== b2.getPointer(b2.NULL); body = recordLeak(body.GetNext())) {
      this.world.DestroyBody(body);
    }

    for (let joint = recordLeak(this.world.GetJointList()); b2.getPointer(joint) !== b2.getPointer(b2.NULL); joint = recordLeak(joint.GetNext())) {
      this.world.DestroyJoint(joint);
    }
  }

  private loadBody(bodyJson: RubeBody, offsetX: number, offsetY: number): Box2D.b2Body | null {
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
    bd.set_position(this.rubeToVec2(bodyJson.position, offsetX, offsetY));
    bd.set_bullet(Boolean(bodyJson.bullet || false));

    const massData = new b2.b2MassData();
    massData.set_mass(bodyJson['massData-mass'] || bodyJson.massDataMass || 1);
    massData.set_center(this.rubeToVec2(bodyJson['massData-center'] || bodyJson.massDataCenter));
    massData.set_I(bodyJson['massData-I'] || bodyJson.massDataI || 1);

    const body: Box2D.b2Body = this.world.CreateBody(bd);
    body.SetMassData(massData);
    b2.destroy(massData);
    b2.destroy(bd);

    this.userData.set(body, {name: bodyJson.name || '', image: null});
    this.customProps.set(body, this.customPropertiesArrayToMap(bodyJson.customProperties || []));
    (bodyJson.fixture || []).forEach(fixtureJson => this.loadFixture(body, fixtureJson));
    return body;
  }

  private loadFixture(body: Box2D.b2Body, fixtureJso: RubeFixture): Box2D.b2Fixture {
    const filter = new b2.b2Filter();
    filter.set_categoryBits(fixtureJso['filter-categoryBits'] || fixtureJso.filterCategoryBits || 1);
    filter.set_maskBits(fixtureJso['filter-maskBits'] || fixtureJso.filterMaskBits || 65535);
    filter.set_groupIndex(fixtureJso['filter-groupIndex'] || fixtureJso.filterGroupIndex || 0);

    const fd: Box2D.b2FixtureDef = this.getFixtureDefWithShape(fixtureJso);
    fd.set_friction(fixtureJso.friction || 0);
    fd.set_density(fixtureJso.density || 0);
    fd.set_restitution(fixtureJso.restitution || 0);
    fd.set_isSensor(Boolean(fixtureJso.sensor));
    fd.set_filter(filter);

    const fixture: Box2D.b2Fixture = body.CreateFixture(fd);
    b2.destroy(fd);
    b2.destroy(filter);
    this.customProps.set(fixture, this.customPropertiesArrayToMap(fixtureJso.customProperties || []));
    return fixture;
  }

  private loadJoint(jointJson: RubeJoint): Box2D.b2Joint | null {
    if (jointJson.bodyA >= this.loadingBodies.length) {
      console.error('Index for bodyA is invalid: ' + jointJson);
      return null;
    }
    if (jointJson.bodyB >= this.loadingBodies.length) {
      console.error('Index for bodyB is invalid: ' + jointJson);
      return null;
    }

    const bodyA = this.loadingBodies[jointJson.bodyA];
    const bodyB = this.loadingBodies[jointJson.bodyB];
    if (!bodyA || !bodyB) {
      console.error('bodyA or bodyB are invalid', bodyA, bodyB, this.loadingBodies);
      return null;
    }

    let joint: Box2D.b2Joint;
    switch (jointJson.type) {
    case 'revolute': {
      const jd = new b2.b2RevoluteJointDef();
      jd.Initialize(bodyA, bodyB, vec2Util.Add(vec2Util.Rotate(this.rubeToVec2(jointJson.anchorA), bodyA.GetAngle()), bodyA.GetPosition()));
      jd.set_collideConnected(Boolean(jointJson.collideConnected));
      jd.set_referenceAngle(jointJson.refAngle || 0);
      jd.set_enableLimit(Boolean(jointJson.enableLimit));
      jd.set_lowerAngle(jointJson.lowerLimit || 0);
      jd.set_upperAngle(jointJson.upperLimit || 0);
      jd.set_enableMotor(Boolean(jointJson.enableMotor));
      jd.set_maxMotorTorque(jointJson.maxMotorTorque || 0);
      jd.set_motorSpeed(jointJson.motorSpeed || 0);
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
      jd.set_collideConnected(Boolean(jointJson.collideConnected));
      jd.set_length(jointJson.length || 0);
      jd.set_minLength(0);
      jd.set_maxLength(jd.length * 2); // previous box2d port had issues without setting min and max length. Can maybe be removed with box2d-wasm
      this.setLinearStiffness(jd, jointJson.frequency || 0, jointJson.dampingRatio || 0, jd.bodyA, jd.bodyB);
      joint = this.world.CreateJoint(jd);
      b2.destroy(jd);
      break;
    }
    case 'prismatic': {
      const jd = new b2.b2PrismaticJointDef();
      jd.Initialize(bodyA, bodyB, vec2Util.Add(vec2Util.Rotate(this.rubeToVec2(jointJson.anchorA), bodyA.GetAngle()), bodyA.GetPosition()), this.rubeToVec2(jointJson.localAxisA));
      jd.set_collideConnected(Boolean(jointJson.collideConnected));
      jd.set_referenceAngle(jointJson.refAngle || 0);
      jd.set_enableLimit(Boolean(jointJson.enableLimit));
      jd.set_lowerTranslation(jointJson.lowerLimit || 0);
      jd.set_upperTranslation(jointJson.upperLimit || 0);
      jd.set_enableLimit(Boolean(jointJson.enableMotor));
      jd.set_maxMotorForce(jointJson.maxMotorForce || 0);
      jd.set_motorSpeed(jointJson.motorSpeed || 0);
      joint = this.world.CreateJoint(jd);
      b2.destroy(jd);
      break;
    }
    case 'wheel': {
      const jd = new b2.b2WheelJointDef();
      // TODO anchorA is 0 and B is XY in world space, which should be used?
      jd.Initialize(bodyA, bodyB, this.rubeToVec2(jointJson.anchorB), this.rubeToVec2(jointJson.localAxisA));
      jd.set_collideConnected(Boolean(jointJson.collideConnected));
      jd.set_enableMotor(Boolean(jointJson.enableMotor));
      jd.set_maxMotorTorque(jointJson.maxMotorTorque || 0);
      jd.set_motorSpeed(jointJson.motorSpeed || 0);
      this.setLinearStiffness(jd, jointJson.springFrequency || 0, jointJson.springDampingRatio || 0, jd.bodyA, jd.bodyB);
      joint = this.world.CreateJoint(jd);
      b2.destroy(jd);
      break;
    }
    case 'friction': {
      const jd = new b2.b2FrictionJointDef();
      jd.Initialize(bodyA, bodyB, vec2Util.Add(vec2Util.Rotate(this.rubeToVec2(jointJson.anchorA), bodyA.GetAngle()), bodyA.GetPosition()));
      jd.set_collideConnected(Boolean(jointJson.collideConnected));
      jd.set_maxForce(jointJson.maxForce || 0);
      jd.set_maxTorque(jointJson.maxTorque || 0);
      joint = this.world.CreateJoint(jd);
      b2.destroy(jd);
      break;
    }
    case 'weld': {
      const jd = new b2.b2WeldJointDef();
      jd.Initialize(bodyA, bodyB, vec2Util.Add(vec2Util.Rotate(this.rubeToVec2(jointJson.anchorA), bodyA.GetAngle()), bodyA.GetPosition()));
      jd.set_collideConnected(Boolean(jointJson.collideConnected));
      jd.set_referenceAngle(jointJson.refAngle || 0);
      this.setAngularStiffness(jd, jointJson.frequency || 0, jointJson.dampingRatio || 0, jd.bodyA, jd.bodyB);
      joint = this.world.CreateJoint(jd);
      b2.destroy(jd);
      break;
    }
    default:
      throw new Error('Unsupported joint type: ' + jointJson.type);
    }

    this.customProps.set(joint, this.customPropertiesArrayToMap(jointJson.customProperties || []));
    return joint;
  }

  private setLinearStiffness(jd: {stiffness: number, damping: number}, frequency: number, dampingRatio: number, bodyA: Box2D.b2Body, bodyB: Box2D.b2Body) {
    // See comment for b2LinearStiffness to see why this is done in such a way
    const output_p = b2._malloc(Float32Array.BYTES_PER_ELEMENT * 2);
    b2.b2LinearStiffness(output_p, output_p + Float32Array.BYTES_PER_ELEMENT, frequency || 0, dampingRatio || 0, bodyA, bodyB);
    const [stiffness, damping] = b2.HEAPF32.subarray(output_p >> 2);
    b2._free(output_p);
    jd.stiffness = stiffness;
    jd.damping = damping;
  }

  private setAngularStiffness(jd: {stiffness: number, damping: number}, frequency: number, dampingRatio: number, bodyA: Box2D.b2Body, bodyB: Box2D.b2Body) {
    // See comment for b2AngularStiffness to see why this is done in such a way
    const output_p = b2._malloc(Float32Array.BYTES_PER_ELEMENT * 2);
    b2.b2AngularStiffness(output_p, output_p + Float32Array.BYTES_PER_ELEMENT, frequency || 0, dampingRatio || 0, bodyA, bodyB);
    const [stiffness, damping] = b2.HEAPF32.subarray(output_p >> 2);
    b2._free(output_p);
    jd.stiffness = stiffness;
    jd.damping = damping;
  }

  private loadImage(imageJson: RubeImage): IMG | null {
    const {body, customProperties} = imageJson;
    const bodyObj = this.loadingBodies[body];
    const customProps = this.customPropertiesArrayToMap(customProperties || []);
    const img = this.handleLoadImage(imageJson, bodyObj, customProps);
    if (!img) return null;
    const props = this.customPropertiesArrayToMap(customProperties || []);
    this.customProps.set(img, props);
    if (bodyObj) {
      const userData = this.userData.get(bodyObj);
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

    const {_malloc, b2Vec2, b2PolygonShape, HEAPF32, wrapPointer} = b2;
    const shape = new b2PolygonShape();
    const ptr = _malloc(vertices.length * 8); // x and y are 4 bytes each so 8 bytes per b2Vec2
    let offset = 0;
    for (let i = 0; i < vertices.length; i++) {
      // HEAPF32 is a Float32Array view of the Emscripten HEAP
      // Some bitwise magic is used to get the correct offset for the XY values of each created b2Vec2
      HEAPF32[ptr + offset >> 2] = vertices[i].get_x();
      HEAPF32[ptr + (offset + 4) >> 2] = vertices[i].get_y();
      offset += 8;
    }
    const firstVertex = wrapPointer(ptr, b2Vec2);
    shape.Set(firstVertex, vertices.length);
    return shape;
  }

  // Taken from https://github.com/Birch-san/box2d-wasm/blob/c2d7e244787bfc619c1ea80d09e7ceb72294be85/integration-test/src/helpers.ts#L32
  // http://stackoverflow.com/questions/12792486/emscripten-bindings-how-to-create-an-accessible-c-c-array-from-javascript
  private createChainShape(chain: RubeFixture['chain']): Box2D.b2ChainShape {
    if (!chain) throw new Error('fixtureJson.chain is missing');
    const vertices = this.pointsFromSeparatedVertices(chain.vertices).reverse();
    const closedLoop = Boolean(chain.hasNextVertex && chain.hasPrevVertex && chain.nextVertex && chain.prevVertex);

    const {_malloc, b2Vec2, b2ChainShape, HEAPF32, wrapPointer} = b2;
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

  private pointsFromSeparatedVertices(vertices: {x: number[], y: number[]}) {
    const verts: Box2D.b2Vec2[] = [];
    // In RUBE Editor the Y coordinates are upside down when compared to Phaser3
    for (let v = 0; v < vertices.x.length; v++) verts.push(new b2.b2Vec2(vertices.x[v], vertices.y[v]));
    return verts;
  }

  private isXY(val: unknown): val is Box2D.b2Vec2 {
    return Boolean(val && typeof val === 'object' && val.hasOwnProperty('x') && val.hasOwnProperty('y'));
  }
}

/*
*  R.U.B.E. Scene Loader for https://github.com/Birch-san/box2d-wasm
* (see commit before SHA 5afd7c2 to find previous RubeLoader version for https://github.com/lusito/box2d.ts)
* Based on example loader by Chris Campbell (creator of RUBE editor): https://github.com/iforce2d/b2dJson/blob/master/js/loadrube.js
*/

import {b2, recordLeak} from '../..';
import {iterBodies, iterBodyFixtures, iterJoints} from '../../helpers/B2Iterators';
import {pseudoRandomId} from '../../helpers/pseudoRandomId';
import {RubeBody, RubeFixture, RubeScene, RubeJoint, RubeImage, RubeVector, RubeCustomProperty} from './RubeFileExport';
import {IBaseAdapter} from './RubeImageAdapter';
import {vec2Util} from './Vec2Math';
import {BodyEntityData, Entity, LoadedScene, EntityData, FixtureEntityData, ImageEntityData, JointEntityData} from './otherTypes';
import {sanitizeRubeDefaults} from './sanitizeRubeDefaults';

export class RubeLoader {
  readonly entityData: Map<Entity, EntityData> = new Map();
  readonly entityDataBySceneId: Map<LoadedScene['id'], Map<Entity, EntityData>> = new Map();
  readonly loadedScenes: Map<LoadedScene['id'], LoadedScene> = new Map();

  private loadingSceneId: LoadedScene['id'] = '';
  private loadingBodies: LoadedScene['bodies'] = [];
  private loadingJoints: LoadedScene['joints'] = [];
  private loadingImages: LoadedScene['images'] = [];

  constructor(private world: Box2D.b2World, private adapter: IBaseAdapter) { }

  load(scene: RubeScene, offsetX: number = 0, offsetY: number = 0): [boolean, LoadedScene['id']] {
    // Note that all the defaults should already have been set within sanitizeRubeDefaults()
    // But for now we keep setting defaults in this loader as well until continuing work on my own level editor
    console.time('RubeLoader.load');
    this.loadingSceneId = pseudoRandomId();
    scene = sanitizeRubeDefaults(scene);
    console.timeLog('RubeLoader.load', 'scene sanitized');
    this.loadingBodies = (scene.body || []).map(bodyJson => this.loadBody(bodyJson, offsetX, offsetY));
    console.timeLog('RubeLoader.load', 'bodies loaded');
    this.loadingJoints = (scene.joint || []).map(jointJson => this.loadJoint(jointJson));
    console.timeLog('RubeLoader.load', 'joints loaded');
    this.loadingImages = (scene.image || []).map(imageJson => this.loadImage(imageJson));
    console.timeLog('RubeLoader.load', 'images loaded');

    const success = this.loadingBodies.every(b => b) && this.loadingJoints.every(j => j) && this.loadingImages.every(i => i);
    if (success) console.debug('R.U.B.E. scene loaded successfully', this.loadingBodies, this.loadingJoints, this.loadingImages);
    else console.error('R.U.B.E. scene failed to load fully', this.loadingBodies, this.loadingJoints, this.loadingImages);
    const id = pseudoRandomId();
    const customProps = this.customPropsArrayToMap(scene.customProperties || []);
    this.loadedScenes.set(id, {bodies: this.loadingBodies, joints: this.loadingJoints, images: this.loadingImages, id, customProps});
    this.loadingBodies = [];
    this.loadingJoints = [];
    this.loadingImages = [];
    console.timeEnd('RubeLoader.load');
    return [success, id];
  }

  getBodiesByCustomProperty(propertyName: string, valueToMatch: unknown, sceneId?: LoadedScene['id']): Box2D.b2Body[] {
    const bodies: Box2D.b2Body[] = [];
    for (const body of iterBodies(this.world)) {
      if (sceneId && !this.loadedScenes.get(sceneId)!.bodies.find(e => e.body === body)) continue; // TODO turn into set
      const props = this.entityData.get(body)?.customProps;
      if (!props) continue;
      if (props[propertyName] !== valueToMatch) continue;
      bodies.push(body);
    }
    return bodies;
  }

  getFixturesByCustomProperty(propertyName: string, valueToMatch: unknown, sceneId?: LoadedScene['id']): Box2D.b2Fixture[] {
    const fixtures: Box2D.b2Fixture[] = [];
    for (const body of iterBodies(this.world)) {
      if (sceneId && !this.loadedScenes.get(sceneId)!.bodies.find(e => e.body === body)) continue; // TODO turn into set
      for (const fixture of iterBodyFixtures(body)) {
        const props = this.entityData.get(fixture)?.customProps;
        if (!props) continue;
        if (props[propertyName] !== valueToMatch) continue;
        fixtures.push(fixture);
      }
    }
    return fixtures;
  }

  getJointsByCustomProperty(propertyName: string, valueToMatch: unknown, sceneId?: LoadedScene['id']): Box2D.b2Joint[] {
    const joints: Box2D.b2Joint[] = [];
    for (const joint of iterJoints(this.world)) {
      if (sceneId && !this.loadedScenes.get(sceneId)!.joints.find(e => e.joint === joint)) continue; // TODO turn into set
      const props = this.entityData.get(joint)?.customProps;
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
    for (const body of iterBodies(this.world)) this.world.DestroyBody(body);
    for (const joint of iterJoints(this.world)) this.world.DestroyJoint(joint);
  }

  private loadBody(bodyJson: RubeBody, offsetX: number, offsetY: number): BodyEntityData {
    const bd = new b2.b2BodyDef();
    bd.type = Math.min(Math.max(bodyJson.type || 0, 0), 2); // clamp between 0-2.
    bd.angle = bodyJson.angle || 0;
    bd.angularVelocity = bodyJson.angularVelocity || 0;
    bd.awake = Boolean(bodyJson.awake);
    bd.enabled = bodyJson.hasOwnProperty('active') ? Boolean(bodyJson.active) : true;
    bd.fixedRotation = Boolean(bodyJson.fixedRotation);
    bd.linearVelocity = this.rubeToVec2(bodyJson.linearVelocity);
    bd.linearDamping = bodyJson.linearDamping || 0;
    bd.angularDamping = bodyJson.angularDamping || 0;
    bd.position = this.rubeToVec2(bodyJson.position, offsetX, offsetY);
    bd.bullet = Boolean(bodyJson.bullet || false);

    const massData = new b2.b2MassData();
    massData.mass = bodyJson['massData-mass'] || bodyJson.massDataMass || 1;
    massData.center = this.rubeToVec2(bodyJson['massData-center'] || bodyJson.massDataCenter);
    massData.I = bodyJson['massData-I'] || bodyJson.massDataI || 1;

    const body = this.world.CreateBody(bd);
    body.SetMassData(massData);
    b2.destroy(massData);
    b2.destroy(bd);

    const bodyEntity: BodyEntityData = {
      type: 'body',
      sceneId: this.loadingSceneId,
      id: pseudoRandomId(),
      name: bodyJson.name || 'body',
      customProps: this.customPropsArrayToMap(bodyJson.customProperties || []),
      body,
      image: null,
      fixtures: []
    };

    this.entityData.set(body, bodyEntity);

    for (const fixtureJson of bodyJson.fixture || []) this.loadFixture(bodyEntity, fixtureJson);
    return bodyEntity;
  }

  private loadFixture(bodyEntity: BodyEntityData, fixtureJson: RubeFixture): FixtureEntityData {
    const filter = new b2.b2Filter();
    filter.categoryBits = fixtureJson['filter-categoryBits'] || fixtureJson.filterCategoryBits || 1;
    filter.maskBits = fixtureJson['filter-maskBits'] || fixtureJson.filterMaskBits || 65535;
    filter.groupIndex = fixtureJson['filter-groupIndex'] || fixtureJson.filterGroupIndex || 0;

    const fd: Box2D.b2FixtureDef = this.getFixtureDefWithShape(fixtureJson);
    fd.friction = fixtureJson.friction || 0;
    fd.density = fixtureJson.density || 0;
    fd.restitution = fixtureJson.restitution || 0;
    fd.isSensor = Boolean(fixtureJson.sensor);
    fd.filter = filter;

    const fixture: Box2D.b2Fixture = bodyEntity.body.CreateFixture(fd);
    b2.destroy(fd);
    b2.destroy(filter);

    const fixtureEntity: FixtureEntityData = {
      type: 'fixture',
      sceneId: this.loadingSceneId,
      id: pseudoRandomId(),
      name: fixtureJson.name || 'fixture',
      customProps: this.customPropsArrayToMap(fixtureJson.customProperties || []),
      fixture
    };

    this.entityData.set(fixture, fixtureEntity);
    bodyEntity.fixtures.push(fixtureEntity);

    return fixtureEntity;
  }

  private loadJoint(jointJson: RubeJoint): JointEntityData {
    if (jointJson.bodyA >= this.loadingBodies.length) throw new Error(`Index for bodyA is invalid. JointName: ${jointJson.name}, bodyA: ${jointJson.bodyA}`);
    if (jointJson.bodyB >= this.loadingBodies.length) throw new Error(`Index for bodyB is invalid. JointName: ${jointJson.name}, bodyB: ${jointJson.bodyB}`);

    const bodyEntityA = this.loadingBodies[jointJson.bodyA];
    const bodyEntityB = this.loadingBodies[jointJson.bodyB];
    if (!bodyEntityA || !bodyEntityB) throw new Error(`bodyA or bodyB are invalid. JointName: ${jointJson.name}, bodyA: ${jointJson.bodyA}, bodyB: ${jointJson.bodyB}`);

    let joint: Box2D.b2Joint;
    switch (jointJson.type) {
    case 'revolute': {

      const anchor = vec2Util.Add(
        vec2Util.Rotate(this.rubeToVec2(jointJson.anchorA), bodyEntityA.body.GetAngle()),
        bodyEntityA.body.GetPosition()
      );

      const jd = new b2.b2RevoluteJointDef();
      jd.Initialize(bodyEntityA.body, bodyEntityB.body, anchor);
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
    case 'rope': {
      throw new Error('Rope joint not supported with box2d-wasm');
    }
    case 'distance': {
      const jd = new b2.b2DistanceJointDef();
      jd.length = (jointJson.length || 0);
      jd.Initialize(
        bodyEntityA.body,
        bodyEntityB.body,
        vec2Util.Add(vec2Util.Rotate(this.rubeToVec2(jointJson.anchorA), bodyEntityA.body.GetAngle()), bodyEntityA.body.GetPosition()),
        vec2Util.Add(vec2Util.Rotate(this.rubeToVec2(jointJson.anchorB), bodyEntityB.body.GetAngle()), bodyEntityB.body.GetPosition()),
      );
      jd.collideConnected = Boolean(jointJson.collideConnected);
      jd.length = jointJson.length || 0;
      jd.minLength = 0;
      jd.maxLength = jd.length * 2; // previous box2d port had issues without setting min and max length. Can maybe be removed with box2d-wasm
      this.setLinearStiffness(jd, jointJson.frequency || 0, jointJson.dampingRatio || 0, jd.bodyA, jd.bodyB);
      joint = this.world.CreateJoint(jd);
      b2.destroy(jd);
      break;
    }
    case 'prismatic': {
      const jd = new b2.b2PrismaticJointDef();
      jd.Initialize(
        bodyEntityA.body,
        bodyEntityB.body,
        vec2Util.Add(vec2Util.Rotate(this.rubeToVec2(jointJson.anchorA), bodyEntityA.body.GetAngle()), bodyEntityA.body.GetPosition()),
        this.rubeToVec2(jointJson.localAxisA)
      );
      jd.collideConnected = Boolean(jointJson.collideConnected);
      jd.referenceAngle = jointJson.refAngle || 0;
      jd.enableLimit = Boolean(jointJson.enableLimit);
      jd.lowerTranslation = jointJson.lowerLimit || 0;
      jd.upperTranslation = jointJson.upperLimit || 0;
      jd.enableLimit = Boolean(jointJson.enableMotor);
      jd.maxMotorForce = jointJson.maxMotorForce || 0;
      jd.motorSpeed = jointJson.motorSpeed || 0;
      joint = this.world.CreateJoint(jd);
      b2.destroy(jd);
      break;
    }
    case 'wheel': {
      const jd = new b2.b2WheelJointDef();
      // TODO anchorA is 0 and B is XY in world space, which should be used?
      jd.Initialize(bodyEntityA.body, bodyEntityB.body, this.rubeToVec2(jointJson.anchorB), this.rubeToVec2(jointJson.localAxisA));
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
      const anchor = vec2Util.Add(vec2Util.Rotate(this.rubeToVec2(jointJson.anchorA), bodyEntityA.body.GetAngle()), bodyEntityA.body.GetPosition());
      const jd = new b2.b2FrictionJointDef();
      jd.Initialize(bodyEntityA.body, bodyEntityB.body, anchor);
      jd.collideConnected = Boolean(jointJson.collideConnected);
      jd.maxForce = jointJson.maxForce || 0;
      jd.maxTorque = jointJson.maxTorque || 0;
      joint = this.world.CreateJoint(jd);
      b2.destroy(jd);
      break;
    }
    case 'weld': {
      const anchor = vec2Util.Add(vec2Util.Rotate(this.rubeToVec2(jointJson.anchorA), bodyEntityA.body.GetAngle()), bodyEntityA.body.GetPosition());
      const jd = new b2.b2WeldJointDef();
      jd.Initialize(bodyEntityA.body, bodyEntityB.body, anchor);
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

    const jointEntity: JointEntityData = {
      type: 'joint',
      sceneId: this.loadingSceneId,
      id: pseudoRandomId(),
      name: jointJson.name || 'joint',
      customProps: this.customPropsArrayToMap(jointJson.customProperties || []),
      joint
    };

    this.entityData.set(joint, jointEntity);
    return jointEntity;
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

  private loadImage(imageJson: RubeImage): ImageEntityData {
    const {body, customProperties} = imageJson;
    const bodyEntityData = this.loadingBodies[body];
    // const bodyEntityData = this.entityData.get(bodyObj) as BodyEntityData;
    const customProps = this.customPropsArrayToMap(customProperties || []);
    const img = this.adapter.loadImage(imageJson, bodyEntityData, customProps);
    if (!img) throw new Error(`Image could not be loaded. ImageName: ${imageJson.name}, ImageFile: ${imageJson.file}, ImageBody: ${imageJson.body}`);
    const props = this.customPropsArrayToMap(customProperties || []);

    const imageEntity: ImageEntityData = {
      type: 'image',
      sceneId: this.loadingSceneId,
      id: pseudoRandomId(),
      name: imageJson.name || 'image',
      customProps: props,
      image: img
    };

    this.entityData.set(img, imageEntity);
    if (bodyEntityData) bodyEntityData.image = imageEntity;

    return imageEntity;
  }

  private customPropsArrayToMap(customProperties: RubeCustomProperty[]): Record<string, unknown> {
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
    shape.m_radius = circle.radius;
    shape.m_p = this.rubeToVec2(circle.center);
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

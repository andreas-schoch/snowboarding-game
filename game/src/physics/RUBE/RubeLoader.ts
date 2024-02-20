/*
*  R.U.B.E. Scene Loader for https://github.com/Birch-san/box2d-wasm
* (see commit before SHA 5afd7c2 to find previous RubeLoader version for https://github.com/lusito/box2d.ts)
* Based on example loader by Chris Campbell (creator of RUBE editor): https://github.com/iforce2d/b2dJson/blob/master/js/loadrube.js
*/

import {b2} from '../..';
import {iterBodies, iterBodyFixtures, iterJoints} from '../../helpers/B2Iterators';
import {pseudoRandomId} from '../../helpers/pseudoRandomId';
import {customPropsArrayToMap, rubeToVec2} from '../../helpers/rubeTransformers';
import {RubeBody, RubeFixture, RubeScene, RubeJoint, RubeImage} from './RubeFileExport';
import {IBaseAdapter} from './RubeImageAdapter';
import {vec2Util} from './Vec2Math';
import {BodyEntityData, Entity, LoadedScene, EntityData, FixtureEntityData, ImageEntityData, JointEntityData, WorldEntityData} from './otherTypes';
import {sanitizeRubeDefaults} from './sanitizeRubeDefaults';

export class RubeLoader {
  readonly loadedScenes: Map<LoadedScene['id'], LoadedScene> = new Map();

  private loadingSceneEntityData: Map<Entity, EntityData> = new Map();
  private loadingSceneId: LoadedScene['id'] = '';
  private loadingBodies: LoadedScene['bodies'] = [];
  private loadingJoints: LoadedScene['joints'] = [];
  private loadingImages: LoadedScene['images'] = [];

  constructor(private worldEntity: WorldEntityData, private adapter: IBaseAdapter) { }

  load(scene: RubeScene, offsetX: number = 0, offsetY: number = 0, idOverride?: string): LoadedScene {
    // Note that all the defaults should already have been set within sanitizeRubeDefaults()
    // But for now we keep setting defaults in this loader as well until continuing work on my own level editor
    console.time('RubeLoader.load');
    this.loadingSceneId = idOverride || pseudoRandomId();
    this.loadingSceneEntityData = new Map();
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

    const loadedScene: LoadedScene = {
      id: this.loadingSceneId,
      bodies: this.loadingBodies,
      joints: this.loadingJoints,
      images: this.loadingImages,
      entityData: this.loadingSceneEntityData,
      customProps: customPropsArrayToMap(scene.customProperties || []),
      worldEntity: this.worldEntity,
    };

    this.loadedScenes.set(loadedScene.id, loadedScene);

    this.loadingBodies = [];
    this.loadingJoints = [];
    this.loadingImages = [];

    console.timeEnd('RubeLoader.load');
    return loadedScene;
  }

  getBodiesByCustomProperty(propertyName: string, valueToMatch: unknown, sceneId?: LoadedScene['id']): Box2D.b2Body[] {
    const bodies: Box2D.b2Body[] = [];
    for (const body of iterBodies(this.worldEntity.world)) {
      if (sceneId && !this.loadedScenes.get(sceneId)!.bodies.find(e => e.body === body)) continue; // TODO turn into set
      const props = this.worldEntity.entityData.get(body)?.customProps;
      if (!props) continue;
      if (props[propertyName] !== valueToMatch) continue;
      bodies.push(body);
    }
    return bodies;
  }

  getFixturesByCustomProperty(propertyName: string, valueToMatch: unknown, sceneId?: LoadedScene['id']): Box2D.b2Fixture[] {
    const fixtures: Box2D.b2Fixture[] = [];
    for (const body of iterBodies(this.worldEntity.world)) {
      if (sceneId && !this.loadedScenes.get(sceneId)!.bodies.find(e => e.body === body)) continue; // TODO turn into set
      for (const fixture of iterBodyFixtures(body)) {
        const props = this.worldEntity.entityData.get(fixture)?.customProps;
        if (!props) continue;
        if (props[propertyName] !== valueToMatch) continue;
        fixtures.push(fixture);
      }
    }
    return fixtures;
  }

  getJointsByCustomProperty(propertyName: string, valueToMatch: unknown, sceneId?: LoadedScene['id']): Box2D.b2Joint[] {
    const joints: Box2D.b2Joint[] = [];
    for (const joint of iterJoints(this.worldEntity.world)) {
      if (sceneId && !this.loadedScenes.get(sceneId)!.joints.find(e => e.joint === joint)) continue; // TODO turn into set
      const props = this.worldEntity.entityData.get(joint)?.customProps;
      if (!props) continue;
      if (props[propertyName] !== valueToMatch) continue;
      joints.push(joint);
    }
    return joints;
  }

  cleanup() {
    // Seems to be recommended https://github.com/Birch-san/box2d-wasm/blob/master/docs/memory-model.md
    for (const body of iterBodies(this.worldEntity.world)) this.worldEntity.world.DestroyBody(body);
    for (const joint of iterJoints(this.worldEntity.world)) this.worldEntity.world.DestroyJoint(joint);
  }

  private loadBody(bodyJson: RubeBody, offsetX: number, offsetY: number): BodyEntityData {
    const bd = new b2.b2BodyDef();
    bd.type = Math.min(Math.max(bodyJson.type || 0, 0), 2); // clamp between 0-2.
    bd.angle = bodyJson.angle || 0;
    bd.angularVelocity = bodyJson.angularVelocity || 0;
    bd.awake = Boolean(bodyJson.awake);
    bd.enabled = bodyJson.hasOwnProperty('active') ? Boolean(bodyJson.active) : true;
    bd.fixedRotation = Boolean(bodyJson.fixedRotation);
    bd.linearVelocity = rubeToVec2(bodyJson.linearVelocity);
    bd.linearDamping = bodyJson.linearDamping || 0;
    bd.angularDamping = bodyJson.angularDamping || 0;
    bd.position = rubeToVec2(bodyJson.position, offsetX, offsetY);
    bd.bullet = Boolean(bodyJson.bullet || false);

    const massData = new b2.b2MassData();
    massData.mass = bodyJson['massData-mass'] || bodyJson.massDataMass || 1;
    massData.center = rubeToVec2(bodyJson['massData-center'] || bodyJson.massDataCenter);
    massData.I = bodyJson['massData-I'] || bodyJson.massDataI || 1;

    const body = this.worldEntity.world.CreateBody(bd);
    body.SetMassData(massData);
    b2.destroy(massData);
    b2.destroy(bd);

    const bodyEntity: BodyEntityData = {
      type: 'body',
      sceneId: this.loadingSceneId,
      id: pseudoRandomId(),
      name: bodyJson.name || 'body',
      customProps: customPropsArrayToMap(bodyJson.customProperties || []),
      body,
      image: null,
      fixtures: []
    };

    this.worldEntity.entityData.set(body, bodyEntity);
    this.loadingSceneEntityData.set(body, bodyEntity);

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
      customProps: customPropsArrayToMap(fixtureJson.customProperties || []),
      fixture
    };

    this.worldEntity.entityData.set(fixture, fixtureEntity);
    this.loadingSceneEntityData.set(fixture, fixtureEntity);
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
        vec2Util.Rotate(rubeToVec2(jointJson.anchorA), bodyEntityA.body.GetAngle()),
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
      joint = this.worldEntity.world.CreateJoint(jd);
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
        vec2Util.Add(vec2Util.Rotate(rubeToVec2(jointJson.anchorA), bodyEntityA.body.GetAngle()), bodyEntityA.body.GetPosition()),
        vec2Util.Add(vec2Util.Rotate(rubeToVec2(jointJson.anchorB), bodyEntityB.body.GetAngle()), bodyEntityB.body.GetPosition()),
      );
      jd.collideConnected = Boolean(jointJson.collideConnected);
      jd.length = jointJson.length || 0;
      jd.minLength = 0;
      jd.maxLength = jd.length * 2; // previous box2d port had issues without setting min and max length. Can maybe be removed with box2d-wasm
      this.setLinearStiffness(jd, jointJson.frequency || 0, jointJson.dampingRatio || 0, jd.bodyA, jd.bodyB);
      joint = this.worldEntity.world.CreateJoint(jd);
      b2.destroy(jd);
      break;
    }
    case 'prismatic': {
      const jd = new b2.b2PrismaticJointDef();
      jd.Initialize(
        bodyEntityA.body,
        bodyEntityB.body,
        vec2Util.Add(vec2Util.Rotate(rubeToVec2(jointJson.anchorA), bodyEntityA.body.GetAngle()), bodyEntityA.body.GetPosition()),
        rubeToVec2(jointJson.localAxisA)
      );
      jd.collideConnected = Boolean(jointJson.collideConnected);
      jd.referenceAngle = jointJson.refAngle || 0;
      jd.enableLimit = Boolean(jointJson.enableLimit);
      jd.lowerTranslation = jointJson.lowerLimit || 0;
      jd.upperTranslation = jointJson.upperLimit || 0;
      jd.enableLimit = Boolean(jointJson.enableMotor);
      jd.maxMotorForce = jointJson.maxMotorForce || 0;
      jd.motorSpeed = jointJson.motorSpeed || 0;
      joint = this.worldEntity.world.CreateJoint(jd);
      b2.destroy(jd);
      break;
    }
    case 'wheel': {
      const jd = new b2.b2WheelJointDef();
      // TODO anchorA is 0 and B is XY in world space, which should be used?
      jd.Initialize(bodyEntityA.body, bodyEntityB.body, rubeToVec2(jointJson.anchorB), rubeToVec2(jointJson.localAxisA));
      jd.collideConnected = Boolean(jointJson.collideConnected);
      jd.enableMotor = Boolean(jointJson.enableMotor);
      jd.maxMotorTorque = jointJson.maxMotorTorque || 0;
      jd.motorSpeed = jointJson.motorSpeed || 0;
      this.setLinearStiffness(jd, jointJson.springFrequency || 0, jointJson.springDampingRatio || 0, jd.bodyA, jd.bodyB);
      joint = this.worldEntity.world.CreateJoint(jd);
      b2.destroy(jd);
      break;
    }
    case 'friction': {
      const anchor = vec2Util.Add(vec2Util.Rotate(rubeToVec2(jointJson.anchorA), bodyEntityA.body.GetAngle()), bodyEntityA.body.GetPosition());
      const jd = new b2.b2FrictionJointDef();
      jd.Initialize(bodyEntityA.body, bodyEntityB.body, anchor);
      jd.collideConnected = Boolean(jointJson.collideConnected);
      jd.maxForce = jointJson.maxForce || 0;
      jd.maxTorque = jointJson.maxTorque || 0;
      joint = this.worldEntity.world.CreateJoint(jd);
      b2.destroy(jd);
      break;
    }
    case 'weld': {
      const anchor = vec2Util.Add(vec2Util.Rotate(rubeToVec2(jointJson.anchorA), bodyEntityA.body.GetAngle()), bodyEntityA.body.GetPosition());
      const jd = new b2.b2WeldJointDef();
      jd.Initialize(bodyEntityA.body, bodyEntityB.body, anchor);
      jd.collideConnected = Boolean(jointJson.collideConnected);
      jd.referenceAngle = jointJson.refAngle || 0;
      this.setAngularStiffness(jd, jointJson.frequency || 0, jointJson.dampingRatio || 0, jd.bodyA, jd.bodyB);
      joint = this.worldEntity.world.CreateJoint(jd);
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
      customProps: customPropsArrayToMap(jointJson.customProperties || []),
      joint
    };

    this.worldEntity.entityData.set(joint, jointEntity);
    this.loadingSceneEntityData.set(joint, jointEntity);
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
    const customProps = customPropsArrayToMap(customProperties || []);
    const img = this.adapter.loadImage(imageJson, bodyEntityData, customProps);
    if (!img) throw new Error(`Image could not be loaded. ImageName: ${imageJson.name}, ImageFile: ${imageJson.file}, ImageBody: ${imageJson.body}`);

    const imageEntity: ImageEntityData = {
      type: 'image',
      sceneId: this.loadingSceneId,
      id: pseudoRandomId(),
      name: imageJson.name || 'image',
      customProps: customProps,
      image: img
    };

    this.worldEntity.entityData.set(img, imageEntity);
    this.loadingSceneEntityData.set(img, imageEntity);
    if (bodyEntityData) bodyEntityData.image = imageEntity;

    return imageEntity;
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
    shape.m_p = rubeToVec2(circle.center);
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
    else shape.CreateChain(ptr_wrapped, vertices.length, rubeToVec2(chain.prevVertex), rubeToVec2(chain.nextVertex));
    return shape;
  }

  private pointsFromSeparatedVertices(vertices: {x: number[], y: number[]}) {
    const verts: Box2D.b2Vec2[] = [];
    // In RUBE Editor the Y coordinates are upside down when compared to Phaser3
    for (let v = 0; v < vertices.x.length; v++) verts.push(new b2.b2Vec2(vertices.x[v], vertices.y[v]));
    return verts;
  }
}

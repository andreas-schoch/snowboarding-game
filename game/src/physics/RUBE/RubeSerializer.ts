import {b2} from '../..';
import {iterBodies, iterBodyFixtures, iterJoints} from '../../helpers/B2Iterators';
import {Entity, WorldEntityData} from './EntityTypes';
import {RubeExport, RubeBody, RubeJoint, RubeFixture, RubeJointBase, RubeFixtureShapeChain, RubeFixtureShapeCircle, RubeFixtureShapePolygon, RubeImage, RubeJointType} from './RubeExport';
import {RubeVectorArray, RubeCustomProperty, CustomPropertyDefNames, CustomPropertyValue,RubeVector} from './RubeFile';
import {IBaseAdapter} from './RubeImageAdapter';
import {RubeLoader} from './RubeLoader';
import {vec2Util} from './Vec2Math';

export const enumTypeToRubeJointType = {
  // [RubeJointType.e_unknownJoint]: 'unknown' as const,
  [RubeJointType.e_revoluteJoint]: 'revolute' as const,
  [RubeJointType.e_prismaticJoint]: 'prismatic' as const,
  [RubeJointType.e_distanceJoint]: 'distance' as const,
  // [RubeJointType.e_pulleyJoint]: 'pulley' as const,
  // [RubeJointType.e_mouseJoint]: 'mouse' as const,
  // [RubeJointType.e_gearJoint]: 'gear' as const,
  [RubeJointType.e_wheelJoint]: 'wheel' as const,
  [RubeJointType.e_weldJoint]: 'weld' as const,
  [RubeJointType.e_frictionJoint]: 'friction' as const,
  [RubeJointType.e_ropeJoint]: 'rope' as const,
  [RubeJointType.e_motorJoint]: 'motor' as const
};

export class RubeSerializer {
  // getImages: () => IMG[] = () => { throw new Error('Image getter not implemented'); };
  // handleSerializeImage: (image: IMG) => RubeImage = () => { throw new Error('Image serialization not implemented'); };

  private indexByBody: Map<Box2D.b2Body, number> = new Map();

  constructor(private worldEntity: WorldEntityData, private adapter: IBaseAdapter, private loader: RubeLoader) { }

  serialize(): RubeExport {
    console.time('RubeSerializer.serialize');
    const scene: RubeExport = {
      gravity: this.serializeVector(this.worldEntity.world.GetGravity()),
      allowSleep: this.worldEntity.world.GetAllowSleeping(),
      autoClearForces: this.worldEntity.world.GetAutoClearForces(),
      positionIterations: this.worldEntity.positionIterations,
      velocityIterations: this.worldEntity.velocityIterations,
      stepsPerSecond: this.worldEntity.stepsPerSecond,
      warmStarting: this.worldEntity.world.GetWarmStarting(),
      continuousPhysics: this.worldEntity.world.GetContinuousPhysics(),
      subStepping: this.worldEntity.world.GetSubStepping(),
      customProperties: [], // We don't use/care about world custom properties for now

      body: this.serializeBodies(), // needs to be serialized before joints because joints rely on the order of bodies in the array
      joint: this.serializeJoints(),
      image: this.serializeImages(),
    };

    const jsonStr = JSON.stringify(scene);
    const blob = new Blob([jsonStr], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rube scene test.json';
    a.click();
    URL.revokeObjectURL(url);
    a.remove();

    console.timeEnd('RubeSerializer.serialize');
    console.debug('serialized scene', scene);
    return scene;
  }

  private serializeBodies(): RubeBody[] {
    const bodies: RubeBody[] = [];
    for (const body of iterBodies(this.worldEntity.world)) {
      this.indexByBody.set(body, bodies.length);
      bodies.push(this.serializeBody(body));
    }
    return bodies;
  }

  private serializeBody(body: Box2D.b2Body): RubeBody {
    const bodyEntityData = this.worldEntity.entityData.get(body);
    return {
      name: bodyEntityData?.name || 'body',
      active: body.IsEnabled(),
      awake: body.IsAwake(),
      bullet: body.IsBullet(),
      fixedRotation: body.IsFixedRotation(),
      type: body.GetType() as 0 | 1 | 2,
      position: this.serializeVector(body.GetPosition()),
      angle: body.GetAngle(),
      angularDamping: body.GetAngularDamping(),
      angularVelocity: body.GetAngularVelocity(),
      linearDamping: body.GetLinearDamping(),
      linearVelocity: this.serializeVector(body.GetLinearVelocity()),
      'massData-mass': body.GetMass(),
      'massData-center': this.serializeVector(body.GetLocalCenter()),
      'massData-I': body.GetInertia(),
      customProperties: this.serializeCustomProperties(body),
      fixture: this.serializeFixtures(body),
    };
  }

  serializeCustomProperties(owner: Entity): RubeCustomProperty[] | undefined {
    const props = this.worldEntity.entityData.get(owner)?.customProps;
    if (!props) return undefined;
    const serialized: RubeCustomProperty[] = [];
    for (const [key, value] of Object.entries<CustomPropertyValue>(props)) {
      const name = key as CustomPropertyDefNames;
      if (typeof value === 'number' && Number.isInteger(value)) serialized.push({name, int: value});
      else if (typeof value === 'number') serialized.push({name, float: value});
      else if (typeof value === 'string') serialized.push({name, string: value});
      else if (typeof value === 'boolean') serialized.push({name, bool: value});
      else if (value instanceof b2.b2Vec2) serialized.push({name, vec2: this.serializeVector(value)});
      else throw new Error('Custom property type not supported');
    }
    return serialized;
  }

  private serializeFixtures(body: Box2D.b2Body): RubeFixture[] {
    const fixtures: RubeFixture[] = [];
    for (const fixture of iterBodyFixtures(body)) fixtures.push(this.serializeFixture(fixture));
    return fixtures;
  }

  private serializeFixture(fixture: Box2D.b2Fixture): RubeFixture {
    const {categoryBits, maskBits, groupIndex} = fixture.GetFilterData();

    const shape = fixture.GetShape();
    const shapeType = shape.GetType();

    const fixtureEntityData = this.worldEntity.entityData.get(fixture);

    const serialized: RubeFixture = {
      name: fixtureEntityData?.name|| 'fixture',
      density: fixture.GetDensity(),
      'filter-categoryBits': categoryBits,
      'filter-maskBits': maskBits,
      'filter-groupIndex': groupIndex,
      friction: fixture.GetFriction(),
      restitution: fixture.GetRestitution(),
      sensor: fixture.IsSensor(),
      customProperties: this.serializeCustomProperties(fixture),
    };

    if (shapeType === b2.b2Shape.e_circle) serialized.circle = this.serializeCircleShape(shape);
    if (shapeType === b2.b2Shape.e_polygon) serialized.polygon = this.serializePolygonShape(shape);
    if (shapeType === b2.b2Shape.e_chain) serialized.chain = this.serializeChainShape(shape);

    return serialized;
  }

  private serializeCircleShape(shape: Box2D.b2Shape): RubeFixtureShapeCircle {
    const circleShape = b2.castObject(shape, b2.b2CircleShape);
    return {
      center: this.serializeVector(circleShape.get_m_p()),
      radius: shape.get_m_radius(),
    };
  }

  private serializePolygonShape(shape: Box2D.b2Shape): RubeFixtureShapePolygon {
    const polygonShape = b2.castObject(shape, b2.b2PolygonShape);
    const b2Verts = b2.reifyArray(b2.getPointer(polygonShape.m_vertices), polygonShape.m_count, 8, b2.b2Vec2);
    const vertices: RubeVectorArray = {x: [], y: []};
    for (const {x, y} of b2Verts) {
      vertices.x.push(x);
      vertices.y.push(y);
    }
    return {vertices};
  }

  private serializeChainShape(shape: Box2D.b2Shape): RubeFixtureShapeChain {
    const chainShape = b2.castObject(shape, b2.b2ChainShape);
    const b2Verts = b2.reifyArray(b2.getPointer(chainShape.m_vertices), chainShape.m_count, 8, b2.b2Vec2);
    const vertices: RubeVectorArray = {x: [], y: []};
    for (const {x, y} of b2Verts.reverse()) {
      vertices.x.push(x);
      vertices.y.push(y);
    }
    return {
      vertices,
      hasNextVertex: Boolean(chainShape.m_nextVertex),
      hasPrevVertex: Boolean(chainShape.m_prevVertex),
      nextVertex: this.serializeVector(chainShape.m_nextVertex),
      prevVertex: this.serializeVector(chainShape.m_prevVertex)
    };
  }

  private serializeJoints(): RubeJoint[] {
    if (this.worldEntity.world.GetJointCount() !== 0 && this.indexByBody.size === 0) throw new Error('Joints cannot be serialized before bodies');
    const joints: RubeJoint[] = [];
    for (const joint of iterJoints(this.worldEntity.world)) joints.push(this.serializeJoint(joint));
    return joints;
  }

  private serializeJoint(joint: Box2D.b2Joint): RubeJoint {
    const intType = joint.GetType();
    const stringType: RubeJoint['type'] | undefined = enumTypeToRubeJointType[intType];

    if (stringType === undefined) throw new Error(`Unknown joint type: ${intType}`);

    switch (stringType) {
    case 'revolute':
      return this.serializeRevoluteJoint(joint);
    case 'prismatic':
      return this.serializePrismaticJoint(joint);
    case 'distance':
      return this.serializeDistanceJoint(joint);
    case 'wheel':
      return this.serializeWheelJoint(joint);
    case 'weld':
      return this.serializeWeldJoint(joint);
    case 'friction':
      return this.serializeFrictionJoint(joint);
    case 'motor':
      return this.serializeMotorJoint(joint);
    case 'rope':
      throw new Error('Rope joint serialization not supported by box2d-wasm');
    default:
      throw new Error(`Unknown joint type: ${stringType}`);
    }
  }

  private serializeJointBase(joint: Box2D.b2Joint): RubeJointBase {
    const bodyA = joint.GetBodyA();
    const bodyB = joint.GetBodyB();
    const indexA = this.indexByBody.get(bodyA);
    const indexB = this.indexByBody.get(bodyB);

    const anchorAWorld = joint.GetAnchorA();
    const anchorBWorld = joint.GetAnchorB();
    const anchorALocal = vec2Util.Rotate(new b2.b2Vec2(anchorAWorld.x - bodyA.GetPosition().x, anchorAWorld.y - bodyA.GetPosition().y), -bodyA.GetAngle());
    const anchorBLocal = vec2Util.Rotate(new b2.b2Vec2(anchorBWorld.x - bodyB.GetPosition().x, anchorBWorld.y - bodyB.GetPosition().y), -bodyB.GetAngle());

    if (indexA === undefined || indexB === undefined) throw new Error('Joint body index not found');

    const jointEntityData = this.worldEntity.entityData.get(joint);
    return {
      type: enumTypeToRubeJointType[joint.GetType()],
      name: jointEntityData?.name || 'joint',
      anchorA: this.serializeVector(anchorALocal),
      anchorB: this.serializeVector(anchorBLocal),
      bodyA: indexA,
      bodyB: indexB,
      collideConnected: joint.GetCollideConnected(),
      customProperties: this.serializeCustomProperties(joint),
    };
  }

  private serializeRevoluteJoint(joint: Box2D.b2Joint): RubeJoint {
    const revoluteJoint = b2.castObject(joint, b2.b2RevoluteJoint);
    return {
      ...this.serializeJointBase(joint),
      type: 'revolute',
      enableLimit: revoluteJoint.IsLimitEnabled(),
      lowerLimit: revoluteJoint.GetLowerLimit(),
      upperLimit: revoluteJoint.GetUpperLimit(),
      enableMotor: revoluteJoint.IsMotorEnabled(),
      motorSpeed: revoluteJoint.GetMotorSpeed(),
      maxMotorTorque: revoluteJoint.GetMaxMotorTorque(),
      refAngle: revoluteJoint.GetReferenceAngle(),
    };
  }

  private serializePrismaticJoint(joint: Box2D.b2Joint): RubeJoint {
    const prismaticJoint = b2.castObject(joint, b2.b2PrismaticJoint);
    return {
      ...this.serializeJointBase(joint),
      type: 'prismatic',
      enableLimit: prismaticJoint.IsLimitEnabled(),
      enableMotor: prismaticJoint.IsMotorEnabled(),
      localAxisA: this.serializeVector(prismaticJoint.GetLocalAxisA()),
      lowerLimit: prismaticJoint.GetLowerLimit(),
      maxMotorForce: prismaticJoint.GetMaxMotorForce(),
      motorSpeed: prismaticJoint.GetMotorSpeed(),
      upperLimit: prismaticJoint.GetUpperLimit(),
      refAngle: prismaticJoint.GetReferenceAngle(),
    };
  }

  private serializeDistanceJoint(joint: Box2D.b2Joint): RubeJoint {
    const distanceJoint = b2.castObject(joint, b2.b2DistanceJoint);
    const {frequencyHertz, dampingRatio} = this.getJointLinearFrequencyAndDampingRatio(distanceJoint);
    return {
      ...this.serializeJointBase(joint),
      type: 'distance',
      dampingRatio: dampingRatio,
      frequency: frequencyHertz,
      length: distanceJoint.GetLength(),
    };
  }

  private serializeWheelJoint(joint: Box2D.b2Joint): RubeJoint {
    const wheelJoint = b2.castObject(joint, b2.b2WheelJoint);
    const {frequencyHertz, dampingRatio} = this.getJointLinearFrequencyAndDampingRatio(wheelJoint);
    return {
      ...this.serializeJointBase(joint),
      type: 'wheel',
      springDampingRatio: dampingRatio,
      springFrequency: frequencyHertz,
      localAxisA: this.serializeVector(wheelJoint.GetLocalAxisA()),
      enableMotor: wheelJoint.IsMotorEnabled(),
      maxMotorTorque: wheelJoint.GetMaxMotorTorque(),
      motorSpeed: wheelJoint.GetMotorSpeed(),
    };
  }

  private serializeWeldJoint(joint: Box2D.b2Joint): RubeJoint {
    const weldJoint = b2.castObject(joint, b2.b2WeldJoint);
    const {frequencyHertz, dampingRatio} = this.getJointAngularFrequencyAndDampingRatio(weldJoint);
    return {
      ...this.serializeJointBase(joint),
      type: 'weld',
      refAngle: weldJoint.GetReferenceAngle(),
      dampingRatio: dampingRatio,
      frequency: frequencyHertz,
    };
  }

  private serializeFrictionJoint(joint: Box2D.b2Joint): RubeJoint {
    const frictionJoint = b2.castObject(joint, b2.b2FrictionJoint);
    return {
      ...this.serializeJointBase(joint),
      type: 'friction',
      maxForce: frictionJoint.GetMaxForce(),
      maxTorque: frictionJoint.GetMaxTorque(),
    };
  }

  private serializeMotorJoint(joint: Box2D.b2Joint): RubeJoint {
    const motorJoint = b2.castObject(joint, b2.b2MotorJoint);
    return {
      ...this.serializeJointBase(joint),
      type: 'motor',
      maxForce: motorJoint.GetMaxForce(),
      maxTorque: motorJoint.GetMaxTorque(),
      correctionFactor: motorJoint.GetCorrectionFactor(),
    };
  }

  private serializeImages(): RubeImage[] {
    const images: RubeImage[] = [];
    for (const image of this.adapter.images) {
      if (!image) throw new Error('Image not loaded');
      const serialized = this.adapter.serializeImage(image);
      images.push(serialized);
    }

    return images;
  }

  private serializeVector(vec: Box2D.b2Vec2): RubeVector {
    if (vec.x === 0 && vec.y === 0) return 0;
    return {x: vec.x, y: vec.y};
  }

  private getJointLinearFrequencyAndDampingRatio(joint: Box2D.b2DistanceJoint | Box2D.b2WheelJoint) {
    // Reverse b2LinearStiffness() formula. from https://github.com/erincatto/box2d/blob/main/src/dynamics/b2_joint.cpp#L40
    const stiffness = joint.GetStiffness();
    const damping = joint.GetDamping();
    const massA = joint.GetBodyA().GetMass();
    const massB = joint.GetBodyB().GetMass();

    let effectiveMass: number;
    if (massA > 0 && massB > 0) effectiveMass = massA * massB / (massA + massB);
    else if (massA > 0) effectiveMass = massA;
    else effectiveMass = massB;

    const omega = Math.sqrt(stiffness / effectiveMass); // natural frequency
    const frequencyHertz = omega / (2 * Math.PI);
    const dampingRatio = damping / (2 * effectiveMass * omega);

    return {frequencyHertz, dampingRatio};
  }

  private getJointAngularFrequencyAndDampingRatio(joint: Box2D.b2WeldJoint): {frequencyHertz: number, dampingRatio: number} {
    const stiffness = joint.GetStiffness();
    const damping = joint.GetDamping();
    const inertiaA = joint.GetBodyA().GetInertia();
    const inertiaB = joint.GetBodyB().GetInertia();

    let inertia: number;
    if (inertiaA > 0 && inertiaB > 0) inertia = inertiaA * inertiaB / (inertiaA + inertiaB);
    else inertia = inertiaA > 0 ? inertiaA : inertiaB;

    const omega = Math.sqrt(stiffness / inertia);
    const frequencyHertz = omega / (2 * Math.PI);
    const dampingRatio = damping / (2 * inertia * omega);

    return {frequencyHertz, dampingRatio};
  }

}

import { channel } from 'diagnostics_channel';
import { b2 } from '../..';
import { CustomPropOwner, RubeLoader } from './RubeLoader';
import { RubeScene, RubeBody, RubeJoint, RubeVector, RubeFixture, enumTypeToRubeJointType, RubeJointBase, RubeFixtureShapeChain, RubeVectorArray, RubeFixtureShapeCircle, RubeFixtureShapePolygon, RubeImage, RubeCustomProperty } from './RubeLoaderInterfaces';
import { vec2Util } from './Vec2Math';

export class RubeSerializer<IMG = unknown> {
  handleSerializeImage: (image: IMG) => RubeImage = () => { throw new Error('Image serialization not implemented') };

  private world: Box2D.b2World;
  private loader: RubeLoader<IMG>;
  private indexByBody: Map<Box2D.b2Body, number> = new Map();

  constructor(world: Box2D.b2World, loader: RubeLoader<IMG>) {
    this.world = world;
    this.loader = loader;
  }

  serialize(): RubeScene {
    const scene: RubeScene = {
      gravity: this.serializeVector(this.world.GetGravity()),
      allowSleep: this.world.GetAllowSleeping(),
      autoClearForces: this.world.GetAutoClearForces(),
      positionIterations: 10, // TODO 
      velocityIterations: 10,
      stepsPerSecond: 60,
      warmStarting: this.world.GetWarmStarting(),
      continuousPhysics: this.world.GetContinuousPhysics(),
      subStepping: this.world.GetSubStepping(),
      customProperties: [], // TODO

      body: this.serializeBodies(), // needs to be serialized before joints because joints rely on the order of bodies in the array
      joint: this.serializeJoints(),
      image: this.serializeImages(),
    };

    const jsonStr = JSON.stringify(scene);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = 'rube scene test.json';
    a.click();
    URL.revokeObjectURL(url);

    return scene;
  }

  private serializeBodies(): RubeBody[] {
    const bodies: RubeBody[] = [];
    for (let body = this.world.GetBodyList(); b2.getPointer(body) !== b2.getPointer(b2.NULL); body = body.GetNext()) {
      this.indexByBody.set(body, bodies.length);
      bodies.push(this.serializeBody(body));
    }
    return bodies;
  }

  private serializeBody(body: Box2D.b2Body): RubeBody {
    return {
      name: 'body name irrelevant for now',
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
  serializeCustomProperties(owner: CustomPropOwner | IMG): RubeCustomProperty[] | undefined {
    const props = this.loader.customProps.get(owner);
    if (!props) return undefined;
    const serialized: RubeCustomProperty[] = [];
    for (const [name, value] of Object.entries(props)) {
      if (typeof value === 'number' && Number.isInteger(value)) serialized.push({ name, int: value });
      else if (typeof value === 'number') serialized.push({ name, float: value });
      else if (typeof value === 'string') serialized.push({ name, string: value });
      else if (typeof value === 'boolean') serialized.push({ name, bool: value });
      else if (value instanceof b2.b2Vec2) serialized.push({ name, vec2: this.serializeVector(value) });
      else throw new Error('Custom property type not supported');
    }
    return serialized;
  }

  private serializeFixtures(body: Box2D.b2Body): RubeFixture[] {
    const fixtures: RubeFixture[] = [];
    for (let fixture = body.GetFixtureList(); b2.getPointer(fixture) !== b2.getPointer(b2.NULL); fixture = fixture.GetNext()) {
      fixtures.push(this.serializeFixture(fixture));
    }
    return fixtures;
  }

  private serializeFixture(fixture: Box2D.b2Fixture): RubeFixture {
    const { categoryBits, maskBits, groupIndex } = fixture.GetFilterData();

    const shape = fixture.GetShape();
    const shapeType = shape.GetType();

    const serialized: RubeFixture = {
      name: 'fixture name irrelevant for now',
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

    return serialized
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
    const vertices: RubeVectorArray = { x: [], y: [] };
    for (const { x, y } of b2Verts) {
      vertices.x.push(x);
      vertices.y.push(y);
    }
    return { vertices };
  }


  private serializeChainShape(shape: Box2D.b2Shape): RubeFixtureShapeChain {
    const chainShape = b2.castObject(shape, b2.b2ChainShape);
    const b2Verts = b2.reifyArray(b2.getPointer(chainShape.m_vertices), chainShape.m_count, 8, b2.b2Vec2);
    const vertices: RubeVectorArray = { x: [], y: [] };
    for (const { x, y } of b2Verts.reverse()) {
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
    if (this.world.GetJointCount() !== 0 && this.indexByBody.size === 0) throw new Error('Joints cannot be serialized before bodies');

    const joints: RubeJoint[] = [];
    for (let joint = this.world.GetJointList(); b2.getPointer(joint) !== b2.getPointer(b2.NULL); joint = joint.GetNext()) {
      joints.push(this.serializeJoint(joint));
    }
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
      case 'rope':
        throw new Error('Rope joint serialization not implemented');
      case 'motor':
        return this.serializeMotorJoint(joint);
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
    return {
      type: enumTypeToRubeJointType[joint.GetType()],
      name: 'joint name irrelevant for now',
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
    const { frequencyHertz, dampingRatio } = this.getJointFrequencyAndDampingRatio(distanceJoint);
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
    const { frequencyHertz, dampingRatio } = this.getJointFrequencyAndDampingRatio(wheelJoint);
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
    const { frequencyHertz, dampingRatio } = this.getJointFrequencyAndDampingRatio(weldJoint);
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
    for (const image of this.loader.loadedImages) {
      if (!image) throw new Error('Image not loaded');
      const serialized = this.handleSerializeImage(image);
      images.push(serialized);
    }

    return images;
  }

  private serializeVector(vec: Box2D.b2Vec2): RubeVector {
    if (vec.x === 0 && vec.y === 0) return 0;
    return { x: vec.x, y: vec.y };
  }

  private getJointFrequencyAndDampingRatio(joint: Box2D.b2DistanceJoint | Box2D.b2WheelJoint | Box2D.b2WeldJoint) {
    // Reverse b2LinearStiffness() formula. from https://github.com/erincatto/box2d/blob/main/src/dynamics/b2_joint.cpp#L40
    const stiffness = joint.GetStiffness();
    const damping = joint.GetDamping();
    const mass = joint.GetBodyA().GetMass() + joint.GetBodyB().GetMass();

    const omega = Math.sqrt(stiffness / mass); // natural frequency
    const frequencyHertz = omega / (2.0 * Math.PI);
    const dampingRatio = damping / (2.0 * mass * omega);
    return { frequencyHertz, dampingRatio };
  }
}

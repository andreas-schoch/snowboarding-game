import {decomposePolygon, isSelfIntersecting} from '../../helpers/decomposePolygon';
import {RubeBody, RubeExport, RubeFixture, RubeImage, RubeJoint, RubeJointBase} from './RubeExport';
import {MetaBody, MetaFixture, MetaImage, MetaJoint, RubeFile, RubeVector} from './RubeFile';

type BodyIndexByMetaId = Record<MetaBody['id'], number>;

export function RubeFileToExport(rubeFile: RubeFile): RubeExport {
  const bodyIndexByMetaId: BodyIndexByMetaId= {};
  const metaBodies: MetaBody[] = rubeFile.metaworld.metabody || [];
  const body: RubeBody[] = [];
  for (let i = 0; i < metaBodies.length; i++) {
    const metaBody = metaBodies[i];
    body.push(metaBodyToBody(metaBody));
    bodyIndexByMetaId[metaBody.id] = i;
  }

  const joint: RubeJoint[] = (rubeFile.metaworld.metajoint || []).map(el => metaJointToJoint(el, bodyIndexByMetaId));
  const image: RubeImage[] = (rubeFile.metaworld.metaimage || []).map(el => metaImageToImage(el, bodyIndexByMetaId));

  const {gravity, allowSleep, autoClearForces, positionIterations, velocityIterations, stepsPerSecond, warmStarting, continuousPhysics, subStepping} = rubeFile.metaworld;
  return {
    body,
    joint,
    image,
    gravity,
    allowSleep,
    autoClearForces,
    positionIterations,
    velocityIterations,
    stepsPerSecond,
    warmStarting,
    continuousPhysics,
    subStepping,
  };

}

const typeMap = {
  static: 0,
  kinematic: 1,
  dynamic: 2
};

function metaBodyToBody(metaBody: MetaBody): RubeBody {
  const massDataMass = metaBody['massData-mass'];
  const massDataCenter = metaBody['massData-center'];
  const massDataI = metaBody['massData-I'];
  return {
    name: metaBody.name,
    active: metaBody.active,
    awake: metaBody.awake,
    bullet: metaBody.bullet,
    fixedRotation: metaBody.fixedRotation,
    sleepingAllowed: metaBody.sleepingAllowed,
    type: typeMap[metaBody.type] as 0 | 1 | 2,
    position: metaBody.position,
    angle: metaBody.angle,
    angularDamping: metaBody.angularDamping,
    angularVelocity: metaBody.angularVelocity,
    linearDamping: metaBody.linearDamping,
    linearVelocity: metaBody.linearVelocity,
    'massData-mass': massDataMass,
    'massData-center': massDataCenter,
    'massData-I': massDataI,
    massDataMass: massDataMass,
    massDataCenter: massDataCenter,
    massDataI: massDataI,
    customProperties: metaBody.customProperties,
    fixture: (metaBody.fixture || []).flatMap(mf => metaFixtureToFixture(mf)),
  };
}

function metaFixtureToFixture(metaFixture: MetaFixture): RubeFixture[] {
  const filterCategoryBits = metaFixture['filter-categoryBits'];
  const filterMaskBits = metaFixture['filter-maskBits'];
  const filterGroupIndex = metaFixture['filter-groupIndex'];

  const shape = metaFixture.shapes[0];

  const base: Omit<RubeFixture, 'circle' | 'polygon' | 'chain'> = {
    name: metaFixture.name,
    density: metaFixture.density,
    'filter-categoryBits': filterCategoryBits,
    'filter-maskBits': filterMaskBits,
    'filter-groupIndex': filterGroupIndex,
    filterCategoryBits,
    filterMaskBits,
    filterGroupIndex,
    friction: metaFixture.friction,
    restitution: metaFixture.restitution,
    sensor: metaFixture.sensor,
    customProperties: metaFixture.customProperties,
  };

  const vertices = metaFixture.vertices;
  switch (shape.type) {
  case 'circle':
    return [{
      ...base,
      circle: {
        radius: shape.radius,
        center: {x: vertices.x[0],y: vertices.y[0]},
      }
    }];
  case 'polygon': {
    // We need to decompose polygons to get rid of concave shapes and shapes with more than 8 vertices
    const decomposed = decomposePolygon(metaFixture.vertices);
    const fixtures: RubeFixture[] = [];
    for (const verts of decomposed) fixtures.push({...base, polygon: {vertices: verts}});
    return fixtures;
  }
  case 'line':
    if (isSelfIntersecting(vertices)) throw new Error('Line shape cannot intersect itself');
    return [{
      ...base,
      chain: {vertices}
    }];
  case 'loop': {
    if (isSelfIntersecting(vertices)) throw new Error('Loop shape cannot intersect itself');
    const nextVertex: RubeVector = {x: vertices.x[1], y: vertices.y[1]};
    const prevVertex: RubeVector = {x: vertices.x[vertices.x.length - 2], y: vertices.y[vertices.y.length - 2]};
    return [{
      ...base,
      chain: {
        vertices,
        hasNextVertex: true,
        hasPrevVertex: true,
        nextVertex,
        prevVertex,
      }
    }];
  }}
}

function metaJointToJoint(metaJoint: MetaJoint, bodyIndexByMetaId: BodyIndexByMetaId): RubeJoint {
  // I think only bodyA, bodyB and refAngle need some special handling, otherwise we could just use the spread operator.
  // I will consider simplifying this function later using the spread operator but for now I prefer to keep it explicit.
  const bodyAIndex = bodyIndexByMetaId[metaJoint.bodyA];
  const bodyBIndex = bodyIndexByMetaId[metaJoint.bodyB];

  if (bodyAIndex === undefined) throw new Error(`Body with id ${metaJoint.bodyA} not found in map`);
  if (bodyBIndex === undefined) throw new Error(`Body with id ${metaJoint.bodyB} not found in map`);

  const {name, anchorA, anchorB, collideConnected, customProperties} = metaJoint;
  const base: Omit<RubeJointBase, 'type'> = {
    bodyA: bodyAIndex,
    bodyB: bodyBIndex,
    name,
    anchorA,
    anchorB,
    collideConnected,
    customProperties,
  };

  switch (metaJoint.type) {
  case 'revolute': {
    const {enableLimit, enableMotor, jointSpeed, lowerLimit, upperLimit, maxMotorTorque, motorSpeed, referenceAngle} = metaJoint;
    return {
      ...base,
      type: 'revolute',
      refAngle: referenceAngle,
      enableLimit,
      enableMotor,
      jointSpeed,
      lowerLimit,
      upperLimit,
      maxMotorTorque,
      motorSpeed,
    };
  }
  case 'distance': {
    const {dampingRatio, frequency, length} = metaJoint;
    return {
      ...base,
      type: 'distance',
      dampingRatio,
      frequency,
      length,
    };
  }
  case 'prismatic': {
    const {enableLimit, enableMotor, localAxisA, lowerLimit, upperLimit, maxMotorForce, motorSpeed, referenceAngle} = metaJoint;
    return {
      ...base,
      type: 'prismatic',
      refAngle: referenceAngle,
      enableLimit,
      enableMotor,
      localAxisA,
      lowerLimit,
      upperLimit,
      maxMotorForce,
      motorSpeed,
    };
  }
  case 'wheel': {
    const {enableMotor, localAxisA, maxMotorTorque, motorSpeed, springDampingRatio, springFrequency} = metaJoint;
    return {
      ...base,
      type: 'wheel',
      enableMotor,
      localAxisA,
      maxMotorTorque,
      motorSpeed,
      springDampingRatio,
      springFrequency,
    };
  }
  case 'rope': {
    const {maxLength} = metaJoint;
    return {
      ...base,
      type: 'rope',
      maxLength,
    };
  }
  case 'motor': {
    const {maxForce, maxTorque, correctionFactor} = metaJoint;
    return {
      ...base,
      type: 'motor',
      maxForce,
      maxTorque,
      correctionFactor,
    };
  }
  case 'weld': {
    const {dampingRatio, frequency, referenceAngle} = metaJoint;
    return {
      ...base,
      type: 'weld',
      refAngle: referenceAngle,
      dampingRatio,
      frequency,
    };
  }
  case 'friction': {
    const {maxForce, maxTorque} = metaJoint;
    return {
      ...base,
      type: 'friction',
      maxForce,
      maxTorque,
    };
  }}
}

function metaImageToImage(metaImage: MetaImage, bodyIndexByMetaId: BodyIndexByMetaId): RubeImage {
  const attachedToBody = metaImage.body !== undefined;
  const bodyIndex = metaImage.body !== undefined ? bodyIndexByMetaId[metaImage.body] : undefined;
  if (attachedToBody && bodyIndex === undefined) throw new Error(`Image references body with id ${metaImage.body} not found in map`);

  const {name, opacity, renderOrder, scale, aspectScale, angle, center, file, flip, customProperties} = metaImage;
  return {
    body: bodyIndex,
    name,
    opacity,
    renderOrder,
    scale,
    aspectScale,
    angle,
    center,
    file,
    flip,
    customProperties,
  };
}

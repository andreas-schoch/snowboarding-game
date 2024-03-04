import {rubeFileSerializer} from '../..';
import {arrayBufferToString} from '../../helpers/binaryTransform';
import {decomposePolygon, isSelfIntersecting} from '../../helpers/decomposePolygon';
import {RubeBody, RubeExport, RubeFixture, RubeImage, RubeJoint, RubeJointBase} from './RubeExport';
import {MetaBody, MetaFixture, MetaImage, MetaJoint, MetaWorld, RubeFile, RubeVector} from './RubeFile';
import {sanitizeRubeFile} from './sanitizeRubeFile';

type BodyIndexByMetaId = Record<MetaBody['id'], number>;

export function RubeFileToExport(scene: Phaser.Scene, rubeFile: RubeFile): RubeExport {
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

  deconstructMetaObjects(scene, rubeFile.metaworld.metaobject, body, joint, image);

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

function metaBodyToBody(metaBody: MetaBody, offsetX = 0, offsetY = 0, offsetAngle = 0): RubeBody {
  const massDataMass = metaBody['massData-mass'];
  const massDataCenter = metaBody['massData-center'];
  const massDataI = metaBody['massData-I'];

  const positionX = metaBody.position? metaBody.position.x + offsetX : offsetX;
  const positionY = metaBody.position? metaBody.position.y + offsetY : offsetY;

  return {
    name: metaBody.name,
    active: metaBody.active,
    awake: metaBody.awake,
    bullet: metaBody.bullet,
    fixedRotation: metaBody.fixedRotation,
    sleepingAllowed: metaBody.sleepingAllowed,
    type: typeMap[metaBody.type] as 0 | 1 | 2,
    position: {x: positionX, y: positionY},
    angle: metaBody.angle + offsetAngle,
    angularDamping: metaBody.angularDamping,
    angularVelocity: metaBody.angularVelocity,
    linearDamping: metaBody.linearDamping,
    linearVelocity: metaBody.linearVelocity,
    'massData-mass': massDataMass,
    'massData-center': massDataCenter,
    'massData-I': massDataI,
    massDataMass,
    massDataCenter,
    massDataI,
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
        hasNextVertex: true,
        hasPrevVertex: true,
        nextVertex,
        prevVertex,
        vertices,
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

function metaImageToImage(metaImage: MetaImage, bodyIndexByMetaId: BodyIndexByMetaId, offsetX = 0, offsetY = 0): RubeImage {
  const bodyIndex = metaImage.body !== undefined ? bodyIndexByMetaId[metaImage.body] : -1;
  if (bodyIndex !== -1 && bodyIndex === undefined) throw new Error(`Image with id "${metaImage.id}" references body with id "${metaImage.body}" not found in map`);

  const {name, opacity, renderOrder, scale, aspectScale, angle, center, file, flip, customProperties} = metaImage;
  const realCenter = center ? {x: center.x + offsetX, y: center.y + offsetY} : {x: 0, y: 0};

  return {
    body: bodyIndex,
    center: realCenter,
    angle: angle,
    name,
    opacity,
    renderOrder,
    scale,
    aspectScale,
    file,
    flip,
    customProperties,
  };
}

// TODO this works for now but only if we don't have nested objects
function deconstructMetaObjects(scene: Phaser.Scene, metaObjects: MetaWorld['metaobject'], body: RubeBody[], joint: RubeJoint[], image: RubeImage[]): void {
  if (!metaObjects) return;

  const cachedRubeFiles: Record<string, RubeFile> = {};

  for (const metaObject of metaObjects) {
    const offsetX = metaObject.position ? metaObject.position.x : 0;
    const offsetY = metaObject.position ? metaObject.position.y : 0;
    const offsetAngle = metaObject.angle === undefined ? 0 : metaObject.angle;

    const key = (metaObject.file || '').split('/').reverse()[0];
    const alreadySeen = cachedRubeFiles[key];

    let objectRubeFile: RubeFile;
    if (alreadySeen) {
      objectRubeFile = alreadySeen;
    } else {
      const buffer = scene.cache.binary.get(key);
      const encoded = arrayBufferToString(buffer);
      let file = rubeFileSerializer.decode(encoded);
      file = sanitizeRubeFile(file);
      objectRubeFile = file;
    }

    const bodyIndexByMetaId: BodyIndexByMetaId= {};
    const metaBodies: MetaBody[] = objectRubeFile.metaworld.metabody || [];
    const objectBody: RubeBody[] = [];
    for (let i = 0; i < metaBodies.length; i++) {
      const metaBody = metaBodies[i];
      objectBody.push(metaBodyToBody(metaBody, offsetX, offsetY, offsetAngle));
      bodyIndexByMetaId[metaBody.id] = body.length + i;
    }

    const objectJoint: RubeJoint[] = (objectRubeFile.metaworld.metajoint || []).map(el => metaJointToJoint(el, bodyIndexByMetaId));
    const objectImage: RubeImage[] = (objectRubeFile.metaworld.metaimage || []).map(el => metaImageToImage(el, bodyIndexByMetaId, offsetX, offsetY));

    body.push(...objectBody);
    joint.push(...objectJoint);
    image.push(...objectImage);
  }
}

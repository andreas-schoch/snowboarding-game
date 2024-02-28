import {isXY} from '../../helpers/rubeTransformers';
import {RubeBody, RubeFixture, RubeImage, RubeJoint, RubeExport} from './RubeExport';

// TODO eventually we can simplify the loader which checks the defaults for each optional property and just use this
//  It will require a bit more memory but probably negligible. Protobuf encoded size is almost the same even with optional fields included
//  For now this stays like this until I continue work on my own level editor and decide wheather to stay compatible with RUBE or not.

// TODO consider overriding the existing objects/arrays instead of creating new ones
export function sanitizeRubeDefaults(scene: RubeExport) {
  const sanitizedScene: Partial<RubeExport> = {
    gravity: isXY(scene.gravity) ? scene.gravity : {x: 0, y: 0},
    allowSleep: scene.allowSleep,
    autoClearForces: scene.autoClearForces,
    positionIterations: scene.positionIterations,
    velocityIterations: scene.velocityIterations,
    stepsPerSecond: scene.stepsPerSecond,
    warmStarting: scene.warmStarting,
    continuousPhysics: scene.continuousPhysics,
    subStepping: scene.subStepping,
  };

  if (scene.customProperties) sanitizedScene.customProperties = scene.customProperties;
  if (scene.collisionbitplanes) sanitizedScene.collisionbitplanes = scene.collisionbitplanes;
  if (scene.body) sanitizedScene.body = scene.body.map(sanitizeBody);
  if (scene.joint) sanitizedScene.joint = scene.joint.map(sanitizeJoint);
  if (scene.image) sanitizedScene.image = scene.image.map(sanitizeImage);

  return sanitizedScene as RubeExport;
}

function sanitizeBody(body: RubeBody): RubeBody {
  const massDataMass = body['massData-mass'] || body.massDataMass || 1;
  const massDataCenter = isXY(body['massData-center']) ? body['massData-center'] : body.massDataCenter || {x: 0, y: 0};
  const massDataI = body['massData-I'] || body.massDataI || 1;

  return {
    name: body.name || '',
    active: body.active !== undefined ? body.active : true,
    awake: body.awake !== undefined ? body.awake : true,
    bullet: body.bullet || false,
    fixedRotation: body.fixedRotation || false,
    type: Math.min(Math.max(body.type || 0, 0), 2) as 0 | 1 | 2,
    position: isXY(body.position) ? body.position : {x: 0, y: 0},
    angle: body.angle || 0,
    angularDamping: body.angularDamping || 0,
    angularVelocity: body.angularVelocity || 0,
    linearDamping: body.linearDamping || 0,
    linearVelocity: isXY(body.linearVelocity) ? body.linearVelocity : {x: 0, y: 0},
    'massData-mass': massDataMass,
    'massData-center': massDataCenter,
    'massData-I': massDataI,
    massDataMass,
    massDataCenter,
    massDataI,
    customProperties: body.customProperties || [],
    fixture: (body.fixture || []).map(sanitizeFixture),
  };
}

function sanitizeFixture(fixture: RubeFixture): RubeFixture {
  const filterCategoryBits = fixture['filter-categoryBits'] || fixture.filterCategoryBits || 1;
  const filterMaskBits = fixture['filter-maskBits'] || fixture.filterMaskBits || 65535;
  const filterGroupIndex = fixture['filter-groupIndex'] || fixture.filterGroupIndex || 0;
  const fixtureSanitized: RubeFixture = {
    name: fixture.name || '',
    density: fixture.density !== undefined ? fixture.density : 0,
    'filter-categoryBits': filterCategoryBits,
    'filter-maskBits': filterMaskBits,
    'filter-groupIndex': filterGroupIndex,
    filterCategoryBits,
    filterMaskBits,
    filterGroupIndex,
    friction: fixture.friction !== undefined ? fixture.friction : 0,
    restitution: fixture.restitution !== undefined ? fixture.restitution : 0,
    sensor: fixture.sensor !== undefined ? fixture.sensor : false,
    customProperties: fixture.customProperties || [],
  };

  if (fixture.circle) fixtureSanitized.circle = fixture.circle;
  if (fixture.polygon) fixtureSanitized.polygon = fixture.polygon;
  if (fixture.chain) fixtureSanitized.chain = fixture.chain;

  return fixture;
}

function sanitizeJoint(joint: RubeJoint): RubeJoint {
  return {
    ...joint,
    anchorA: isXY(joint.anchorA) ? joint.anchorA : {x: 0, y: 0},
    anchorB: isXY(joint.anchorB) ? joint.anchorB : {x: 0, y: 0},
    collideConnected: joint.collideConnected || false,
    customProperties: joint.customProperties || []
  };
}

function sanitizeImage(image: RubeImage): RubeImage {
  return {
    ...image,
    opacity: image.opacity !== undefined ? image.opacity : 1,
    renderOrder: image.renderOrder !== undefined ? image.renderOrder : 0,
    scale: image.scale !== undefined ? image.scale : 1,
    aspectScale: image.aspectScale !== undefined ? image.aspectScale : 1,
    angle: image.angle || 0,
    body: image.body !== undefined ? image.body : 0,
    center: isXY(image.center) ? image.center : {x: 0, y: 0},
    file: image.file || '',
    flip: image.flip || false,
    customProperties: image.customProperties || []
    // corners: image.corners || {x: [], y: []},
    // filter: image.filter !== undefined ? image.filter : 0,
    // colorTint: image.colorTint || [255, 255, 255, 255],
    // glDrawElements: image.glDrawElements || [],
    // glTexCoordPointer: image.glTexCoordPointer || [],
    // glVertexPointer: image.glVertexPointer || [],
  };
}

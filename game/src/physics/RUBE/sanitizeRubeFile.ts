import {isXY} from '../../helpers/rubeTransformers';
import {RubeFile, MetaBody, MetaFixture, MetaJoint, MetaImage, MetaObject} from './RubeFile';
import {customPropertyDefs, metaWorld} from './RubeFileConstants';

export function sanitizeRubeFile(rubeFile: RubeFile): RubeFile {
  return {
    customPropertyDefs: [...customPropertyDefs],
    metaworld: {
      ...metaWorld,
      metabody: (rubeFile.metaworld.metabody || []).map(sanitizeMetaBody),
      metajoint: (rubeFile.metaworld.metajoint || []).map(sanitizeMetaJoint),
      metaimage: (rubeFile.metaworld.metaimage || []).map(sanitizeMetaImage),
      metaobject: (rubeFile.metaworld.metaobject || []).map(sanitizeMetaObject),
    }
  };
}

function sanitizeMetaBody(metaBody: MetaBody): MetaBody {
  if (!metaBody.id) throw new Error('Body must have an id');
  const massDataMass = metaBody['massData-mass'] || metaBody.massDataMass || 1;
  const massDataCenter = isXY(metaBody['massData-center']) ? metaBody['massData-center'] : metaBody.massDataCenter || {x: 0, y: 0};
  const massDataI = metaBody['massData-I'] || metaBody.massDataI || 1;

  return {
    id: metaBody.id,
    name: metaBody.name || '',
    active: metaBody.active !== undefined ? metaBody.active : true,
    awake: metaBody.awake !== undefined ? metaBody.awake : true,
    bullet: metaBody.bullet || false,
    fixedRotation: metaBody.fixedRotation || false,
    sleepingAllowed: metaBody.sleepingAllowed !== undefined ? metaBody.sleepingAllowed : true,
    type: metaBody.type || 'static',
    position: isXY(metaBody.position) ? metaBody.position : {x: 0, y: 0},
    angle: metaBody.angle || 0,
    angularDamping: metaBody.angularDamping || 0,
    angularVelocity: metaBody.angularVelocity || 0,
    linearDamping: metaBody.linearDamping || 0,
    linearVelocity: isXY(metaBody.linearVelocity) ? metaBody.linearVelocity : {x: 0, y: 0},
    'massData-mass': massDataMass,
    'massData-center': massDataCenter,
    'massData-I': massDataI,
    massDataMass,
    massDataCenter,
    massDataI,
    customProperties: metaBody.customProperties || [],
    fixture: (metaBody.fixture || []).map(sanitizeMetaFixture),
  };
}

function sanitizeMetaFixture(metaFixture: MetaFixture): MetaFixture {
  const filterCategoryBits = metaFixture['filter-categoryBits'] || metaFixture.filterCategoryBits || 1;
  const filterMaskBits = metaFixture['filter-maskBits'] || metaFixture.filterMaskBits || 65535;
  const filterGroupIndex = metaFixture['filter-groupIndex'] || metaFixture.filterGroupIndex || 0;

  if (!metaFixture.id) throw new Error('Fixture must have an id');
  if (metaFixture.shapes.length !== 1) throw new Error('Fixture must have exactly one shape');

  return {
    id: metaFixture.id,
    name: metaFixture.name || 'fixture',
    density: metaFixture.density !== undefined ? metaFixture.density : 0,
    'filter-categoryBits': filterCategoryBits,
    'filter-maskBits': filterMaskBits,
    'filter-groupIndex': filterGroupIndex,
    filterCategoryBits,
    filterMaskBits,
    filterGroupIndex,
    friction: metaFixture.friction !== undefined ? metaFixture.friction : 0,
    restitution: metaFixture.restitution !== undefined ? metaFixture.restitution : 0,
    sensor: metaFixture.sensor !== undefined ? metaFixture.sensor : false,
    customProperties: metaFixture.customProperties || [],
    vertices: metaFixture.vertices || {x: [], y: []},
    shapes: metaFixture.shapes,
  };
}

function sanitizeMetaJoint(metaJoint: MetaJoint): MetaJoint {
  if (!metaJoint.id) throw new Error('Joint must have an id');
  if (!metaJoint.bodyA) throw new Error('Joint must have a bodyA');
  if (!metaJoint.bodyB) throw new Error('Joint must have a bodyB');

  return {
    ...metaJoint,
    anchorA: isXY(metaJoint.anchorA) ? metaJoint.anchorA : {x: 0, y: 0},
    anchorB: isXY(metaJoint.anchorB) ? metaJoint.anchorB : {x: 0, y: 0},
    collideConnected: metaJoint.collideConnected || false,
    customProperties: metaJoint.customProperties || [],
  };
}

function sanitizeMetaImage(image: MetaImage): MetaImage {
  if (!image.id) throw new Error('Image must have an id');
  if (image.file.search(/^\.\.\/img\/([\w/_-]+)\.png$/) !== 0) throw new Error(`Invalid image file path "${image.file}". Ensure "Save full path for images" is unchecked in RUBE Editor.`);

  return {
    id: image.id,
    name: image.name || 'Image',
    filter: image.filter || 1,
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
  };

}

function sanitizeMetaObject(metaObject: MetaObject): MetaObject {
  if (!metaObject.id) throw new Error('Object must have an id');
  if (metaObject.file.search(/^prefabs\/[\w-]+\.rube$/) !== 0) throw new Error(`Invalid object file path "${metaObject.file}". Ensure "Save full path for objects" is unchecked in RUBE Editor.`);

  return {
    id: metaObject.id,
    file: metaObject.file,
    name: metaObject.name || 'Object',
    path: metaObject.path || '',
    flip: metaObject.flip !== undefined ? metaObject.flip : false,
    angle: metaObject.angle || 0,
    scale: metaObject.scale || 1,
    position: isXY(metaObject.position) ? metaObject.position : {x: 0, y: 0},
    customProperties: metaObject.customProperties || [],
  };
}

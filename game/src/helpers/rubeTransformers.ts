import {recordLeak, b2} from '..';
import {XY} from '../Terrain';
import {RubeCustomPropsMap} from '../physics/RUBE/EntityTypes';
import {RubeVectorArray,RubeVector, RubeCustomProperty} from '../physics/RUBE/RubeFile';
import {customPropertyDefs} from '../physics/RUBE/customPropertyDefs';

// IMPORTANt: It is assumed that this transformer is used for phaser stuff, so we already negate the Y axis here (RUBE uses a different coordinate system)
export function rubeToXY(val?: RubeVector, offsetX = 0, offsetY = 0): XY {
  if (val && typeof val === 'object' && val.hasOwnProperty('x') && val.hasOwnProperty('y')) return {x: val.x + offsetX, y: -(val.y + offsetY)};
  // Non-compacted scenes seem to be around 5-10% larger in character size but it's negligible for the moment.
  // While the app can handle compact zero vectors, protobuf does not seem to support conditional types like that.
  // else if (val === 0) throw new Error('Ensure the option "Compact zero vectors" is disabled for the loaded rube scene.');
  else return {x: 0, y: 0};
}

// IMPORTANt: It is assumed that this transformer is used primarily for Box2D stuff, so we don't negate the Y axis here
export function rubeToVec2(val?: RubeVector, offsetX = 0, offsetY = 0): Box2D.b2Vec2 {
  if (val && typeof val === 'object' && val.hasOwnProperty('x') && val.hasOwnProperty('y')) return recordLeak(new b2.b2Vec2(val.x + offsetX, val.y + offsetY));
  // Non-compacted scenes seem to be around 5-10% larger in character size but it's negligible for the moment.
  // While the app can handle compact zero vectors, protobuf does not seem to support conditional types like that.
  // else if (val === 0) throw new Error('Ensure the option "Compact zero vectors" is disabled for the loaded rube scene.');
  else return recordLeak(new b2.b2Vec2(0, 0));
}

export function XYToRubeVectorArray(vertices?: XY[]): RubeVectorArray {
  const vecArray: RubeVectorArray = {x: [], y: []};
  if (!vertices) return vecArray;
  for (let i = 0; i < vertices.length; i++) {
    vecArray.x.push(vertices[i].x);
    vecArray.y.push(-vertices[i].y); // In RUBE Editor the Y coordinates are upside down when compared to Phaser3
  }
  return vecArray;
}

export function RubeVectorArrayToXY(vertices?: RubeVectorArray, offsetX = 0, offsetY = 0): XY[] {
  if (!vertices) return [];
  const verts: XY[] = [];
  for (let i = 0; i < vertices.x.length; i++) verts.push({
    x: vertices.x[i] + offsetX,
    y: -vertices.y[i] + offsetY, // In RUBE Editor the Y coordinates are upside down when compared to Phaser3
  });
  return verts;
}

export function customPropsArrayToMap(customProperties?: RubeCustomProperty[]): RubeCustomPropsMap {
  if (!customProperties) return {} as RubeCustomPropsMap;
  return customProperties.reduce((obj, cur) => {
    // TODO get rid of type casting
    if (cur.hasOwnProperty('int')) obj[cur.name] = cur.int as number;
    else if (cur.hasOwnProperty('float')) obj[cur.name] = cur.float as number;
    else if (cur.hasOwnProperty('string')) obj[cur.name] = cur.string as string;
    else if (cur.hasOwnProperty('color')) obj[cur.name] = cur.color as string;
    else if (cur.hasOwnProperty('bool')) obj[cur.name] = cur.bool as boolean;
    else if (cur.hasOwnProperty('vec2')) obj[cur.name] = cur.vec2 as RubeVector;
    else throw new Error('invalid or missing custom property type');
    return obj;
  }, {} as RubeCustomPropsMap);
}

export function customPropsMapToArray(customProps: RubeCustomPropsMap): RubeCustomProperty[] {
  return Object.entries(customProps).map(([key, value]) => {
    const propDef = customPropertyDefs[key];
    // Since we don't dynamically create custom properties, we know which keys are available
    if (!propDef) throw new Error(`No custom property definition found for key: ${key}`);

    // TODO get rid of type casting
    switch (propDef.type) {
    case 'int':
      return {name: key, int: value as number} as RubeCustomProperty;
    case 'float':
      return {name: key, float: value as number} as RubeCustomProperty;
    case 'string':
      return {name: key, string: value as string} as RubeCustomProperty;
    case 'color':
      return {name: key, color: value as string} as RubeCustomProperty;
    case 'bool':
      return {name: key, bool: value as boolean} as RubeCustomProperty;
    case 'vec2':
      return {name: key, vec2: value as RubeVector} as RubeCustomProperty;
    default:
      throw new Error(`Invalid custom property type: ${propDef.type}`);
    }
  });
}

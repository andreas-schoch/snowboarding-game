import {recordLeak, b2} from '..';
import {XY} from '../Terrain';
import {RubeVectorArray,RubeVector, RubeCustomProperty} from '../physics/RUBE/RubeFile';
import {RubeCustomPropsMap} from '../physics/RUBE/otherTypes';

export function rubeToXY(val?: RubeVector, offsetX = 0, offsetY = 0): XY {
  if (val && typeof val === 'object' && val.hasOwnProperty('x') && val.hasOwnProperty('y')) return {x: val.x + offsetX, y: val.y + offsetY};
  // Non-compacted scenes seem to be around 5-10% larger in character size but it's negligible for the moment.
  // While the app can handle compact zero vectors, protobuf does not seem to support conditional types like that.
  // else if (val === 0) throw new Error('Ensure the option "Compact zero vectors" is disabled for the loaded rube scene.');
  else return {x: 0, y: 0};
}

export function rubeToVec2(val?: RubeVector, offsetX = 0, offsetY = 0): Box2D.b2Vec2 {
  if (val && typeof val === 'object' && val.hasOwnProperty('x') && val.hasOwnProperty('y')) return recordLeak(new b2.b2Vec2(val.x + offsetX, val.y + offsetY));
  // Non-compacted scenes seem to be around 5-10% larger in character size but it's negligible for the moment.
  // While the app can handle compact zero vectors, protobuf does not seem to support conditional types like that.
  // else if (val === 0) throw new Error('Ensure the option "Compact zero vectors" is disabled for the loaded rube scene.');
  else return recordLeak(new b2.b2Vec2(0, 0));
}

export function separateVertices(vertices: XY[]): RubeVectorArray {
  return {
    x: vertices.map(v => v.x),
    y: vertices.map(v => -v.y)
  };
}

export function customPropsArrayToMap(customProperties: RubeCustomProperty[]): RubeCustomPropsMap {
  return customProperties.reduce((obj, cur) => {
    if (cur.hasOwnProperty('int')) obj[cur.name] = cur.int;
    else if (cur.hasOwnProperty('float')) obj[cur.name] = cur.float;
    else if (cur.hasOwnProperty('string')) obj[cur.name] = cur.string;
    else if (cur.hasOwnProperty('color')) obj[cur.name] = cur.color;
    else if (cur.hasOwnProperty('bool')) obj[cur.name] = cur.bool;
    else if (cur.hasOwnProperty('vec2')) obj[cur.name] = cur.vec2;
    else throw new Error('invalid or missing custom property type');
    return obj;
  }, {} as RubeCustomPropsMap);
}

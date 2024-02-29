import {isSimple, makeCCW, quickDecomp, Polygon} from 'poly-decomp-es';
import {RubeVectorArray} from '../physics/RUBE/RubeFile';

export function isSelfIntersecting(vertices: RubeVectorArray): boolean {
  const polygon = fromVectorArrayToPolygon(vertices);
  return !isSimple(polygon);
}

export function decomposePolygon(vertices: RubeVectorArray): RubeVectorArray[] {
  console.time('decomposePolygon');
  const polygon = fromVectorArrayToPolygon(vertices);

  if (!isSimple(polygon)) throw new Error('Polygon cannot intersect itself');

  makeCCW(polygon);
  // removeCollinearPoints(polygon, 0.05);
  // removeDuplicatePoints(polygon, 0.005);
  const convexPolygons = quickDecomp(polygon); // Ensures there are no concave polygons

  const validPolygons: Polygon[] = [];
  for (const polygon of convexPolygons) {
    if (polygon.length <= 8) {
      validPolygons.push(polygon);
      continue;
    }

    // split it until we have only polygons with 8 or less vertices
    for (let i = 0; i < polygon.length; i += 7) {
      const end = Math.min(i + 8, polygon.length);
      const sliced = polygon.slice(i, end);
      validPolygons.push(sliced);
    }
  }

  const result = validPolygons.map(fromPolygonToVectorArray);
  console.timeEnd('decomposePolygon');
  return result;
}

function fromVectorArrayToPolygon(polygon: RubeVectorArray): Polygon {
  const result: Polygon = [];
  for (let i = 0; i < polygon.x.length; i++) {
    result.push([polygon.x[i], polygon.y[i]]);
  }
  return result;
}

function fromPolygonToVectorArray(polygon: Polygon): RubeVectorArray {
  const vertexArray: RubeVectorArray = {x: [], y: []};
  for (const vertex of polygon) {
    vertexArray.x.push(vertex[0]);
    vertexArray.y.push(vertex[1]);
  }
  return vertexArray;
}

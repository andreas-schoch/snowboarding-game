import {isSimple, makeCCW, quickDecomp, Polygon} from 'poly-decomp-es';
import {RubeVectorArray} from '../physics/RUBE/RubeFile';

export function isSelfIntersecting(vertices: RubeVectorArray): boolean {
  const polygon = fromVectorArrayToPolygon(vertices);
  return !isSimple(polygon);
}

export function decomposePolygon(vertices: RubeVectorArray): RubeVectorArray[] {
  console.time('decomposePolygon');
  const polygon = fromVectorArrayToPolygon(vertices);

  makeCCW(polygon);
  const convexPolygons = quickDecomp(polygon); // Make sure there are no concave polygons

  const newConvexPolygons: Polygon[] = [];
  for (const polygon of convexPolygons) {
    // If the polygon has 8 or less vertices, we can use it as is
    if (polygon.length <= 8) {
      newConvexPolygons.push(polygon);
      continue;
    }

    // split it until we have only polygons with 8 or less vertices
    for (let i = 0; i < polygon.length; i += 7) { // Use 7 to ensure overlap and closure
      if (i + 8 < polygon.length) {
        const sliced = polygon.slice(i, i + 8);
        newConvexPolygons.push(sliced);
      } else {
        // Handle last slice differently to ensure it includes the first vertex for closure
        const sliced = polygon.slice(i, polygon.length);
        // Ensure the polygon is closed by adding the starting point if not already included
        if (sliced[0] !== sliced[sliced.length - 1]) {
          sliced.push(polygon[0]);
        }
        newConvexPolygons.push(sliced);
        break; // we've reached the end
      }
    }
  }

  const result = newConvexPolygons.map(fromPolygonToVectorArray);
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

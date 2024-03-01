import {metaWorld} from './RubeFileConstants';
import {sanitizeRubeFile} from './sanitizeRubeFile';

export function generateEmptyRubeFile() {
  return sanitizeRubeFile({
    customPropertyDefs: [],
    metaworld: {
      ...metaWorld,
      gravity: {x: 0, y: 0},
      metaobject: [],
      metaimage: [],
      metabody: [],
      metajoint: []
    }
  });
}

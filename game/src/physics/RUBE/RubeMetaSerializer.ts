import {RubeFile} from './RubeFile';
import {customPropertyDefs, metaWorld} from './RubeFileConstants';
import {EditorItems} from './RubeMetaLoader';

export class RubeMetaSerializer {
  constructor() { }

  serialize(items: EditorItems): RubeFile {
    const rubeFile: RubeFile = {
      customPropertyDefs: [...customPropertyDefs],
      metaworld: {
        ...metaWorld,
        metaobject: Object.values(items.object).map(o => o.meta),
        metaimage: Object.values(items.image).map(i => i.meta),
        metabody: Object.values(items.terrain).map(t => t.metaBody),
        metajoint: [] // TODO although the way the editor works, it won't be required
      }
    };

    console.debug('RubeMetaSerializer.serialize', rubeFile);
    return rubeFile;
  }
}

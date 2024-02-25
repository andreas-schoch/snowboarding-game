import {RubeFile} from './RubeFile';
import {customPropertyDefs, metaWorld} from './RubeFileConstants';
import {EditorItems} from './RubeMetaLoader';

export class RubeMetaSerializer {
  constructor(private scene: Phaser.Scene) { }

  serialize(items: EditorItems): RubeFile {
    const rubeFile: RubeFile = {
      customPropertyDefs: [...customPropertyDefs],
      metaworld: {
        ...metaWorld,
        metaobject: items.objects.map(o => o.meta),
        metaimage: items.images.map(i => i.meta),
        metabody: items.terrainChunks.map(t => t.metaBody),
        metajoint: [] // TODO although the way the editor works, it won't be required
      }
    };

    console.debug('RubeMetaSerializer.serialize', rubeFile);
    return rubeFile;
  }
}

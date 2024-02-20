import {RubeFile} from './RubeFile';
import {EditorItems} from './RubeMetaLoader';

export class RubeMetaSerializer {
  constructor(private scene: Phaser.Scene) { }

  serialize(items: EditorItems): RubeFile {
    // Apart from the meta properties
    const {customPropertyDefs, metaworld}: RubeFile = this.scene.cache.json.get('level_new.rube');

    const rubeFile: RubeFile = {
      customPropertyDefs,
      metaworld: {
        ...metaworld,
        metaobject: items.objects.map(o => o.meta),
        metaimage: items.images.map(i => i.meta),
        metabody: items.terrainChunks.map(t => t.metaBody),
      },

    };

    console.log('serialized back rubefile', rubeFile);
    return rubeFile;
  }
}


import {Accessor, Setter, createSignal} from 'solid-js';
import {rubeFileSerializer} from '../..';
import {XY} from '../../Terrain';
import {arrayBufferToString} from '../../helpers/binaryTransform';
import {pseudoRandomId} from '../../helpers/pseudoRandomId';
import {RubeCustomPropsMap} from '../../physics/RUBE/EntityTypes';
import {MetaObject} from '../../physics/RUBE/RubeFile';
import {BaseEditorItem, EditorItems, RubeMetaLoader} from '../../physics/RUBE/RubeMetaLoader';
import {customPropsArrayToMap, rubeToXY, customPropsMapToArray} from '../../physics/RUBE/rubeTransformers';
import {sanitizeRubeFile} from '../../physics/RUBE/sanitizeRubeFile';
import {EditorItemTracker} from './ItemTracker';

export class EditorObject implements BaseEditorItem {
  readonly id: string;
  readonly type = 'object';
  readonly items: EditorItems;
  readonly signal: Accessor<EditorObject>;
  private readonly setSignal: Setter<EditorObject>;

  constructor(private loader: RubeMetaLoader, public meta: MetaObject, public parent?: EditorObject) {
    this.id = pseudoRandomId();
    const fileName = meta.file.split('/').reverse()[0];
    if (!this.loader.scene.cache.binary.has(fileName)) throw new Error(`RUBE file "${fileName}" not found in the cache`);
    const buffer = this.loader.scene.cache.binary.get(fileName);
    const encoded = arrayBufferToString(buffer);
    let rubeFile = rubeFileSerializer.decode(encoded);
    rubeFile = sanitizeRubeFile(rubeFile);
    this.items = loader.load(rubeFile, this);

    const [signal, setSignal] = createSignal<EditorObject>(this, {equals: false});
    this.signal = signal;
    this.setSignal = setSignal;
  }

  getCustomProps() {
    return customPropsArrayToMap(this.meta.customProperties);
  }

  getName() {
    return this.meta.name || '';
  }

  getPosition() {
    return rubeToXY(this.meta.position);
  }

  getAngle() {
    return -this.meta.angle || 0;
  }

  getBounds() {
    // TODO get actual bounds from the items
    //  get through all the items and get the bounds
    //  Then merge the bounds into one
    const position = rubeToXY(this.meta.position);
    return {x: position.x, y: position.y, width: 1, height: 1};
  }

  setCustomProps(props: RubeCustomPropsMap) {
    this.meta.customProperties = customPropsMapToArray(props);
    EditorItemTracker.trackChange(this);
  }

  setName(name: string) {
    this.meta.name = name;
    this.signalUpdate();
  }

  setPosition(position: XY) {
    // IMPORTANT: The Y axis is inverted here as rubeToXY will change it back to the correct orientation for phaser
    // TODO maybe consider adding a XYToRube to make it explicit that we're changing the orientation
    this.meta.position = {x: position.x, y: -position.y};
    this.signalUpdate();
  }

  setAngle(angle: number) {
    this.meta.angle = -angle;
    this.signalUpdate();
  }

  private signalUpdate() {
    this.setSignal(this as EditorObject);
    EditorItemTracker.trackChange(this);
  }
}

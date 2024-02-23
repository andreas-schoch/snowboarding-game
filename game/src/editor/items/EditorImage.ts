
import {Accessor, Setter, createSignal} from 'solid-js';
import {EditorInfo} from '../../EditorInfo';
import {XY} from '../../Terrain';
import {pseudoRandomId} from '../../helpers/pseudoRandomId';
import {customPropsArrayToMap, rubeToXY, customPropsMapToArray} from '../../helpers/rubeTransformers';
import {RubeCustomPropsMap} from '../../physics/RUBE/EntityTypes';
import {MetaImage} from '../../physics/RUBE/RubeFile';
import {BaseEditorItem, RubeMetaLoader} from '../../physics/RUBE/RubeMetaLoader';

export class EditorImage implements BaseEditorItem {
  readonly id: string;
  readonly type = 'image';

  readonly signal: Accessor<EditorImage>;
  private readonly setSignal: Setter<EditorImage>;

  constructor(private loader: RubeMetaLoader, public meta: MetaImage) {
    this.id = pseudoRandomId();
    const [signal, setSignal] = createSignal<EditorImage>(this, {equals: false});
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
    return rubeToXY(this.meta.center);
  }

  getAngle() {
    return -(this.meta.angle || 0);
  }

  getDepth() {
    return this.meta.renderOrder || 0;
  }

  getBounds() {
    const center = rubeToXY(this.meta.center);
    const height = this.meta.scale;
    const width = height * this.meta.aspectScale;
    return {x: center.x - width / 2,y: center.y - height / 2,width,height};
  }

  setCustomProps(props: RubeCustomPropsMap) {
    this.meta.customProperties = customPropsMapToArray(props);
    this.signalUpdate();
  }

  setName(name: string) {
    this.meta.name = name;
    this.signalUpdate();
  }

  setPosition(position: XY) {
    // IMPORTANT: The Y axis is inverted here as rubeToXY will change it back to the correct orientation for phaser
    // TODO maybe consider adding a XYToRube to make it explicit that we're changing the orientation
    this.meta.center = {x: position.x, y: -position.y};
    this.signalUpdate();
  }

  setAngle(angle: number) {
    this.meta.angle = -angle;
    this.signalUpdate();
  }

  setDepth(depth: number) {
    this.meta.renderOrder = depth;
    this.signalUpdate();
  }

  private signalUpdate() {
    this.setSignal(this as EditorImage);
    EditorInfo.observer.emit('editor_scene_changed', this);
  }
}

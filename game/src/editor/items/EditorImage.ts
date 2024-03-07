
import {Accessor, Setter, createSignal} from 'solid-js';
import {XY} from '../../Terrain';
import {pseudoRandomId} from '../../helpers/pseudoRandomId';
import {RubeCustomPropsMap} from '../../physics/RUBE/EntityTypes';
import {MetaBody, MetaImage} from '../../physics/RUBE/RubeFile';
import {BaseEditorItem} from '../../physics/RUBE/RubeMetaLoader';
import {customPropsArrayToMap, rubeToXY, customPropsMapToArray} from '../../physics/RUBE/rubeTransformers';
import {EditorObject} from './EditorObject';
import {EditorItemTracker} from './ItemTracker';

export class EditorImage implements BaseEditorItem {
  readonly id: string;
  readonly type = 'image';

  readonly signal: Accessor<EditorImage>;
  private readonly setSignal: Setter<EditorImage>;

  constructor(public meta: MetaImage, public metaBody?: MetaBody, public parent?: EditorObject) {
    this.id = pseudoRandomId();
    const [signal, setSignal] = createSignal<EditorImage>(this, {equals: false});
    this.signal = signal;
    this.setSignal = setSignal;
  }

  getCustomProps() {
    return customPropsArrayToMap(this.meta.customProperties);
  }

  getBodyCustomProps(): RubeCustomPropsMap | undefined {
    if (!this.metaBody) return;
    return customPropsArrayToMap(this.metaBody.customProperties);
  }

  getName() {
    return this.meta.name || '';
  }

  getPosition() {
    const offsetBody = this.metaBody ? rubeToXY(this.metaBody.position) : {x: 0, y: 0};
    const center = rubeToXY(this.meta.center);
    return {x: center.x + offsetBody.x, y: center.y + offsetBody.y};
  }

  getAngle() {
    const bodyAngle = this.metaBody ? -(this.metaBody.angle || 0) : 0;
    return -(this.meta.angle || 0) + bodyAngle;
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
    EditorItemTracker.trackChange(this);
  }
}

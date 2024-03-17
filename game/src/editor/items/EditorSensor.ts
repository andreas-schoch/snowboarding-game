
import {Accessor, Setter, createSignal} from 'solid-js';
import {pseudoRandomId} from '../../helpers/pseudoRandomId';
import {RubeCustomPropsMap} from '../../physics/RUBE/EntityTypes';
import {MetaBody} from '../../physics/RUBE/RubeFile';
import {BaseEditorItem, Bounds} from '../../physics/RUBE/RubeMetaLoader';
import {customPropsArrayToMap, rubeToXY, customPropsMapToArray} from '../../physics/RUBE/rubeTransformers';
import {EditorObject} from './EditorObject';
import {EditorItemTracker} from './ItemTracker';

export class EditorSensor implements BaseEditorItem {
  readonly id: string;
  readonly type: 'sensor';

  readonly signal: Accessor<EditorSensor>;
  private readonly setSignal: Setter<EditorSensor>;

  constructor(public meta: MetaBody, public sensorType: 'level_finish' | 'level_deathzone' | 'pickup_present', public parent?: EditorObject) {
    this.id = pseudoRandomId();
    this.meta = meta;
    this.sensorType = sensorType;
    const [signal, setSignal] = createSignal<EditorSensor>(this, {equals: false});
    this.signal = signal;
    this.setSignal = setSignal;
  }

  getCustomProps() {
    const fixture = this.meta.fixture?.[0];
    if (!fixture) throw new Error('No fixture found in the sensor body');
    return customPropsArrayToMap(fixture.customProperties);
  }

  getName() {
    return this.meta.name || '';
  }

  getPosition() {
    return rubeToXY(this.meta.position);
  }

  getAngle() {
    return this.meta.angle || 0;
  }

  getBounds(): Bounds {
    // TODO get width from fixture (or fixtures if multiple allowed per sensor bod)
    const position = rubeToXY(this.meta.position);
    return {x: position.x, y: position.y, width: 1, height: 1};
  }

  setCustomProps(props: RubeCustomPropsMap) {
    const fixture = this.meta.fixture?.[0];
    if (!fixture) throw new Error('No fixture found in the sensor body');
    fixture.customProperties = customPropsMapToArray(props);
  }

  setName(name: string) {
    this.meta.name = name;
    this.signalUpdate();
  }

  setPosition(x: number, y: number) {
    this.meta.position = {x, y};
    this.signalUpdate();
  }

  setAngle(angle: number) {
    this.meta.angle = angle;
    this.signalUpdate();
  }

  delete() {
    EditorItemTracker.delete(this);
  }

  restore() {
    EditorItemTracker.restore(this);
  }

  private signalUpdate() {
    this.setSignal(this as EditorSensor);
    EditorItemTracker.trackChange(this);
  }
}

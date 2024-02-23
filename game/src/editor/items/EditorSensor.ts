
import {Accessor, Setter, createSignal} from 'solid-js';
import {EditorInfo} from '../../EditorInfo';
import {XY} from '../../Terrain';
import {pseudoRandomId} from '../../helpers/pseudoRandomId';
import {customPropsArrayToMap, rubeToXY, customPropsMapToArray} from '../../helpers/rubeTransformers';
import {RubeCustomPropsMap} from '../../physics/RUBE/EntityTypes';
import {MetaBody} from '../../physics/RUBE/RubeFile';
import {BaseEditorItem, Bounds, RubeMetaLoader} from '../../physics/RUBE/RubeMetaLoader';

export class EditorSensor implements BaseEditorItem {
  readonly id: string;
  readonly type: 'sensor';

  readonly signal: Accessor<EditorSensor>;
  private readonly setSignal: Setter<EditorSensor>;

  constructor(private loader: RubeMetaLoader, public meta: MetaBody, public sensorType: 'level_finish' | 'level_deathzone' | 'pickup_present') {
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

  setPosition(position: XY) {
    this.meta.position = {x: position.x, y: position.y};
    this.signalUpdate();
  }

  setAngle(angle: number) {
    this.meta.angle = angle;
    this.signalUpdate();
  }

  private signalUpdate() {
    this.setSignal(this as EditorSensor);
    EditorInfo.observer.emit('editor_scene_changed', this);
  }
}

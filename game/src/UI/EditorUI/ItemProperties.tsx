import './ItemProperties.css';
import {Component, Show} from 'solid-js';
import {EditorItem} from '../../physics/RUBE/RubeMetaLoader';
import {Pane} from './BasePane';
import {DraggableInput} from './DraggableInput';

export const ItemProperties: Component<{selected: EditorItem | null}> = props => <>
  <Pane title="Item Properties" class="w-[250px] right-2 bottom-2">
    <Show when={props.selected} fallback={<div class="p-4">Nothing selected</div>}>

      <i class="scene-item-type-icon material-icons">window</i>
      <form action="" id="form-properties">
        {/* <!-- NAME --> */}
        <div class="row">
          <div class="col col-5">Name</div>
          <div class="col col-7">
            <input type="text" class="form-control form-text-input text-black" id="property-name" placeholder="enter body name" value={props.selected?.meta.name} />
          </div>
        </div>
        {/* <!-- POSITION --> */}
        <div class="row mb-0">
          <div class="col col-5">Pos X</div>
          <div class="col col-7">
            <DraggableInput id={'property-position-x'} min={0} max={100} step={0.1} value={0} class="!border-l-8 !border-green-600" />
          </div>
        </div>
        <div class="row">
          <div class="col col-5">Pos Y</div>
          <div class="col col-7">
            <DraggableInput id="property-position-y" min={0} max={100} step={0.1} value={0} class="!border-l-8 !border-red-600" />
          </div>
        </div>
        {/* <!-- ANGLE --> */}
        <div class="row">
          <div class="col col-5">Angle</div>
          <div class="col col-7">
            <DraggableInput id="property-angle" min={0} max={6.28318531} step={0.1} value={0} class="" />
          </div>
        </div>
      </form>
    </Show>
  </Pane>
</>;

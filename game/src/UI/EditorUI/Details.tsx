import './Details.css';
import {Component, Show} from 'solid-js';
import {EditorImage} from '../../editor/items/EditorImage';
import {selected} from '../../editor/items/ItemTracker';
import {DraggableInput} from './DraggableInput';
import {Pane, ResizeProps} from './Pane';

const MAX_METERS_FROM_ZERO = 512;
// TODO add UI to change step sizes for translate and rotate like in UE4

export const Details: Component<ResizeProps> = props => {

  const onPositionXChange = (newX: number) => {
    const item = selected();
    if (!item) throw new Error('It should never be possible to update X when nothing is selected');
    item.setPosition({x: newX, y: item.getPosition().y});
  };

  const onPositionYChange = (newY: number) => {
    const item = selected();
    if (!item) throw new Error('It should never be possible to update Y when nothing is selected');
    item.setPosition({x: item.getPosition().x, y: newY});
  };

  const onAngleChange = (newAngle: number) => {
    const item = selected();
    if (!item) throw new Error('It should never be possible to update angle when nothing is selected');
    item.setAngle(newAngle);
  };

  const onDepthChange = (newDepth: number) => {
    const item = selected();
    if (!item) throw new Error('It should never be possible to update depth when nothing is selected');
    if (item.type !== 'image') throw new Error('It should never be possible to update depth when the selected item is not an image');
    item.setDepth(newDepth);
  };

  const onNameChange = (e: Event) => {
    const item = selected();
    if (!item) throw new Error('It should never be possible to update name when nothing is selected');
    const target = e.target as HTMLInputElement;
    item.setName(target.value);
  };

  return <>
    <Pane title="Details" class="" {...props}>
      <Show when={selected()} fallback={<div class="p-4">Nothing selected</div>}>

        <i class="material-icons">window</i>
        <form action="" id="form-properties">
          {/* <!-- NAME --> */}
          <div class="row">
            <div class="col col-5">Name</div>
            <div class="col col-7">
              <input
                type="text"
                class="form-text-input text-black"
                id="property-name"
                placeholder="enter body name"
                value={selected()!.signal().getName()}
                onInput={onNameChange}
              />
            </div>
          </div>
          {/* <!-- POSITION --> */}
          <div class="row mb-0">
            <div class="col col-5">Pos X</div>
            <div class="col col-7">
              <DraggableInput
                id={'property-position-x'}
                min={-MAX_METERS_FROM_ZERO}
                max={MAX_METERS_FROM_ZERO}
                step={0.1}
                value={(selected()!).signal().getPosition().x}
                onChange={onPositionXChange}
                class="!border-l-8 !border-green-600"
              />
            </div>
          </div>
          <div class="row">
            <div class="col col-5">Pos Y</div>
            <div class="col col-7">
              <DraggableInput
                id="property-position-y"
                min={-MAX_METERS_FROM_ZERO}
                max={MAX_METERS_FROM_ZERO}
                step={0.1}
                value={(selected()!).signal().getPosition().y}
                onChange={onPositionYChange}
                class="!border-l-8 !border-red-600"
              />
            </div>
          </div>
          {/* <!-- ANGLE --> */}
          <div class="row">
            <div class="col col-5">Angle</div>
            <div class="col col-7">
              <DraggableInput
                id="property-angle"
                min={Math.PI * -2}
                max={Math.PI * 2}
                step={0.01}
                value={selected()!.signal().getAngle()} // TODO is .signal still needed?
                onChange={onAngleChange}
                class=""
              />
            </div>
          </div>

          <Show when={selected()?.type === 'image'}>
            {/* <!-- Depth --> */}
            <div class="row">
              <div class="col col-5">Depth</div>
              <div class="col col-7">
                <DraggableInput
                  id="property-depth"
                  min={-1000}
                  max={1000}
                  step={1}
                  value={(selected() as EditorImage).signal().getDepth()}
                  onChange={onDepthChange}
                  class=""
                />
              </div>
            </div>
          </Show>

        </form>
      </Show>
    </Pane>
  </>;
};

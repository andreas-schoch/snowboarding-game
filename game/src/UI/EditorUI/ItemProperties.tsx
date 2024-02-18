import './ItemProperties.css';
import {Component, Show, splitProps} from 'solid-js';
import {EditorImage, EditorItem} from '../../physics/RUBE/RubeMetaLoader';
import {DraggableInput} from './DraggableInput';
import {Pane, ResizeProps} from './Pane';

export const ItemProperties: Component<{selected: EditorItem | null, updateSelected: (updated: EditorItem) => void} & ResizeProps> = props => {
  const [localProps, resizeProps] = splitProps(props, ['selected', 'updateSelected']);
  const name = () => localProps.selected?.meta.name || '';
  const positionX = () => localProps.selected?.position.x || 0;
  const positionY = () => localProps.selected?.position.y || 0;
  const angle = () => localProps.selected?.angle || 0;

  const onPositionXChange = (newX: number) => {
    if (!localProps.selected) throw new Error('It should never be possible to update X when nothing is selected');
    const updated = {...localProps.selected, position: {x: newX, y: localProps.selected.position.y}};
    localProps.updateSelected(updated);
  };
  const onPositionYChange = (newY: number) => {
    if (!localProps.selected) throw new Error('It should never be possible to update Y when nothing is selected');
    const updated = {...localProps.selected, position: {x: localProps.selected.position.x, y: newY}};
    localProps.updateSelected(updated);
  };
  const onAngleChange = (newAngle: number) => {
    if (!localProps.selected) throw new Error('It should never be possible to update angle when nothing is selected');
    const updated = {...localProps.selected, angle: newAngle};
    localProps.updateSelected(updated);
  };

  const onDepthChange = (newDepth: number) => {
    if (!localProps.selected) throw new Error('It should never be possible to update depth when nothing is selected');
    if (localProps.selected.type !== 'image') throw new Error('It should never be possible to update depth when the selected item is not an image');
    const updated: EditorImage = {...localProps.selected, depth: newDepth};
    localProps.updateSelected(updated);
  };

  return <>
    <Pane title="Item Properties" class="" {...resizeProps}>
      <Show when={localProps.selected} fallback={<div class="p-4">Nothing selected</div>}>

        <i class="scene-item-type-icon material-icons">window</i>
        <form action="" id="form-properties">
          {/* <!-- NAME --> */}
          <div class="row">
            <div class="col col-5">Name</div>
            <div class="col col-7">
              <input type="text" class="form-control form-text-input text-black" id="property-name" placeholder="enter body name" value={name()} />
            </div>
          </div>
          {/* <!-- POSITION --> */}
          <div class="row mb-0">
            <div class="col col-5">Pos X</div>
            <div class="col col-7">
              <DraggableInput
                id={'property-position-x'}
                min={0}
                max={100}
                step={0.1}
                value={positionX()}
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
                min={0}
                max={100}
                step={0.1}
                value={positionY()}
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
                min={0}
                max={6.28318531}
                step={1}
                value={angle()}
                onChange={onAngleChange}
                class=""
              />
            </div>
          </div>

          <Show when={localProps.selected?.type === 'image'}>
            {/* <!-- Depth --> */}
            <div class="row">
              <div class="col col-5">Depth</div>
              <div class="col col-7">
                <DraggableInput
                  id="property-depth"
                  min={-1000}
                  max={1000}
                  step={1}
                  value={1}
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

import './DraggableInput.css';
import {Component, onCleanup} from 'solid-js';

const noop = () => {};
export const DraggableInput: Component<{id: string, min: number, max: number, step: number, value: number, class: string, onChange: (val: number) => void}> = props => {
  let inputRef: HTMLInputElement;
  const displayValue = () => Number.isInteger(props.step) ? props.value : props.value.toFixed(3);
  let cleanupMove: () => void = () => noop;

  const onMouseDown = () => {
    document.body.requestPointerLock();
    const onMouseMove = (e: MouseEvent) => {
      const newValue = Number(inputRef.value) + (e.movementX * props.step);
      const clamped = Math.max(props.min, Math.min(props.max, newValue));
      props.onChange(clamped);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.exitPointerLock();
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // eslint-disable-next-line solid/reactivity
    cleanupMove = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  };

  onCleanup(() => {
    cleanupMove();
  });

  return (
    <input
      ref={el => inputRef = el}
      id={props.id}
      aria-label='Value'
      type="number"
      class={'text-black ' + props.class}
      classList={{'value-input': true}}
      value={displayValue()}
      onChange={(e) => props.onChange(Number(e.target.value))}
      onMouseDown={() => onMouseDown()}
    />
  );
};

// function calculatePercentage() {
//   if (min() === undefined || max() === undefined) return 0;
//   return ((parseFloat(value()) - min()) / (max() - min())) * 100;
// }

import './DraggableInput.css';
import {Component, onCleanup} from 'solid-js';

const noop = () => {};
export const DraggableInput: Component<{id: string, min: number, max: number, step: number, value: number, class: string, onChange: (val: number, valStart: number, isFinal: boolean) => void}> = props => {
  let inputRef: HTMLInputElement;
  const displayValue = () => Number.isInteger(props.step) ? props.value : props.value.toFixed(3);
  let cleanupMove: () => void = () => noop;

  const startValue = () => Number(props.value);

  const onMouseDown = () => {
    let didMove = false;
    const startValue = Number(inputRef.value);
    document.body.requestPointerLock();

    const onMouseMove = (e: MouseEvent) => {
      didMove = true;
      const newValue = Number(inputRef.value) + (e.movementX * props.step);
      const clamped = Math.max(props.min, Math.min(props.max, newValue));
      props.onChange(clamped, startValue, false);
    };

    const onMouseUp = (e: MouseEvent) => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.exitPointerLock();

      if (didMove) {
        const newValue = Number(inputRef.value) + (e.movementX * props.step);
        const clamped = Math.max(props.min, Math.min(props.max, newValue));
        props.onChange(clamped, startValue, true);
      }
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
      onChange={(e) => props.onChange(Number(e.target.value), startValue(), true)}
      onMouseDown={() => onMouseDown()}
    />
  );
};

// function calculatePercentage() {
//   if (min() === undefined || max() === undefined) return 0;
//   return ((parseFloat(value()) - min()) / (max() - min())) * 100;
// }

import './DraggableInput.css';
import {Component, createSignal, onCleanup} from 'solid-js';

export const DraggableInput: Component<{id: string, min: number, max: number, step: number, value: number, class: string}> = (props) => {
  let inputRef: HTMLInputElement;
  const [value, setValue] = createSignal(0);

  const onMouseDown = () => {
    document.body.requestPointerLock();
    const onMouseMove = (e: MouseEvent) => {
      const newValue = Number(inputRef.value) + (e.movementX * props.step);
      const clamped = Math.max(props.min, Math.min(props.max, newValue));
      inputRef.value = clamped.toFixed(3).toString();
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.exitPointerLock();
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    onCleanup(() => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    });
  };

  return (
    <input
      ref={el => inputRef = el}
      id={props.id}
      aria-label='Value'
      type="number"
      class={'text-black ' + props.class}
      classList={{'value-input': true}}
      // value={value()}
      // onInput={(e) => setValue(Number(e.target.value))}
      onMouseDown={() => onMouseDown()}
    />
  );
};

// function calculatePercentage() {
//   if (min() === undefined || max() === undefined) return 0;
//   return ((parseFloat(value()) - min()) / (max() - min())) * 100;
// }

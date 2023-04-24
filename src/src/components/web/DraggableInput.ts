export class DraggableInput extends HTMLElement {
  readonly valueInput: HTMLInputElement;
  private boundOnMouseMove = this.onMouseMove.bind(this);
  private boundOnMouseUp = this.onMouseUp.bind(this);
  private readonly valueChangeEvent: Event;


  static get observedAttributes() {
    return ['value', 'step', 'min', 'max', 'id', 'class'];
  }


  constructor() {
    super();
    // const shadow = this.attachShadow({mode: 'open'});
    const styleEl = document.createElement('style');
    styleEl.innerHTML = style;

    this.valueInput = document.createElement('input');
    this.valueInput.classList.add('value-input');
    this.valueInput.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.valueInput.addEventListener('change', () => this.dispatchEvent(this.valueChangeEvent));
    this.appendChild(styleEl);
    this.appendChild(this.valueInput);
    this.valueChangeEvent = new Event('change');
  }

  // While this looks like it is unused, it is a lifecycle method that is called by the browser.
  // This component could've extended <input> but for future extensibility, I made it a custom element.
  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    this.valueInput.setAttribute(name, newValue);
  }

  private onMouseDown(e: MouseEvent): void {
    document.body.requestPointerLock();
    document.addEventListener('mousemove', this.boundOnMouseMove);
    document.addEventListener('mouseup', this.boundOnMouseUp);
  }

  private onMouseMove(e: MouseEvent): void {
    const newValue = Number(this.valueInput.value) + (e.movementX * 0.03);
    const min = this.valueInput.min === '' ? undefined : Number(this.valueInput.min);
    const max = this.valueInput.max === '' ? undefined : Number(this.valueInput.max);

    if (min !== undefined && !isNaN(min) && newValue < min) this.valueInput.value = String(min);
    else if (max !== undefined && !isNaN(max) && newValue > max) this.valueInput.value = String(max);
    else this.valueInput.value = String(newValue.toFixed(4));

    this.dispatchEvent(this.valueChangeEvent);
    if (min === undefined || max === undefined) return;
    const percentage = ((parseFloat(this.valueInput.value) - min) / (max - min)) * 100;
    this.valueInput.style.backgroundImage = `linear-gradient(to right, var(--grey-600) 0%, var(--grey-600) ${percentage}%, transparent ${percentage}%, transparent 100%)`;
  }

  private onMouseUp(): void {
    document.removeEventListener('mousemove', this.boundOnMouseMove);
    document.removeEventListener('mouseup', this.boundOnMouseUp);
    document.exitPointerLock();
  }
}

const style = `
  <style>
    :host {
      display: inline-block;
      width: 100%;
    }
    .value-input {
      border: 1px solid var(--grey-600);
      box-sizing: border-box;
      border-radius: 4px;
      padding: 5px 6px;
      width: 100%;
      height: 24px;
      outline: none;
      font-size: 14px;
      line-height: initial;
      margin: 5px 0;             
      transition: all 0.1s;
    }
    .value-input:not(textarea) {
      text-overflow: ellipsis;
    }
    .value-input:hover {
      border: 1px solid var(--grey-700);
      cursor: ew-resize;
    }
    .value-input:focus {
      padding-left: 5px; /* make it -1px than it was to prevent text wiggling left/right when border-width changes */
      border: 2px solid var(--blue-900);
    }
    .value-input::-webkit-outer-spin-button,
    .value-input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    .value-input:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      background-color: red;          
      width: 10px;
      height: 10px; 
    }
  </style>
`;

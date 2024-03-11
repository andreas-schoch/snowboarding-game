import {DEFAULT_WIDTH} from '..';
import {PersistedStore} from '../PersistedStore';
import {selected, setActiveDialogName} from '../UI/EditorUI/globalSignals';
import {Commander} from '../editor/command/Commander';
import {throttle} from '../helpers/debounce';
import {EditorScene} from '../scenes/EditorScene';

export class EditorController {
  controls: Phaser.Cameras.Controls.SmoothedKeyControl;
  resolutionMod: number;

  private keyBindings: Map<string, (e: KeyboardEvent) => void> = new Map();

  constructor(private scene: EditorScene) {
    this.initCameraAndInput();
    this.initKeyboardShortcuts();
  }

  update(time: number, delta: number) {
    this.scaleControlsSpeed();
    this.controls.update(delta);
  }

  private initCameraAndInput() {
    const camera = this.scene.cameras.main;
    this.resolutionMod = camera.width / DEFAULT_WIDTH;
    camera.setZoom(PersistedStore.defaultZoom() * this.resolutionMod);
    camera.setBackgroundColor(0x333333);
    camera.centerOnX(0);
    camera.centerOnY(0);

    const keyboard = this.scene.input.keyboard;
    if (!keyboard) throw new Error('cursors is null');
    this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl({
      camera,
      up: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      down: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      zoomIn: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
      zoomOut: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      acceleration: 10,
      drag: 0.1,
      maxSpeed: 1,
      maxZoom: 4,
      minZoom: 0.015,
      zoomSpeed: 0.015,
    });
  }

  private initKeyboardShortcuts() {
    if (!this.scene.input.keyboard) throw new Error('keyboard is null');

    this.keyBindings.set('F1', () => setActiveDialogName('Help'));
    this.keyBindings.set('Control+p', () => console.log('Play'));
    this.keyBindings.set('Control+n', () => console.log('New'));
    this.keyBindings.set('Control+o', () => setActiveDialogName('Open Level'));
    this.keyBindings.set('Control+s', () => console.log('Save'));

    // TODO rendering/clear is skipped when undoing/redoing too fast. Fix that using maybe a render queue
    const undoThrottled = throttle(() => Commander.undo(), 150);
    const redoThrottled = throttle(() => Commander.redo(), 150);
    this.keyBindings.set('Control+z', () => undoThrottled());
    this.keyBindings.set('Control+Shift+Z', () => redoThrottled());
    this.keyBindings.set('Control+y', () => redoThrottled());

    this.keyBindings.set('Delete', () => {
      const item = selected();
      if (item) Commander.exec({type: 'delete', item});
    });

    this.scene.input.keyboard.on(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, (e: KeyboardEvent) => {
      const key = this.getKeyCombination(e);
      const action = this.keyBindings.get(key);
      if (action) {
        e.preventDefault();
        action(e);
      }
    });
  }

  private getKeyCombination(e: KeyboardEvent): string {
    // TODO make order of modifiers not matter
    const keys: string[] = [];
    if (e.ctrlKey) keys.push('Control');
    if (e.shiftKey) keys.push('Shift');
    if (e.altKey) keys.push('Alt');
    keys.push(e.key);
    return keys.join('+');
  }

  private scaleControlsSpeed() {
    const mod = 1 / this.scene.cameras.main.zoom;
    this.controls.maxSpeedX = mod;
    this.controls.maxSpeedY = mod;
    this.controls.dragX = 0.1 * mod;
    this.controls.dragY = 0.1 * mod;
  }
}

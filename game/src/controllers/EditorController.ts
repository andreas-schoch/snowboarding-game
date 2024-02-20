import {DEFAULT_WIDTH} from '..';
import {Settings} from '../Settings';
import {EditorScene} from '../scenes/EditorScene';

export class EditorController {
  controls: Phaser.Cameras.Controls.SmoothedKeyControl;
  resolutionMod: number;

  pointerX: number | null = null;
  pointerY: number | null = null;

  pointerCoordX: number | null = null;
  pointerCoordY: number;

  constructor(private scene: EditorScene) {
    this.setupCameraAndInput();
  }

  update(time: number, delta: number) {
    this.controls.update(delta);
  }

  private setupCameraAndInput() {
    const camera = this.scene.cameras.main;
    this.resolutionMod = camera.width / DEFAULT_WIDTH;
    camera.setZoom(Settings.defaultZoom() * this.resolutionMod);
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
      minZoom: 0.2, // whenever this is adjusted, BackdropGrid also needs to be adjusted for now 
      zoomSpeed: 0.02,
    });
  }
}

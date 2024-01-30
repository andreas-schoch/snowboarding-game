import {DEFAULT_WIDTH, SCENE_EDITOR} from '..';
import {Backdrop} from '../Backdrop';
import {Settings} from '../Settings';

export class EditorScene extends Phaser.Scene {
  observer: Phaser.Events.EventEmitter = new Phaser.Events.EventEmitter();
  controls!: Phaser.Cameras.Controls.SmoothedKeyControl;

  pointerX: number | null = null;
  pointerY: number | null = null;

  pointerCoordX: number | null = null;
  pointerCoordY: number;
  resolutionMod: number;

  private backdrop: Backdrop;

  constructor() {
    super({key: SCENE_EDITOR});
  }

  private create() {
    this.setupCameraAndInput();
    this.backdrop = new Backdrop(this);

    const g = this.add.graphics();
    g.lineStyle(5, 0x000000, 1);
    g.strokeRect(-1000, -1000, 2000, 2000);
  }

  update(time: number, delta: number) {
    this.controls.update(delta);
    this.backdrop.update();
  }

  private setupCameraAndInput() {
    // CAMERA STUFF
    const camera = this.cameras.main;
    this.resolutionMod = camera.width / DEFAULT_WIDTH;
    camera.setZoom(Settings.defaultZoom() * this.resolutionMod * 0.5);
    camera.setBackgroundColor(0x333333);
    camera.centerOnX(0);
    camera.centerOnY(0);
    // KEYBOARD STUFF
    const keyboard = this.input.keyboard;
    if (!keyboard) throw new Error('cursors is null');
    const keyW = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    const keyA = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    const keyS = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    const keyD = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl({
      camera,
      up: keyW,
      left: keyA,
      down: keyS,
      right: keyD,
      zoomIn: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
      zoomOut: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      acceleration: 15,
      drag: 0.1,
      maxSpeed: 5,
      maxZoom: 2,
      minZoom: 0.05,
      zoomSpeed: 0.05,
    });
  }
}

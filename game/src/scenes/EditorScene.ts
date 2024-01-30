import {DEFAULT_WIDTH, SCENE_EDITOR} from '..';
import {Backdrop} from '../Backdrop';
import {BackdropGrid} from '../BackdropGrid';
import {Settings} from '../Settings';
import { drawCoordZeroPoint } from '../helpers/drawCoordZeroPoint';
import {Physics} from '../physics/Physics';
import {RubeScene} from '../physics/RUBE/RubeLoaderInterfaces';

export class EditorScene extends Phaser.Scene {
  observer: Phaser.Events.EventEmitter = new Phaser.Events.EventEmitter();
  controls!: Phaser.Cameras.Controls.SmoothedKeyControl;

  pointerX: number | null = null;
  pointerY: number | null = null;

  pointerCoordX: number | null = null;
  pointerCoordY: number;
  resolutionMod: number;

  b2Physics: Physics;
  private backdrop: Backdrop;
  private backdropGrid: BackdropGrid;

  constructor() {
    super({key: SCENE_EDITOR});
  }

  private preload() {
    const character = Settings.selectedCharacter();
    this.load.json(character, `assets/levels/export/${character}.json`);
  }

  private create() {
    this.setupCameraAndInput();
    this.backdrop = new Backdrop(this);
    this.backdropGrid = new BackdropGrid(this);
    this.b2Physics = new Physics(this, {worldScale: 40, gravityX: 0, gravityY: -10});

    drawCoordZeroPoint(this);

    const rubeScene: RubeScene = this.cache.json.get(Settings.selectedCharacter());
    this.b2Physics.load(rubeScene, 0, 0);
  }

  update(time: number, delta: number) {
    this.controls.update(delta);
    this.backdrop.update();
    this.backdropGrid.update();
  }

  private setupCameraAndInput() {
    // CAMERA STUFF
    const camera = this.cameras.main;
    this.resolutionMod = camera.width / DEFAULT_WIDTH;
    camera.setZoom(Settings.defaultZoom() * this.resolutionMod);
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
      acceleration: 10,
      drag: 0.1,
      maxSpeed: 1,
      maxZoom: 2,
      minZoom: 0.3, // whenever this is adjusted, BackdropGrid also needs to be adjusted for now 
      zoomSpeed: 0.02,
    });
  }
}

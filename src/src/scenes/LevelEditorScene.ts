import * as Ph from 'phaser';
import * as Pl from '@box2d/core';
import Terrain from '../components/Terrain';
import {Physics} from '../components/Physics';
import {DEBUG, DEFAULT_WIDTH, DEFAULT_ZOOM, KEY_LEVEL_CURRENT, LevelKeys, SceneKeys, stats} from '../index';
import {Backdrop} from '../components/Backdrop';
import {getCurrentLevel} from '../util/getCurrentLevel';
import {setupCamera} from "../util/setupCamera";
import {DebugMouseJoint} from "../util/DebugMouseJoint";
import {Observer} from "../util/observer";

export default class LevelEditorScene extends Ph.Scene {
  private b2Physics: Physics;
  private backdrop: Backdrop;
  private isSimulating: boolean = true;
  private terrain: Terrain;
  private zoomModifier = 1;

  private debugKeyLeft: Phaser.Input.Keyboard.Key | undefined;
  private debugKeyRight: Phaser.Input.Keyboard.Key | undefined;
  private debugKeyUp: Phaser.Input.Keyboard.Key | undefined;
  private debugKeyDown: Phaser.Input.Keyboard.Key | undefined;
  private debugKeyZoomIn: Phaser.Input.Keyboard.Key | undefined;
  private debugKeyZoomOut: Phaser.Input.Keyboard.Key | undefined;

  constructor() {
    super({key: SceneKeys.LEVEL_EDITOR_SCENE});
  }

  private create() {
    setupCamera(this.cameras.main);
    // Ensure that listeners from previous runs are cleared. Otherwise, for a single emit it may call the listener multiple times depending on amount of game-over/replays
    Observer.init()
    this.backdrop = new Backdrop(this);
    this.b2Physics = new Physics(this, 40, new Pl.b2Vec2(0, -10));
    this.b2Physics.loadRubeScene(getCurrentLevel());
    this.terrain = new Terrain(this, this.b2Physics);

    this.scene.launch(SceneKeys.LEVEL_EDITOR_UI_SCENE, [this.b2Physics, this]);

    new DebugMouseJoint(this.input, this.b2Physics);
    this.debugKeyLeft = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.debugKeyRight = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.debugKeyUp = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.debugKeyDown = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.debugKeyZoomIn = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.debugKeyZoomOut = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  }

  update() {
    stats.begin();
    const delta = this.game.loop.delta / 1000;

    if (this.debugKeyLeft?.isDown) this.cameras.main.scrollX -= 700 * delta * (1 / this.zoomModifier);
    if (this.debugKeyRight?.isDown) this.cameras.main.scrollX += 700 * delta * (1 / this.zoomModifier);
    if (this.debugKeyUp?.isDown) this.cameras.main.scrollY -= 700 * delta * (1 / this.zoomModifier);
    if (this.debugKeyDown?.isDown) this.cameras.main.scrollY += 700 * delta * (1 / this.zoomModifier);

    // TODO deduplicate
    if (this.debugKeyZoomOut?.isDown) {
      this.zoomModifier = this.zoomModifier - (1.5 * delta);
      this.cameras.main.setZoom(this.zoomModifier * DEFAULT_ZOOM * (this.cameras.main.width / DEFAULT_WIDTH));
    }
    if (this.debugKeyZoomIn?.isDown) {
      this.zoomModifier = this.zoomModifier + (1.5 * delta);
      this.cameras.main.setZoom(this.zoomModifier * DEFAULT_ZOOM * (this.cameras.main.width / DEFAULT_WIDTH));
    }


    if (this.isSimulating) this.b2Physics.update(); // needs to happen before update of snowman otherwise b2Body.GetPosition() inaccurate
    this.backdrop.update();
    stats.end();
  }
}


// TODO ~~create side panel to list all current bodies, joints, fixtures or images in the scene kind of like in the RUBE editor~~
// TODO implement feature to change position and other parameters of a body, joint, image, fixture (in a "properties" sidepanel)
// TODO implement filter system to that side panel to only show bodies, joints, fixtures or images at once
// TODO visualize fixture outlines
// TODO visualize joint position and anchor-points
// TODO Add another sidepanel from where user can drag objects into the scene (obstacles, background decoration etc.)
//      For the beginning skip the draw-n-drop feature and create the same "cursor" system as in RUBE.
// TODO implement feature for users to select things by clicking on them in the scene (includes creation of "modes" press B, F, I, J same as in RUBE)
// TODO implement feature for users to create "prefabs" from currently selected objects
// TODO implement undo/redo using the command design pattern

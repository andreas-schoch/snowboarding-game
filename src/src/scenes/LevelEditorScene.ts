import * as Ph from 'phaser';
import * as Pl from '@box2d/core';
import Terrain from '../components/Terrain';
import {Physics} from '../components/Physics';
import {DEFAULT_WIDTH, DEFAULT_ZOOM, SceneKeys, stats} from '../index';
import {Backdrop} from '../components/Backdrop';
import {getCurrentLevel} from '../util/getCurrentLevel';
import {setupCamera} from "../util/setupCamera";
import {DebugMouseJoint} from "../util/DebugMouseJoint";
import {Observer} from "../util/observer";
import {drawCoordZeroPoint} from "../util/drawCoordZeroPoint";
import {RubeEntity} from "../util/RUBE/RubeLoaderInterfaces";

export default class LevelEditorScene extends Ph.Scene {
  context: 'body' | 'fixture' | 'joint' | 'image' = 'body';
  selectedEntity: RubeEntity | null;
  private b2Physics: Physics;
  private backdrop: Backdrop;
  private isSimulating: boolean = false;
  private terrain: Terrain;
  private zoomModifier = 1;

  private debugKeyLeft: Phaser.Input.Keyboard.Key | undefined;
  private debugKeyRight: Phaser.Input.Keyboard.Key | undefined;
  private debugKeyUp: Phaser.Input.Keyboard.Key | undefined;
  private debugKeyDown: Phaser.Input.Keyboard.Key | undefined;
  private debugKeyZoomIn: Phaser.Input.Keyboard.Key | undefined;
  private debugKeyZoomOut: Phaser.Input.Keyboard.Key | undefined;
  private keyPauseGame: Phaser.Input.Keyboard.Key | undefined;
  private debugDraw: Phaser.GameObjects.Graphics;

  constructor() {
    super({key: SceneKeys.LEVEL_EDITOR_SCENE});
  }

  private create() {
    this.debugDraw = this.add.graphics();

    drawCoordZeroPoint(this);
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
    this.keyPauseGame = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyPauseGame?.on('down', () => this.isSimulating = !this.isSimulating);
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
    this.b2Physics.updateBodyRepresentations();
    this.updateDebugDraw();
    this.strokeFixture(this.selectedEntity as Pl.b2Fixture, 2, 0x00ff00, 1000);
    stats.end();
  }

  private updateDebugDraw() {
    // iterate through all bodies and draw their shapes
    this.debugDraw.clear();
    for (let body = this.b2Physics.world.GetBodyList(); body; body = body.GetNext()) {
      for (let f: Pl.b2Fixture & RubeEntity | null = body.GetFixtureList(); f; f = f.GetNext()) {
        this.strokeFixture(f, 1, 0xffffff, 100);
      }
    }
  }

  private strokeFixture(fixture: Pl.b2Fixture & RubeEntity, width = 1,  color = 0xffffff, depth = 100) {
    if (!fixture || !fixture.GetShape) return;
    this.debugDraw.lineStyle(width, color, 1);
    this.debugDraw.setDepth(depth)
    const shape = fixture.GetShape();
    const type = shape.GetType();
    const body = fixture.GetBody();
    switch (type) {
      case Pl.b2ShapeType.e_circle: {
        const circle = shape as Pl.b2CircleShape;
        const pos = body.GetPosition().Clone().Add(circle.m_p.Clone().Rotate(body.GetAngle())).Scale(this.b2Physics.worldScale);
        this.debugDraw.strokeCircle(pos.x, -pos.y, circle.m_radius * this.b2Physics.worldScale);
        break;
      }
      case Pl.b2ShapeType.e_chain:
      case Pl.b2ShapeType.e_polygon: {
        const polygon = shape as Pl.b2PolygonShape;
        const bodyPos = body.GetPosition();
        const bodyAngle = body.GetAngle();
        const pxVerts = polygon.m_vertices
        .map(p => bodyPos.Clone().Add(new Pl.b2Vec2(p.x, p.y).Rotate(bodyAngle)).Scale(this.b2Physics.worldScale))
        .map(({x, y}) => ({x: x, y: -y}));
        this.debugDraw.strokePoints(pxVerts, type === Pl.b2ShapeType.e_polygon);
        break;
      }
      default:
        console.warn('Unknown shape type', shape.GetType());
    }
  }
}

// TODO implement filter system to that side panel to only show bodies, joints, fixtures or images at once
// TODO visualize joint position and anchor-points
// TODO Add another sidepanel from where user can drag objects into the scene (obstacles, background decoration etc.)
//      For the beginning skip the draw-n-drop feature and create the same "cursor" system as in RUBE.
// TODO implement feature for users to select things by clicking on them in the scene (includes creation of "modes" press B, F, I, J same as in RUBE)
// TODO implement feature for users to create "prefabs" from currently selected objects
// TODO implement undo/redo using the command design pattern

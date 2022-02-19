import * as Pl from '@box2d/core';
import {IBodyConfig, Physics} from './physics';
import GameScene from '../scenes/game.scene';
import {renderDepth} from '../index';


export class PhysicsTree {
  private readonly scene: GameScene;
  private readonly b2Physics: Physics;
  private readonly pos: Pl.b2Vec2 = new Pl.b2Vec2(0, 0);
  private enabled: boolean = false;

  // TODO write a loader to parse PhysicsEditor exports automatically. This takes way to long by hand
  private readonly segments: ITreeSegment[] = [
    {
      x: 0,
      y: 0,
      w: 64,
      h: 0,
      tw: 77,
      th: 45,
      weldConfig: {dampingRatio: 5, frequencyHz: 50, referenceAngle: -0.15},
      bodyConfig: {
        texture: 'atlas-foliage',
        textureKey: 'tree-segment-01.png',
        linearDamping: 0.5,
        angularDamping: 0.5,
        color: 0x555555,
        type: Pl.b2BodyType.b2_staticBody,
        friction: 0.7,
        depth: renderDepth.TREE_PHYSICS,
        density: 0.5,
      },
      anchorRight: {x: 64, y: -4},
      points: [
        {x: 3, y: 44},
        {x: 40, y: 32},
        {x: 69, y: 30},
        {x: 75.5, y: 22},
        {x: 76, y: 13.5},
        {x: 71, y: 6},
        {x: 59, y: 3},
        {x: 20, y: 1},
        {x: 10, y: 2},
        {x: 4, y: 5},
        {x: 1, y: 11},
      ],
    },
    {
      x: 64,
      y: -4,
      w: 64,
      h: 0,
      tw: 88,
      th: 29,
      weldConfig: {dampingRatio: 5, frequencyHz: 50, referenceAngle: -0.15},
      bodyConfig: {
        texture: 'atlas-foliage',
        textureKey: 'tree-segment-02.png',
        linearDamping: 0.5,
        angularDamping: 0.5,
        color: 0x555555,
        type: Pl.b2BodyType.b2_dynamicBody,
        friction: 0.7,
        depth: renderDepth.TREE_PHYSICS,
        density: 0.5,
      },
      anchorRight: {x: 128, y: 0},
      points: [
        {x: 10, y: 27.5},
        {x: 76, y: 28.5},
        {x: 86, y: 25},
        {x: 88, y: 17},
        {x: 85, y: 11},
        {x: 81.5, y: 8},
        {x: 15, y: 2},
        {x: 5, y: 2.5},
        {x: -0.5, y: 12},
        {x: 2.5, y: 23},
      ],
    },
    {
      x: 128,
      y: 0,
      w: 64,
      h: 0,
      tw: 84,
      th: 22,
      weldConfig: {dampingRatio: 5, frequencyHz: 40, referenceAngle: 0},
      bodyConfig: {
        texture: 'atlas-foliage',
        textureKey: 'tree-segment-03.png',
        linearDamping: 0.5,
        angularDamping: 0.5,
        color: 0x555555,
        type: Pl.b2BodyType.b2_dynamicBody,
        friction: 0.7,
        depth: renderDepth.TREE_PHYSICS,
        density: 0.5,
      },
      anchorRight: {x: 192, y: 0},
      points: [
        {x: 9, y: 21},
        {x: 75, y: 20},
        {x: 81, y: 17},
        {x: 84, y: 10},
        {x: 81, y: 3},
        {x: 74, y: 0},
        {x: 9, y: 0},
        {x: 3, y: 2},
        {x: -0.5, y: 9},
        {x: 2, y: 17.5},
      ],
    },
    {
      x: 192,
      y: 0,
      w: 64,
      h: 0,
      tw: 83,
      th: 21,
      weldConfig: {dampingRatio: 5, frequencyHz: 40, referenceAngle: 0},
      bodyConfig: {
        texture: 'atlas-foliage',
        textureKey: 'tree-segment-04.png',
        linearDamping: 0.5,
        angularDamping: 0.5,
        color: 0x555555,
        type: Pl.b2BodyType.b2_dynamicBody,
        friction: 0.7,
        depth: renderDepth.TREE_PHYSICS,
        density: 0.5,
      },
      anchorRight: {x: 256, y: 0},
      points: [
        {x: 7, y: 20},
        {x: 74, y: 20},
        {x: 80, y: 18},
        {x: 83, y: 11},
        {x: 80, y: 3.5},
        {x: 74, y: 2},
        {x: 9, y: 1},
        {x: 3, y: 3},
        {x: 0, y: 9},
        {x: 1, y: 17},
      ],
    },
    {
      x: 256,
      y: 0,
      w: 64,
      h: 0,
      tw: 80,
      th: 21,
      weldConfig: {dampingRatio: 5, frequencyHz: 40, referenceAngle: (Math.random() - 0.5) * 0.2},
      bodyConfig: {
        texture: 'atlas-foliage',
        textureKey: 'tree-segment-05.png',
        linearDamping: 0.5,
        angularDamping: 0.5,
        color: 0x555555,
        type: Pl.b2BodyType.b2_dynamicBody,
        friction: 0.7,
        depth: renderDepth.TREE_PHYSICS,
        density: 0.5,
      },
      anchorRight: {x: 320, y: -1},
      points: [
        {x: 7, y: 20},
        {x: 71, y: 18},
        {x: 77, y: 16},
        {x: 80, y: 10},
        {x: 78, y: 4},
        {x: 74, y: 2},
        {x: 7, y: 1},
        {x: 2, y: 3},
        {x: 0, y: 10},
        {x: 2, y: 17},
      ],
    },
    {
      x: 320,
      y: -1,
      w: 64,
      h: 0,
      tw: 79,
      th: 18,
      weldConfig: {dampingRatio: 5, frequencyHz: 35, referenceAngle: (Math.random() - 0.5) * 0.2},
      bodyConfig: {
        texture: 'atlas-foliage',
        textureKey: 'tree-segment-06.png',
        linearDamping: 0.5,
        angularDamping: 0.5,
        color: 0x555555,
        type: Pl.b2BodyType.b2_dynamicBody,
        friction: 0.7,
        depth: renderDepth.TREE_PHYSICS,
        density: 0.5,
      },
      anchorRight: {x: 384, y: 0},
      points: [
        {x: 5, y: 17.5},
        {x: 73, y: 17},
        {x: 77, y: 14},
        {x: 79, y: 10},
        {x: 77, y: 5},
        {x: 72, y: 3},
        {x: 9, y: 1},
        {x: 4, y: 2},
        {x: 0, y: 7},
        {x: 1, y: 14},
      ],
    },
    {
      x: 384,
      y: 0,
      w: 64,
      h: 0,
      tw: 75,
      th: 16,
      weldConfig: {dampingRatio: 5, frequencyHz: 35, referenceAngle: (Math.random() - 0.5) * 0.3},
      bodyConfig: {
        texture: 'atlas-foliage',
        textureKey: 'tree-segment-07.png',
        linearDamping: 0.5,
        angularDamping: 0.5,
        color: 0x555555,
        type: Pl.b2BodyType.b2_dynamicBody,
        friction: 0.7,
        depth: renderDepth.TREE_PHYSICS,
        density: 0.5,
      },
      anchorRight: {x: 448, y: 0},
      points: [
        {x: 6, y: 15.5},
        {x: 72, y: 15},
        {x: 75, y: 12},
        {x: 74, y: 8},
        {x: 71, y: 6},
        {x: 8, y: 1},
        {x: 2, y: 2},
        {x: 0, y: 7},
        {x: 1, y: 12.5},
      ],
    },
    {
      x: 448,
      y: 3,
      w: 64,
      h: 0,
      tw: 60,
      th: 10,
      weldConfig: {dampingRatio: 0.9, frequencyHz: 15, referenceAngle: 0},
      bodyConfig: {
        texture: 'atlas-foliage',
        textureKey: 'tree-segment-08.png',
        linearDamping: 0.5,
        angularDamping: 0.5,
        color: 0x555555,
        type: Pl.b2BodyType.b2_dynamicBody,
        friction: 0.7,
        depth: renderDepth.TREE_PHYSICS,
        density: 0.5,
      },
      points: [
        {x: 3, y: 9.5},
        {x: 58, y: 9},
        {x: 59, y: 6},
        {x: 4, y: 0},
        {x: 0, y: 1.5},
        {x: -0.5, y: 7},
      ],
    },
  ];

  constructor(scene: GameScene, physics: Physics, x: number = 600, y: number = 200) {
    this.scene = scene;
    this.b2Physics = physics;
    this.pos.Set(x, y);
    this.generateSegments();
  }

  setEnabled(enabled: boolean): PhysicsTree {
    this.enabled = enabled;
    this.segments.forEach(s => s.body && s.body.SetEnabled(enabled));
    return this;
  }

  moveTo(x: number, y: number): PhysicsTree {
    this.pos.Set(x, y);
    this.segments.forEach(s => s.body && s.body.SetTransformXY(
      (s.x + this.pos.x) / this.b2Physics.worldScale,
      (s.y + this.pos.y) / this.b2Physics.worldScale,
      0),
    );
    return this;
  }

  cleanup(outOfBoundsX: number) {
    if (this.enabled && this.pos.x < outOfBoundsX) this.setEnabled(false);
  }

  private generateSegments() {
    // create tree segment bodies...
    let first = true;
    for (const s of this.segments) {

      const chainPoints = s.points.map(p => ({x: (p.x - (s.tw / 2)) / this.b2Physics.worldScale, y: (p.y - (s.th / 2)) / this.b2Physics.worldScale}));

      s.body = this.b2Physics.createChain(
        s.x + this.pos.x,
        s.y + this.pos.y,
        {
          points: chainPoints.reverse(),
          texture: s.bodyConfig.texture,
          textureKey: s.bodyConfig.textureKey,
          type: 'physics-tree',
          depth: renderDepth.TREE_PHYSICS,
          angle: 0,
          isDynamic: !first,
        })[0];
      first = false;
    }

// ...weld them together
    for (let i = 0; i < this.segments.length - 1; i++) {
      const [segA, segB] = this.segments.slice(i, i + 2);
      if (!segA.anchorRight || !segA.weldConfig || !segA.body || !segB.body) continue;

      const anchor = new Pl.b2Vec2((segA.anchorRight.x + this.pos.x - 32) / this.b2Physics.worldScale, (segA.anchorRight.y + this.pos.y) / this.b2Physics.worldScale);

      // this.scene.add.graphics()
      // .fillStyle(0xffffff)
      // .fillPoint(anchor.x * this.b2Physics.worldScale, anchor.y * this.b2Physics.worldScale, 5).setDepth(700);

      const {dampingRatio, frequencyHz, referenceAngle} = segA.weldConfig;
      const jd = new Pl.b2WeldJointDef();
      jd.Initialize(segA.body, segB.body, anchor);
      jd.referenceAngle = referenceAngle;
      Pl.b2AngularStiffness(jd, frequencyHz, dampingRatio, jd.bodyA, jd.bodyB);
      this.b2Physics.world.CreateJoint(jd);
    }
  }
}


export interface ITreeSegment {
  x: number;
  y: number;
  w: number;
  h: number;

  tw: number;
  th: number;

  points: Pl.XY[];
  body?: Pl.b2Body;
  anchorRight?: Pl.XY;

  bodyConfig: IBodyConfig;
  weldConfig?: { dampingRatio: number, frequencyHz: number, referenceAngle: number };
}

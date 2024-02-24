import {RubeCustomProperty, RubeVectorArray,RubeVector} from './RubeFile';

// Typings corresponding to the R.U.B.E. JSON export format described here: https://www.iforce2d.net/rube/json-structure
export interface RubeScene {
  gravity: RubeVector;
  allowSleep: boolean;
  autoClearForces: boolean;
  positionIterations: number;
  velocityIterations: number;
  stepsPerSecond: number;
  warmStarting: boolean;
  continuousPhysics: boolean;
  subStepping: boolean,
  collisionbitplanes?: {names: string[]};
  customProperties?: RubeCustomProperty[];

  body?: RubeBody[];
  joint?: RubeJoint[];
  image?: RubeImage[];
  object?: RubeObject[];
}

export interface RubeBody {
  name?: string;
  active?: boolean; // Only present if false. Absence means true.
  awake?: boolean;
  bullet?: boolean;
  fixedRotation?: boolean; // Only present if true. Absence means false.
  sleepingAllowed?: boolean;
  type?: 0 | 1 | 2;
  position?: RubeVector;
  angle?: number; // radians
  angularDamping?: number;
  angularVelocity?: number; // radians per second
  linearDamping?: number;
  linearVelocity?: RubeVector;

  'massData-mass'?: number;
  'massData-center'?: RubeVector;
  'massData-I'?: number; // Inertia
  // Aliases for above since protobuf doesn't like hyphens.
  // The loader will look for both before using defaults
  massDataMass?: number;
  massDataCenter?: RubeVector;
  massDataI?: number;

  customProperties?: RubeCustomProperty[];
  fixture?: RubeFixture[]; // omitted when no fixtures
}

// May be turned into multiple fixtures in export.
// Afaik Rube uses poly2tri to triangulate polygons and box2d cannot have more than 8 vertices per polygon fixture.
export interface RubeFixture {
  name?: string;
  density?: number;

  'filter-categoryBits'?: number; // if not present; interpret as 1
  'filter-maskBits'?: number; // if not present; interpret as 65535
  'filter-groupIndex'?: number;
  // Aliases for above since protobuf doesn't like hyphens.
  // The loader will look for both before using defaults
  filterCategoryBits?: number;
  filterMaskBits?: number;
  filterGroupIndex?: number;

  friction?: number;
  restitution?: number;
  sensor?: boolean;
  customProperties?: RubeCustomProperty[];
  // A fixture object will only have ONE of the following shape objects
  circle?: RubeFixtureShapeCircle;
  polygon?: RubeFixtureShapePolygon;
  chain?: RubeFixtureShapeChain;
}

////////////////////////////////////////////////////////////////////////////

export interface RubeFixtureShapeCircle {
  center: RubeVector;
  radius: number;
}

export interface RubeFixtureShapePolygon {
  vertices: RubeVectorArray;
}

// also used for edge shapes TODO separate interface for loop and line
export interface RubeFixtureShapeChain {
  vertices: RubeVectorArray;
  // If the following properties are not present, the shape is an open-ended
  // chain shape. If they are present, the shape is a closed loop shape.
  hasNextVertex?: boolean;
  hasPrevVertex?: boolean;
  nextVertex?: RubeVector
  prevVertex?: RubeVector
}

////////////////////////////////////////////////////////////////////////////

export type RubeJoint = RubeJointRevolute | RubeJointDistance | RubeJointPrismatic | RubeJointWheel | RubeJointRope | RubeJointMotor | RubeJointWeld | RubeJointFriction;

export const enum RubeJointType {
  e_unknownJoint,
  e_revoluteJoint,
  e_prismaticJoint,
  e_distanceJoint,
  e_pulleyJoint,
  e_mouseJoint,
  e_gearJoint,
  e_wheelJoint,
  e_weldJoint,
  e_frictionJoint,
  e_ropeJoint,
  e_motorJoint
}

export interface RubeJointBase {
  type: 'revolute' | 'distance' | 'prismatic' | 'wheel' | 'rope' | 'motor' | 'weld' | 'friction';
  name: string;
  anchorA: RubeVector;
  anchorB: RubeVector;
  // zero-based index of body in bodies array
  bodyA: number;
  // zero-based index of body in bodies array
  bodyB: number;
  collideConnected?: boolean;
  customProperties?: RubeCustomProperty[]
}

export interface RubeJointRevolute extends RubeJointBase {
  type: 'revolute';
  enableLimit?: boolean;
  enableMotor?: boolean;
  jointSpeed?: number;
  lowerLimit?: number;
  upperLimit?: number;
  maxMotorTorque?: number;
  motorSpeed?: number;
  refAngle?: number;
}

export interface RubeJointDistance extends RubeJointBase {
  type: 'distance';
  dampingRatio?: number;
  frequency?: number;
  length?: number;
}

export interface RubeJointPrismatic extends RubeJointBase {
  type: 'prismatic';
  enableLimit?: boolean;
  enableMotor?: boolean;
  localAxisA?: RubeVector;
  lowerLimit?: number;
  upperLimit?: number;
  maxMotorForce?: number;
  motorSpeed?: number;
  refAngle?: number;
}

export interface RubeJointWheel extends RubeJointBase {
  type: 'wheel';
  enableMotor?: boolean;
  localAxisA?: RubeVector;
  maxMotorTorque?: number;
  motorSpeed?: number;
  springDampingRatio?: number;
  springFrequency?: number;
}

export interface RubeJointRope extends RubeJointBase {
  type: 'rope';
  maxLength?: number;
}

export interface RubeJointMotor extends RubeJointBase {
  // AnchorA is the 'linear offset', anchorB is ignored
  type: 'motor';
  maxForce?: number;
  maxTorque?: number;
  correctionFactor?: number;
}

export interface RubeJointWeld extends RubeJointBase {
  type: 'weld';
  refAngle?: number;
  dampingRatio?: number;
  frequency?: number;
}

export interface RubeJointFriction extends RubeJointBase {
  type: 'friction';
  maxForce?: number;
  maxTorque?: number;
}

////////////////////////////////////////////////////////////////////

export interface RubeImage {
  name: string;
  /** Between [0,1] */
  opacity: number;
  renderOrder: number;
  /** the length of the vertical side of the image in physics units (meters) */
  scale: number;
  /** the ratio of width to height; e.g. scale: 1 and aspecScale: 0.5 results in 0.5m width */
  aspectScale: number;
  /** angle in radians */
  angle: number;
  /** zero-based index of body in RubeScene.body array */
  body: number;
  /** center position in body local coordinates */
  center: RubeVector;
  /** Path to image. Absolute or relative to exported file (e.g. '../img/whatever.png') */
  file: string;
  /** true if the texture should be reversed horizontally */
  flip: boolean;
  customProperties?: RubeCustomProperty[];

  // Properties included in RUBE's JSON export but not relevant for this game
  // /** corner positions in body local coordinates */
  // corners: RubeVectorArray;
  // /** texture magnification filter; 0 = linear; 1 = nearest */
  // filter: 0 | 1;
  // /** RGBA values for color tint; Defaults to [255, 255, 255, 255] */
  // colorTint?: [number, number, number, number];
  // /** Indices for drawing GL_TRIANGLES with the glDrawElements function and the other glXXX properties below */
  // glDrawElements: number[];
  // /** Texture coordinates for use with glTexCoordPointer (the 'flip' property has already been taken into account) */
  // glTexCoordPointer: number[];
  // /** Vertex positions for use with glVertexPointer */
  // glVertexPointer: number[];
}

export interface RubeObject {
  //   "angle" : 4.396453380584717,
  //   "name" : "Cane",
  //   "position" : 
  //   {
  //     "x" : -11.78859138488770,
  //     "y" : 3.913610458374023
  //   },
  //   "scale" : 1
  angle: number;
  name: string;
  position: RubeVector;
  scale: number;
  customProperties?: RubeCustomProperty[];
}

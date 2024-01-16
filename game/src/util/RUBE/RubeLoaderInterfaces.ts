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
}

export interface RubeBody {
  name?: string;
  active?: boolean;
  awake?: boolean;
  bullet?: boolean;
  fixedRotation?: boolean;
  type?: 0 | 1 | 2;
  position?: RubeVector;
  angle?: number; // radians
  angularDamping?: number;
  angularVelocity?: number; // radians per second
  linearDamping?: number;
  linearVelocity?: RubeVector;
  'massData-mass'?: number;
  'massData-center'?: RubeVector;
  'massData-I'?: number; // Inertia?
  customProperties?: RubeCustomProperty[];
  fixture?: RubeFixture[];
}

export interface RubeFixture {
  name?: string;
  density?: number;
  // if not present; interpret as 1
  'filter-categoryBits'?: number;
  // if not present; interpret as 65535
  'filter-maskBits'?: number;
  'filter-groupIndex'?: number;
  friction?: number;
  restitution?: number;
  sensor?: boolean;
  customProperties?: RubeCustomProperty[]
  // A fixture object will only have ONE of the following shape objects
  circle?: RubeFixtureShapeCircle;
  polygon?: RubeFixtureShapePolygon;
  chain?: RubeFixtureShapeChain;
}

export type RubeCustomPropertyTypes = 'int' | 'float' | 'string' | 'color' | 'bool' | 'vec2';

// These will have a "name" property, and ONLY one other property depending on desired type as the value.
export interface RubeCustomProperty {
  name: string;
  int?: number;
  float?: number;
  string?: string;
  color?: string; // TODO verify format
  bool?: boolean;
  vec2?: RubeVector
}

// zero needs to be turned into { x: 0, y: 0 }
export type RubeVector = {x: number, y: number} | 0;

// Not sure why RUBE json export represents lists of vectors like this. Maybe an openGL thing?
export interface RubeVectorArray {
  x: number[];
  y: number[];
}

////////////////////////////////////////////////////////////////////////////

export interface RubeFixtureShapeCircle {
  center: RubeVector;
  radius: number;
}

export interface RubeFixtureShapePolygon {
  vertices: RubeVectorArray;
}

// also used for edge shapes
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

export const enumTypeToRubeJointType = {
  // [RubeJointType.e_unknownJoint]: 'unknown' as const,
  [RubeJointType.e_revoluteJoint]: 'revolute' as const,
  [RubeJointType.e_prismaticJoint]: 'prismatic' as const,
  [RubeJointType.e_distanceJoint]: 'distance' as const,
  // [RubeJointType.e_pulleyJoint]: 'pulley' as const,
  // [RubeJointType.e_mouseJoint]: 'mouse' as const,
  // [RubeJointType.e_gearJoint]: 'gear' as const,
  [RubeJointType.e_wheelJoint]: 'wheel' as const,
  [RubeJointType.e_weldJoint]: 'weld' as const,
  [RubeJointType.e_frictionJoint]: 'friction' as const,
  [RubeJointType.e_ropeJoint]: 'rope' as const,
  [RubeJointType.e_motorJoint]: 'motor' as const
};

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
  maxMotorTorque?: number;
  motorSpeed?: number;
  refAngle?: number;
  upperLimit?: number;
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
  maxMotorForce?: number;
  motorSpeed?: number;
  refAngle?: number;
  upperLimit?: number;
}

export interface RubeJointWheel extends RubeJointBase {
  type: 'wheel';
  enableMotor?: boolean;
  localAxisA?: RubeVector;
  maxMotorTorque?: number;
  motorSpeed?: number;
  springDampingRatio?: number;
  springFrequency?: number;
  // dampingRatio?: number; // TODO verify if available or if it is the springDampingRatio and springFrequency
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
  /** the length of the vertical side of the image in physics units */
  scale: number;
  /** the ratio of width to height; relative to the natural dimensions */
  aspectScale: number;
  /** angle in radians */
  angle: number;
  /** zero-based index of body in bodies array */
  body: number;
  /** center position in body local coordinates */
  center: RubeVector;
  /** corner positions in body local coordinates */
  corners: RubeVectorArray;
  /** Path to image. Absolute or relative to exported file (e.g. '../img/whatever.png') */
  file: string;
  /** texture magnification filter; 0 = linear; 1 = nearest */
  filter: 0 | 1;
  /** true if the texture should be reversed horizontally */
  flip: boolean;
  /** RGBA values for color tint; Defaults to [255, 255, 255, 255] */
  colorTint?: [number, number, number, number];
  /** Indices for drawing GL_TRIANGLES with the glDrawElements function and the other glXXX properties below */
  glDrawElements: number[];
  /** Texture coordinates for use with glTexCoordPointer (the 'flip' property has already been taken into account) */
  glTexCoordPointer: number[];
  /** Vertex positions for use with glVertexPointer */
  glVertexPointer: number[];
  customProperties?: RubeCustomProperty[];
}

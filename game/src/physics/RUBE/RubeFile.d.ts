
// Typings corresponding to the .rube file format of R.U.B.E. It is similar to the json export format described here: https://www.iforce2d.net/rube/json-structure
// There are 2 key differences between .rube files and the json export:
// - fixtures aren't triangulated in .rube files. So 1 MetaFixture may turn into multiple RubeFixtures (polygon fixture has a limit of 8 vertices in box2d I think)
// - Objects get inlined in the export. So MetaObject information won't be available in the export
export interface RubeFile {
  // collisionbitplanes: CollisionBitPlanes; // won't use
  customPropertyDefs: CustomPropertyDef[];
  metaworld: MetaWorld;
}

export interface CollisionBitPlanes {
  names: string[];
}

export interface CustomPropertyDef {
  class: 'world' | 'body' | 'fixture' | 'joint' | 'image' | 'object' | 'sampler';
  type: 'int' | 'float' | 'string' | 'bool' | 'vec2' | 'color';
  name: CustomPropertyDefNames; // CustomPropertyDefNames are the known names since we don't need to extend them dynamically
  displayName: CustomPropertyDefNames; // CustomPropertyDefNames are the known names since we don't need to extend them dynamically
  comboboxEntries?: ComboBoxEntry[];
}

export interface ComboBoxEntry {
  entry: string;
}

export interface MetaWorld {
  gravity: RubeVector;
  allowSleep: boolean;
  autoClearForces: boolean;
  positionIterations: number;
  velocityIterations: number;
  stepsPerSecond: number;
  warmStarting: boolean;
  continuousPhysics: boolean;
  subStepping: boolean;

  metabody?: MetaBody[]; // body in export
  metajoint?: MetaJointBase[]; // joint in export
  metaimage?: MetaImage[]; // image in export
  metaobject?: MetaObject[]; // Not in export, it get's inlined

  exportOptions: ExportOptions; // not in export
}

export interface ExportOptions {
  compactCommonFloats: boolean;
  compactZeroVecs: boolean;
  saveFullPathForImages: boolean;
  saveFullPathForSamplerOutput: boolean;
  saveImagePathsRelativeToRUBEFile: boolean;
  saveSamplerOutputPathsRelativeToRUBEFile: boolean;
  useGsonFormat: boolean;
  useHumanReadableFloats: boolean;
  usePrettyPrint: boolean;
}

export interface MetaBody {
  id: number; // not in export
  name: string;
  active?: boolean; // Only present if false. Absence means true.
  awake: boolean;
  bullet: boolean;
  fixedRotation?: boolean; // Only present if true. Absence means false.
  sleepingAllowed?: boolean;
  type: 'static' | 'dynamic' | 'kinematic'; // in export turned numeric same as enum
  position: RubeVector;
  angle: number;
  angularDamping: number;
  angularVelocity: number; // radians per second
  linearDamping: number;
  linearVelocity: RubeVector;

  'massData-mass'?: number;
  'massData-center'?: RubeVector;
  'massData-I'?: number; // Inertia
  // Aliases for above since protobuf doesn't like hyphens.
  // The loader will look for both before using defaults
  massDataMass?: number;
  massDataCenter?: RubeVector;
  massDataI?: number;

  customProperties?: RubeCustomProperty[];
  fixture?: MetaFixture[]; // omitted when no fixtures
}

export interface MetaFixture {
  id: number; // not in export
  name: string;
  density: number;
  'filter-categoryBits'?: number; // if not present; interpret as 1
  'filter-maskBits'?: number; // if not present; interpret as 65535
  'filter-groupIndex'?: number;
  // Aliases for above since protobuf doesn't like hyphens.
  // The loader will look for both before using defaults
  filterCategoryBits?: number;
  filterMaskBits?: number;
  filterGroupIndex?: number;

  friction: number;
  restitution?: number;
  sensor?: boolean;
  customProperties?: RubeCustomProperty[];

  vertices: RubeVectorArray; // not in export (at least in this form)
  shapes: Shape[]; // in export it is turned into individual props: circle, polygon, chain
}

export interface MetaCircleShape {
  type: 'circle';
  radius: number;
  // center: RubeVector; // take from parent fixture.vertices
}

export interface MetaPolygonShape {
  type: 'polygon';
  // vertices: RubeVectorArray; // take from parent fixture.vertices
}

export interface MetaLineShape {
  type: 'line';
  // vertices: RubeVectorArray; // take from parent fixture.vertices
}

export interface MetaLoopShape {
  type: 'loop';
  // vertices: RubeVectorArray; // take from parent fixture.vertices
  // RUBE seems to only include these for the JSON export when chain shape is "loop", but not in the .rube file format
  // It seems that: vertices[1] is nextVertex and vertices[vertices.length - 2] is prevVertex when RUBE exports it
  // hasNextVertex?: boolean;
  // hasPrevVertex?: boolean;
  // nextVertex?: RubeVector
  // prevVertex?: RubeVector
}

export type Shape = MetaCircleShape | MetaPolygonShape | MetaLineShape | MetaLoopShape;

export interface MetaImage {
  id: number; // not in export
  angle?: number;
  body?: number; // reference to metabody id only if attached to a body (in export it references the body index)
  center: RubeVector;
  customProperties?: RubeCustomProperty[];
  file: string;
  filter: 0 | 1; // nearest = 0, linear = 1 - (default is 1)
  flip: boolean;
  name: string;
  opacity: number;
  renderOrder: number;
  aspectScale: number; // the ratio of width to height; e.g. scale: 4 and aspecScale: 0.25 results in 1m width 
  scale: number; // length of the vertical side of the image in physics units (meters)
  // Additional properties can be added based on the image types
}

export type MetaJoint = MetaJointRevolute | MetaJointDistance | MetaJointPrismatic | MetaJointWheel | MetaJointRope | MetaJointMotor | MetaJointWeld | MetaJointFriction;

export interface MetaJointBase {
  // Common properties
  id: number; // not in export
  type: 'revolute' | 'distance' | 'prismatic' | 'wheel' | 'rope' | 'motor' | 'weld' | 'friction';
  name: string;
  anchorA: RubeVector;
  anchorB: RubeVector;
  bodyA: number; // reference to metabody id (in export it references the body index)
  bodyB: number; // reference to metabody id (in export it references the body index)
  collideConnected: boolean;
  customProperties?: RubeCustomProperty[];
}

export interface MetaJointRevolute extends MetaJointBase {
  type: 'revolute';
  enableLimit?: boolean;
  enableMotor?: boolean;
  jointSpeed?: number;
  lowerLimit?: number;
  upperLimit?: number;
  maxMotorTorque?: number;
  motorSpeed?: number;
  referenceAngle?: number; // ATTENTION: referenceAngle in .rube for revolute joint turned into refAngle in .json
}

export interface MetaJointDistance extends MetaJointBase {
  type: 'distance';
  dampingRatio?: number;
  frequency?: number;
  length?: number;
}

export interface MetaJointPrismatic extends MetaJointBase {
  type: 'prismatic';
  enableLimit?: boolean;
  enableMotor?: boolean;
  localAxisA?: RubeVector;
  lowerLimit?: number;
  upperLimit?: number;
  maxMotorForce?: number;
  motorSpeed?: number;
  referenceAngle?: number; // ATTENTION: referenceAngle in .rube for prismatic joint turned into refAngle in .json
}

export interface MetaJointWheel extends MetaJointBase {
  type: 'wheel';
  enableMotor?: boolean;
  localAxisA?: RubeVector;
  maxMotorTorque?: number;
  motorSpeed?: number;
  springDampingRatio?: number;
  springFrequency?: number;
}

export interface MetaJointRope extends MetaJointBase {
  type: 'rope';
  maxLength?: number;
}

export interface MetaJointMotor extends MetaJointBase {
  // AnchorA is the 'linear offset', anchorB is ignored
  type: 'motor';
  maxForce?: number;
  maxTorque?: number;
  correctionFactor?: number;
}

export interface MetaJointWeld extends MetaJointBase {
  type: 'weld';
  referenceAngle?: number; // ATTENTION: referenceAngle in .rube for weld joint turned into refAngle in .json
  dampingRatio?: number;
  frequency?: number;
}

export interface MetaJointFriction extends MetaJointBase {
  type: 'friction';
  maxForce?: number;
  maxTorque?: number;
}

export interface MetaObject {
  id: number; // not in export
  name: string;
  file: string;
  path?: string; // listed as a prop but not sure when it is there
  flip: boolean;
  angle: number;
  scale: number;
  position: RubeVector;
  customProperties?: RubeCustomProperty[];
}

// Can be this if we allow "compact zero vectors" in RUBE, which is very annoying to work with.
// For ease of use, errors will be thrown if a zero vector is encountered in this project
export type RubeVector = {x: number; y: number;} | 0;

// This game doesn't require dynamic custom property names (yet), so we can use a union of all known names
export type CustomPropertyDefNames = 'phaserBoardEdge' | 'phaserCameraFollow' | 'surfaceType' | 'phaserTextureFrame' | 'phaserSensorType' | 'phaserTexture' | 'phaserBoardSegmentIndex' | 'phaserPlayerCharacterSpring' | 'phaserPlayerCharacterPart' | 'light';
export type CustomPropertyValue = number | string | boolean | RubeVector;
// These will have a "name" property, and EXACTLY one of the optional properties depending on desired type as the value.
// TODO We could type these as standalone interfaces and then use a union type
export interface RubeCustomProperty {
  name: CustomPropertyDefNames;
  int?: number;
  float?: number;
  string?: string;
  color?: string; // TODO verify format
  bool?: boolean;
  vec2?: RubeVector;
}

// Not sure why RUBE represents lists of vectors like this. Maybe an openGL thing?
export interface RubeVectorArray {
  x: number[];
  y: number[];
}

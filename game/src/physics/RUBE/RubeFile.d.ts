
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
  metajoint?: MetaJoint[]; // joint in export
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
  angularVelocity: number;
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

  id: number; // not in export
}

export interface MetaFixture {
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
  id: number; // not in export
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
  // I have no idea how rube handles these or when they are used in rube
  // hasNextVertex?: boolean;
  // hasPrevVertex?: boolean;
  // nextVertex?: RubeVector
  // prevVertex?: RubeVector
}

export type Shape = MetaCircleShape | MetaPolygonShape | MetaLineShape | MetaLoopShape;

export interface MetaImage {
  angle: number;
  aspectScale: number;
  body: number; // reference to metabody id
  center: RubeVector;
  customProperties?: RubeCustomProperty[];
  file: string;
  filter: number;
  flip: boolean;
  id: number;
  name: string;
  opacity: number;
  renderOrder: number;
  scale: number;
  // Additional properties can be added based on the image types
}

export interface MetaJoint {
  anchorA: RubeVector;
  anchorB: RubeVector;
  bodyA: number; // reference to metabody id
  bodyB: number; // reference to metabody id
  collideConnected: boolean;
  customProperties?: RubeCustomProperty[];
  dampingRatio?: number;
  frequency?: number;
  id: number;
  length?: number;
  lowerLimit?: number;
  maxMotorForce?: number;
  maxMotorTorque?: number;
  motorSpeed?: number;
  name: string;
  referenceAngle: number;
  type: 'revolute' | 'distance' | 'prismatic' | 'wheel' | 'rope' | 'motor' | 'weld' | 'friction';
  upperLimit?: number;
}

export interface MetaObject {
  name: string;
  file: string;
  path?: string; // listed as a prop but not sure when it is there
  flip: boolean;
  id: number;
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

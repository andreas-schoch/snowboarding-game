import {RubeCustomProperty, RubeVector, RubeVectorArray} from './RubeFileExport';

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
  name: string;
  displayName: string;
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
  aspectScale: number;
  body: number; // reference to metabody id
  center: RubeVector | 0;
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
  // Additional properties can be added based on the joint types
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

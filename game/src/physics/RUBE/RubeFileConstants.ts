import {CustomPropertyDef, CustomPropertyDefNames, MetaWorld} from './RubeFile';

const phaserBoardEdge: CustomPropertyDef = Object.freeze({
  class: 'fixture',
  type: 'bool',
  name: 'phaserBoardEdge',
  displayName: 'phaserBoardEdge',
});

const phaserCameraFollow: CustomPropertyDef = Object.freeze({
  class: 'body',
  type: 'bool',
  name: 'phaserCameraFollow',
  displayName: 'phaserCameraFollow',
});

const surfaceType: CustomPropertyDef = Object.freeze({
  class: 'fixture',
  type: 'string',
  name: 'surfaceType',
  displayName: 'surfaceType',
  comboboxEntries: [
    {entry: 'snow'},
    {entry: 'ice'},
    {entry: 'metal'},
    {entry: 'rock'}
  ]
});

const phaserTextureFrame: CustomPropertyDef = Object.freeze({
  class: 'image',
  type: 'string',
  name: 'phaserTextureFrame',
  displayName: 'phaserTextureFrame',
});

const phaserSensorType: CustomPropertyDef = Object.freeze({
  class: 'fixture',
  type: 'string',
  name: 'phaserSensorType',
  displayName: 'phaserSensorType',
  comboboxEntries: [
    {entry: 'pickup_present'},
    {entry: 'level_finish'},
    {entry: 'level_deathzone'}
  ],
});

const phaserTexture: CustomPropertyDef = Object.freeze({
  class: 'image',
  type: 'string',
  name: 'phaserTexture',
  displayName: 'phaserTexture',
  comboboxEntries: [
    {entry: 'atlas_santa'},
    {entry: 'atlas_environment'}
  ],
});

const phaserBoardSegmentIndex: CustomPropertyDef = Object.freeze({
  class: 'body',
  type: 'int',
  name: 'phaserBoardSegmentIndex',
  displayName: 'phaserBoardSegmentIndex',
  comboboxEntries: [
    {entry: '0'},
    {entry: '1'},
    {entry: '2'},
    {entry: '3'},
    {entry: '4'},
    {entry: '5'},
    {entry: '6'},
    {entry: '7'},
    {entry: '8'},
    {entry: '9'}
  ],
});

const phaserPlayerCharacterSpring: CustomPropertyDef = Object.freeze({
  class: 'joint',
  type: 'string',
  name: 'phaserPlayerCharacterSpring',
  displayName: 'phaserPlayerCharacterSpring',
  comboboxEntries: [
    {entry: 'distanceLegLeft'},
    {entry: 'distanceLegRight'},
    {entry: 'weldCenter'},
    {entry: 'bindingLeft'},
    {entry: 'bindingRight'},
    {entry: 'prismatic'}
  ],
});

const phaserPlayerCharacterPart: CustomPropertyDef = Object.freeze({
  class: 'body',
  type: 'string',
  name: 'phaserPlayerCharacterPart',
  displayName: 'phaserPlayerCharacterPart',
  comboboxEntries: [
    {entry: 'body'},
    {entry: 'head'},
    {entry: 'armUpperLeft'},
    {entry: 'armUpperRight'},
    {entry: 'armLowerLeft'},
    {entry: 'armLowerRight'},
    {entry: 'legUpperLeft'},
    {entry: 'legUpperRight'},
    {entry: 'legLowerLeft'},
    {entry: 'legLowerRight'},
    {entry: 'boardSegment'},
    {entry: 'boardSegmentNose'}
  ],
});

const light: CustomPropertyDef = Object.freeze({
  class: 'body',
  type: 'bool',
  name: 'light',
  displayName: 'light',
});

export const customPropertyDefs: Readonly<CustomPropertyDef[]> = Object.freeze([
  phaserBoardEdge,
  phaserCameraFollow,
  surfaceType,
  phaserTextureFrame,
  phaserSensorType,
  phaserTexture,
  phaserBoardSegmentIndex,
  phaserPlayerCharacterSpring,
  phaserPlayerCharacterPart,
  light,
]);

export const customPropertyDefsByName: Readonly<Record<CustomPropertyDefNames, CustomPropertyDef>> = Object.freeze(customPropertyDefs.reduce((acc, def) => {
  acc[def.name] = def;
  return acc;
}, {} as Record<CustomPropertyDefNames, CustomPropertyDef>));

export const metaWorld: Readonly<MetaWorld> = Object.freeze({
  gravity: Object.freeze({x: 0, y: -10}),
  positionIterations: 12,
  velocityIterations: 12,
  stepsPerSecond: 60,

  allowSleep: true,
  autoClearForces: true,
  continuousPhysics: true,
  subStepping: true,
  warmStarting: true,

  exportOptions: Object.freeze({
    compactCommonFloats: true,
    compactZeroVecs: false,
    saveFullPathForImages: false,
    saveFullPathForSamplerOutput: false,
    saveImagePathsRelativeToRUBEFile: false,
    saveSamplerOutputPathsRelativeToRUBEFile: false,
    useGsonFormat: false,
    useHumanReadableFloats: true,
    usePrettyPrint: true
  }),
});

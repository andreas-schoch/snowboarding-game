import {CustomPropertyDef} from './RubeFile';

const phaserBoardEdge: CustomPropertyDef = {
  class: 'fixture',
  type: 'bool',
  name: 'phaserBoardEdge',
  displayName: 'phaserBoardEdge',
};

const phaserCameraFollow: CustomPropertyDef = {
  class: 'body',
  type: 'bool',
  name: 'phaserCameraFollow',
  displayName: 'phaserCameraFollow',
};

const surfaceType: CustomPropertyDef = {
  class: 'body',
  type: 'string',
  name: 'surfaceType',
  displayName: 'surfaceType',
  comboboxEntries: [
    {entry: 'snow'},
    {entry: 'ice'},
    {entry: 'metal'},
    {entry: 'rock'}
  ]
};

const phaserTextureFrame: CustomPropertyDef = {
  class: 'image',
  type: 'string',
  name: 'phaserTextureFrame',
  displayName: 'phaserTextureFrame',
};

const phaserSensorType: CustomPropertyDef = {
  class: 'fixture',
  type: 'string',
  name: 'phaserSensorType',
  displayName: 'phaserSensorType',
  comboboxEntries: [
    {entry: 'pickup_present'},
    {entry: 'level_finish'},
    {entry: 'level_deathzone'}
  ],
};

const phaserTexture: CustomPropertyDef = {
  class: 'image',
  type: 'string',
  name: 'phaserTexture',
  displayName: 'phaserTexture',
  comboboxEntries: [
    {entry: 'atlas_santa'},
    {entry: 'atlas_environment'}
  ],
};

const phaserBoardSegmentIndex: CustomPropertyDef = {
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
};

const phaserPlayerCharacterSpring: CustomPropertyDef = {
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
};

const phaserPlayerCharacterPart: CustomPropertyDef = {
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
};

const light: CustomPropertyDef = {
  class: 'body',
  type: 'bool',
  name: 'light',
  displayName: 'light',
};

// TODO think about wheather to use this or the ones from the RubeFile
export const customPropertyDefs: Record<string, CustomPropertyDef> = {
  phaserBoardEdge,
  phaserCameraFollow,
  surfaceType,
  phaserTextureFrame,
  phaserSensorType,
  phaserTexture,
  phaserBoardSegmentIndex,
  phaserPlayerCharacterSpring,
  phaserPlayerCharacterPart,
  light
};

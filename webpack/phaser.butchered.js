/* eslint-disable import/no-default-export */
/* eslint-disable import/order */
/* eslint-disable import/newline-after-import */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

// My game uses a fairly small subset of Phaser's features, but when creating a bundle, phaser is included in its entirety.
// This custom build reduces the size of the phaser from 1200KB to 660KB (with v3.86.0) and includes only what is needed for my game.

// I used "phaser-core.js" as the base and removed or added stuff as needed: https://github.com/phaserjs/phaser/blob/946e82b05806fc828da6ce56bb039ac698b9d503/src/phaser-core.js
// Then used a variation of this "webpack.dist.config.js" to build and test it: https://github.com/phaserjs/phaser/blob/946e82b05806fc828da6ce56bb039ac698b9d503/config/webpack.dist.config.js
// Eventually I moved it to this repo and added the "butcher" build step.

// I believe the phaser team is working on an ES6 refactor of their engine which will support treeshaking, so hopefully this will become unnecessary in the future.

export const Cache = require('phaser/src/cache/index.js');

export const Cameras = {
  Controls: {
    SmoothedKeyControl: require('phaser/src/cameras/controls/SmoothedKeyControl.js')
  },
  Scene2D: {
    Camera: require('phaser/src/cameras/2d/Camera.js'),
    BaseCamera: require('phaser/src/cameras/2d/BaseCamera.js'),
    CameraManager: require('phaser/src/cameras/2d/CameraManager.js'),
    Effects: {Shake: require('phaser/src/cameras/2d/effects/Shake.js')},
    Events: require('phaser/src/cameras/2d/events/index.js')
  }
};

export const Core = require('phaser/src/core/index.js');

export const Create = {
  GenerateTexture: require('phaser/src/create/GenerateTexture.js'),
};

export const Events = require('phaser/src/events/index.js');

export const Game = require('phaser/src/core/Game.js');

export const GameObjects = {
  DisplayList: require('phaser/src/gameobjects/DisplayList.js'),
  GameObjectCreator: require('phaser/src/gameobjects/GameObjectCreator.js'),
  GameObjectFactory: require('phaser/src/gameobjects/GameObjectFactory.js'),
  UpdateList: require('phaser/src/gameobjects/UpdateList.js'),
  BuildGameObject: require('phaser/src/gameobjects/BuildGameObject.js'),
  BuildGameObjectAnimation: require('phaser/src/gameobjects/BuildGameObjectAnimation.js'),
  GameObject: require('phaser/src/gameobjects/GameObject.js'),
  Graphics: require('phaser/src/gameobjects/graphics/Graphics.js'),
  Image: require('phaser/src/gameobjects/image/Image.js'),
  Factories: {
    ParticleEmitter: require('phaser/src/gameobjects/particles/ParticleEmitterFactory.js'),
    Graphics: require('phaser/src/gameobjects/graphics/GraphicsFactory.js'),
    Image: require('phaser/src/gameobjects/image/ImageFactory.js'),
    TileSprite: require('phaser/src/gameobjects/tilesprite/TileSpriteFactory.js'),
  },
  Creators: {
    ParticleEmitter: require('phaser/src/gameobjects/particles/ParticleEmitterCreator.js'),
    Graphics: require('phaser/src/gameobjects/graphics/GraphicsCreator.js'),
    Image: require('phaser/src/gameobjects/image/ImageCreator.js'),
    TileSprite: require('phaser/src/gameobjects/tilesprite/TileSpriteCreator.js'),
  }
};

export const Geom = {
  Polygon: require('phaser/src/geom/polygon/Polygon.js'),
};

export const Input = {
  CreatePixelPerfectHandler: require('phaser/src/input/CreatePixelPerfectHandler.js'),
  CreateInteractiveObject: require('phaser/src/input/CreateInteractiveObject.js'),
  Events: require('phaser/src/input/events/index.js'),
  InputManager: require('phaser/src/input/InputManager.js'),
  InputPlugin: require('phaser/src/input/InputPlugin.js'),
  InputPluginCache: require('phaser/src/input/InputPluginCache.js'),
  Keyboard: require('phaser/src/input/keyboard/index.js'),
  Pointer: require('phaser/src/input/Pointer.js'),
  Touch: require('phaser/src/input/touch/index.js'),
  ...require('phaser/src/input/const.js'),
};

export const Loader = {
  FileTypes: {
    AtlasJSONFile: require('phaser/src/loader/filetypes/AtlasJSONFile.js'), // needed
    AudioFile: require('phaser/src/loader/filetypes/AudioFile.js'),
    BinaryFile: require('phaser/src/loader/filetypes/BinaryFile.js'), // needed
    HTML5AudioFile: require('phaser/src/loader/filetypes/HTML5AudioFile.js'),
    ImageFile: require('phaser/src/loader/filetypes/ImageFile.js'), // needed
  },
  File: require('phaser/src/loader/File.js'),
  FileTypesManager: require('phaser/src/loader/FileTypesManager.js'),
  GetURL: require('phaser/src/loader/GetURL.js'),
  LoaderPlugin: require('phaser/src/loader/LoaderPlugin.js'),
};

export const Renderer = {
  WebGL: {
    RenderTarget: require('phaser/src/renderer/webgl/RenderTarget.js'),
    WebGLRenderer: require('phaser/src/renderer/webgl/WebGLRenderer.js'),
    Wrappers: require('phaser/src/renderer/webgl/wrappers/index.js'),
    ...require('phaser/src/renderer/webgl/const.js'),
  },
  Snapshot: {WebGL: require('phaser/src/renderer/snapshot/WebGLSnapshot.js')},
};

export const Scale = require('phaser/src/scale/index.js');

export const ScaleModes = require('phaser/src/renderer/ScaleModes.js');

export const Scene = require('phaser/src/scene/Scene.js');

export const Scenes = require('phaser/src/scene/index.js');

export const Sound = require('phaser/src/sound/index.js');

const FilterMode = require('phaser/src/textures/const.js');
export const Textures = {
  Events: require('phaser/src/textures/events/index.js'),
  FilterMode: FilterMode,
  Frame: require('phaser/src/textures/Frame.js'),
  Parsers: require('phaser/src/textures/parsers/index.js'),
  Texture: require('phaser/src/textures/Texture.js'),
  TextureManager: require('phaser/src/textures/TextureManager.js'),
  TextureSource: require('phaser/src/textures/TextureSource.js'),
  ...FilterMode
};

export const Tweens = require('phaser/src/tweens/index.js');

export const WEBGL = require('phaser/src/const.js').WEBGL;

// TODO try to automate butcher build further. Currently a 2 step process: 1. build butcher build 2. build game with butcher build.
// TODO find a way to generate a Partial of the full Phaser types based on the butcher build. Otherwise it isn't clear what is available.s

import 'phaser';
import Box2DFactory from 'box2d-wasm';
import {simd} from 'wasm-feature-detect';
import {Settings} from './Settings';
import {RubeScene} from './physics/RUBE/RubeLoaderInterfaces';
import {PocketbaseService} from './pocketbase/pocketbase';
import {TrickScore} from './pocketbase/types';
import {GameScene} from './scenes/GameScene';
import {PreloadScene} from './scenes/PreloadScene';
import {Base64Serializer} from './serializers/base64Serializer';
import {ScoreLogSerializer} from './serializers/customSerializer';
import {fromTSLProto, fromWrapperTSLProto, toTSLProto, toWrapperTSLProto,TrickScoreProto} from './serializers/proto';
import {ProtobufSerializer} from './serializers/protobufSerializer';

export const pb = new PocketbaseService();

export const SCENE_PRELOAD = 'PreloadScene';
export const SCENE_GAME = 'GameScene';

export const POINTS_PER_COIN = 100;
export const LEVEL_SUCCESS_BONUS_POINTS = 5000;
export const BASE_FLIP_POINTS = 200;
export const TRICK_POINTS_COMBO_FRACTION = 0.2;
export const HEAD_MAX_IMPULSE = 8;

export const DEFAULT_WIDTH = 1280;
export const DEFAULT_HEIGHT = 720;

export const gameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Snowboarding Game',
  version: '1.1.1',
  type: Phaser.WEBGL,
  backgroundColor: Settings.darkmodeEnabled() ? '0x666666' : '0x3470c6',
  disableContextMenu: true,
  parent: 'root-game',
  // dom: { createContainer: true }, // Not using inbuilt way to display UI as it sucks with dynamic scaling and resizing
  fps: {
    target: 60,
    min: 55,
    smoothStep: false,
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: Settings.widthScaled(),
    height: Settings.heightScaled(),
  },
  scene: [PreloadScene, GameScene],
  plugins: {
    global: []
  },
};

export let game: Phaser.Game;
export let b2: typeof Box2D & EmscriptenModule;
export let freeLeaked: () => void;
export let recordLeak: <Instance extends Box2D.WrapperObject>(instance: Instance, b2Class?: typeof Box2D.WrapperObject | undefined) => Instance;
export let rubeSceneSerializer: {encode: (rubeScene: RubeScene) => string, decode: (base64: string) => RubeScene};

export let trickScoreB64Serializer: {encode: (tsl: TrickScore[]) => string, decode: (base64: string) => TrickScore[]};
export let trickScoreProtoSerializer: {encode: (wrapper: {wrapper: TrickScore[]}) => string, decode: (base64: string) => {wrapper: TrickScore[]}};
export let trickScoreSerializer: {encode: (tsl: TrickScore[]) => string, decode: (base64: string) => TrickScore[]};

window.onload = async () => {
  // WASM with SIMD may be more performant but haven't benchmarked it yet. Either way, probably neglible for this type of game.
  const simdSupported = await simd();
  b2 = await Box2DFactory({locateFile: () => simdSupported ? 'Box2D.simd.wasm' : 'Box2D.wasm'});
  const LeakMitigator = new b2.LeakMitigator();
  freeLeaked = LeakMitigator.freeLeaked;
  recordLeak = LeakMitigator.recordLeak;

  rubeSceneSerializer = await ProtobufSerializer<RubeScene, RubeScene>({schema: 'assets/proto/RubeScene.proto', type: 'Scene'});
  trickScoreB64Serializer = await Base64Serializer<TrickScore[], TrickScoreProto[]>({default: [], to: toTSLProto, from: fromTSLProto});
  trickScoreProtoSerializer = await ProtobufSerializer<{wrapper: TrickScore[]}, {wrapper: TrickScoreProto[]}>({schema: 'assets/proto/TSL.proto', type: 'TSL', default: {wrapper: []}, to: toWrapperTSLProto, from: fromWrapperTSLProto});
  trickScoreSerializer = await ScoreLogSerializer();

  game = new Phaser.Game(gameConfig);

  if (navigator.onLine) {
    // Display fps and memory usage
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    (function () { const script = document.createElement('script'); script.onload = function () { const stats = new Stats(); document.body.appendChild(stats.dom); requestAnimationFrame(function loop() { stats.update(); requestAnimationFrame(loop); }); }; script.src = 'https://mrdoob.github.io/stats.js/build/stats.min.js'; document.head.appendChild(script); })();
  }
};

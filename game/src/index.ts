/// <reference types="phaser" />
import Box2DFactory from 'box2d-wasm';
import {simd} from 'wasm-feature-detect';
import {PersistedStore} from './PersistedStore';
import {RubeFile} from './physics/RUBE/RubeFile';
import {sanitizeRubeFile} from './physics/RUBE/sanitizeRubeFile';
import {PocketbaseService} from './pocketbase/pocketbase';
import {TrickScore} from './pocketbase/types';
import {EditorScene} from './scenes/EditorScene';
import {GameScene} from './scenes/GameScene';
import {PreloadScene} from './scenes/PreloadScene';
import {ScoreLogSerializer} from './serializers/ScoreLogSerializer';
import {ProtobufSerializer} from './serializers/protobufSerializer';

export const pb = new PocketbaseService();

export const SCENE_PRELOAD = 'PreloadScene';
export const SCENE_GAME = 'GameScene';
export const SCENE_EDITOR = 'EditorScene';

export const POINTS_PER_COIN = 100;
export const BASE_FLIP_POINTS = 400;
export const TRICK_POINTS_COMBO_FRACTION = 0.1;
export const HEAD_MAX_IMPULSE = 8;

export const ppm = 40; // (P)ixels (p)er (m)eter

export const DEFAULT_WIDTH = 1280;
export const DEFAULT_HEIGHT = 720;

export const gameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Snowboarding Game',
  version: '2.2.0',
  type: Phaser.WEBGL,
  backgroundColor: PersistedStore.darkmodeEnabled() ? '0x666666' : '0x3470c6',
  disableContextMenu: true,
  parent: 'root-game',
  // dom: { createContainer: true }, // Not using inbuilt way to display UI as it sucks with dynamic scaling and resizing
  fps: {
    target: 60,
    min: 60,
    smoothStep: true,
  },
  scale: {
    mode: Phaser.Scale.ENVELOP,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: PersistedStore.widthScaled(),
    height: PersistedStore.heightScaled(),
  },
  scene: [PreloadScene, GameScene, EditorScene],
  plugins: {
    global: []
  },
};

export const rootGame = document.querySelector('#root-game') as HTMLElement;
if (!rootGame) throw new Error('Root game element not found');

export let game: Phaser.Game;
export let b2: typeof Box2D & EmscriptenModule;
export let freeLeaked: () => void;
export let recordLeak: <Instance extends Box2D.WrapperObject>(instance: Instance, b2Class?: typeof Box2D.WrapperObject | undefined) => Instance;

export let rubeFileSerializer: {encode: (rubefile: RubeFile) => string, decode: (encoded: string) => RubeFile};
export let scoreLogSerializer: {encode: (tsl: TrickScore[]) => string, decode: (base64: string) => TrickScore[]};

window.onload = async () => {
  // WASM with SIMD may be more performant but haven't benchmarked it yet. Either way, probably neglible for this type of game.
  const simdSupported = await simd();
  b2 = await Box2DFactory({locateFile: () => simdSupported ? 'Box2D.simd.wasm' : 'Box2D.wasm'});
  const LeakMitigator = new b2.LeakMitigator();
  freeLeaked = LeakMitigator.freeLeaked;
  recordLeak = LeakMitigator.recordLeak;

  rubeFileSerializer = await ProtobufSerializer<RubeFile, RubeFile>({schema: 'assets/protobuf/RubeFile.proto', type: 'RubeFile', from: sanitizeRubeFile, to: sanitizeRubeFile});
  scoreLogSerializer = await ScoreLogSerializer();

  game = new Phaser.Game(gameConfig);

  if (navigator.onLine && PersistedStore.fps()) {
    // Display fps and memory usage
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    (function () { const script = document.createElement('script'); script.onload = function () { const stats = new Stats(); document.body.appendChild(stats.dom); requestAnimationFrame(function loop() { stats.update(); requestAnimationFrame(loop); }); }; script.src = 'https://mrdoob.github.io/stats.js/build/stats.min.js'; document.head.appendChild(script); })();
  }
};

export const DEBUG_LOGS = PersistedStore.debugLogs();
if (!DEBUG_LOGS) {
  const noop = () => {};
  console.debug = noop;
  console.time = noop;
  console.timeLog = noop;
  console.timeEnd = noop;
}

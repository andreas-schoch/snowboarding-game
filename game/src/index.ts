import 'phaser'; // needs to be imported at least once
import Box2DFactory from 'box2d-wasm';
import { simd } from "wasm-feature-detect";
import FirebasePlugin from 'phaser3-rex-plugins/plugins/firebase-plugin.js'; // TODO get rid of this. Consider using firebase without plugin or switch to Couchbase as a backend

import PreloadScene from './scenes/PreloadScene';
import GameScene from './scenes/GameScene';
import GameUIScene from './scenes/GameUIScene';
import { LeaderboardService } from './services/leaderboard';
import { Settings } from './Settings';

// Since there is no dependency injection system (yet) and we don't want to always re-init firebase, this service is made available like this to whoever needs it.
export const leaderboardService = new LeaderboardService();

export const SCENE_PRELOAD = 'PreloadScene';
export const SCENE_GAME = 'GameScene';
export const SCENE_GAME_UI = 'GameUIScene';

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
  scene: [PreloadScene, GameScene, GameUIScene],
  plugins: {
    global: [
      { key: 'rexFirebase', plugin: FirebasePlugin, start: true }
    ],
  },
};

export let b2: typeof Box2D & EmscriptenModule;
export let freeLeaked: () => void;
export let recordLeak: <Instance extends Box2D.WrapperObject>(instance: Instance, b2Class?: typeof Box2D.WrapperObject | undefined) => Instance;
window.onload = () => {
  simd().then(simdSupported => {
    // WASM with SIMD may be more performant but haven't benchmarked it yet. Either way, probably neglible for this type of game.
    Box2DFactory({ locateFile: () => simdSupported ? 'Box2D.simd.wasm' : 'Box2D.wasm' }).then((_b2) => {
      b2 = _b2;
      const LeakMitigator = new b2.LeakMitigator();
      freeLeaked = LeakMitigator.freeLeaked;
      recordLeak = LeakMitigator.recordLeak;
      new Phaser.Game(gameConfig);

      if (navigator.onLine) {
        // Display fps and memory usage
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        (function () { const script = document.createElement('script'); script.onload = function () { const stats = new Stats(); document.body.appendChild(stats.dom); requestAnimationFrame(function loop() { stats.update(); requestAnimationFrame(loop); }); }; script.src = 'https://mrdoob.github.io/stats.js/build/stats.min.js'; document.head.appendChild(script); })();
      }
    });
  });
};

import 'phaser'; // needs to be imported at least once
import Box2DFactory from 'box2d-wasm';
import { simd } from "wasm-feature-detect";
import FirebasePlugin from 'phaser3-rex-plugins/plugins/firebase-plugin.js'; // TODO get rid of this. Consider using firebase without plugin or switch to Couchbase as a backend

import PreloadScene from './scenes/PreloadScene';
import GameScene from './scenes/GameScene';
import GameUIScene from './scenes/GameUIScene';
import { LeaderboardService } from './services/leaderboard';

// Since there is no dependency injection system (yet) and we don't want to always re-init firebase, this service is made available like this to whoever needs it.
export const leaderboardService = new LeaderboardService();

export const SCENE_PRELOAD = 'PreloadScene';
export const SCENE_GAME = 'GameScene';
export const SCENE_GAME_UI = 'GameUIScene';

export const SETTINGS_KEY_DEBUG = 'snowboarding_game_debug';
export const SETTINGS_KEY_DEBUG_ZOOM = 'snowboarding_game_debug_zoom';
export const SETTINGS_KEY_RESOLUTION = 'snowboarding_game_resolution';
export const SETTINGS_KEY_VOLUME_MUSIC = 'snowboarding_game_volume_music';
export const SETTINGS_KEY_VOLUME_SFX = 'snowboarding_game_volume_sfx';

export const KEY_USER_NAME = 'snowboarding_game_user_name';
export const KEY_USER_SCORES = 'snowboarding_game_user_scores_v3';
export const KEY_LEVEL_CURRENT = 'snowboarding_game_level_current';
export const KEY_SELECTED_CHARACTER = 'snowboarding_game_selected_character';

export const POINTS_PER_COIN = 100;
export const LEVEL_SUCCESS_BONUS_POINTS = 5000;
export const BASE_FLIP_POINTS = 200;
export const TRICK_POINTS_COMBO_FRACTION = 0.2;
export const HEAD_MAX_IMPULSE = 8;

export const DEFAULT_WIDTH = 1280;
export const DEFAULT_HEIGHT = 720;

export const RESOLUTION_SCALE: number = Number(localStorage.getItem(SETTINGS_KEY_RESOLUTION) || 1);
export const DEFAULT_ZOOM: number = Number(localStorage.getItem(SETTINGS_KEY_DEBUG_ZOOM) || 1);
export const DEBUG: boolean = Boolean(localStorage.getItem(SETTINGS_KEY_DEBUG));

// This is temporary. In the future, the game will provide some basic levels out of the box (so it can be played when running repo locally without a backend).
// The majority of the levels is expected to be custom made by players and fetched from a server.
export enum LevelKeys {
  level_001 = 'level_001',
  level_002 = 'level_002',
  level_003 = 'level_003',
  level_004 = 'level_004',
  level_005 = 'level_005',
}

export const LEVELS = [
  LevelKeys.level_001,
  LevelKeys.level_002,
  LevelKeys.level_003,
  LevelKeys.level_004,
  LevelKeys.level_005,
];

export const BackgroundMusicKeys = {
  ContinueLife: 'KevinMacLeod/Continue Life',
  Heartbreaking: 'KevinMacLeod/Heartbreaking',
  RainsWillFall: 'KevinMacLeod/Rains Will Fall',
  SadTrio: 'KevinMacLeod/Sad Trio',
  StagesOfGrief: 'KevinMacLeod/Stages of Grief',
};

export const RUBE_SCENE_CHARACTER = 'character';

export const enum CharacterKeys {
  character_neutral = 'atlas_character_neutral',
  character_santa = 'atlas_character_santa',
}

export const CHARACTERS = [
  CharacterKeys.character_neutral,
  CharacterKeys.character_santa,
];

export const gameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Snowboarding Game',
  version: '1.1.1',
  type: Phaser.AUTO,
  backgroundColor: '#ffffff',
  disableContextMenu: true,
  parent: 'phaser-wrapper',
  dom: {
    createContainer: true,
  },
  fps: {
    target: 60,
    min: 55,
    smoothStep: true,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: DEFAULT_WIDTH * RESOLUTION_SCALE,
    height: DEFAULT_HEIGHT * RESOLUTION_SCALE,
  },
  scene: [PreloadScene, GameScene, GameUIScene],
  plugins: {
    global: [
      { key: 'rexFirebase', plugin: FirebasePlugin, start: true }
    ],
  },
};

export let b2: typeof Box2D & EmscriptenModule;
window.addEventListener('load', () => {
  simd().then(simdSupported => {
    // WASM with SIMD may be more performant but haven't benchmarked it yet. Either way, probably neglible for this type of game.
    Box2DFactory({ locateFile: () => simdSupported ? 'Box2D.simd.wasm' : 'Box2D.wasm' }).then((_b2) => {
      b2 = _b2;
      new Phaser.Game(gameConfig);

      if (navigator.onLine) {
        // Display fps and memory usage
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        (function () { const script = document.createElement('script'); script.onload = function () { const stats = new Stats(); document.body.appendChild(stats.dom); requestAnimationFrame(function loop() { stats.update(); requestAnimationFrame(loop); }); }; script.src = 'https://mrdoob.github.io/stats.js/build/stats.min.js'; document.head.appendChild(script); })();
      }
    });
  });
});

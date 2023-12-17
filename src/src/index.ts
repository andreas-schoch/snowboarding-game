import * as Ph from 'phaser';
import FirebasePlugin from 'phaser3-rex-plugins/plugins/firebase-plugin.js';

import Box2DFactory from 'box2d-wasm';
import PreloadScene from './scenes/PreloadScene';
import GameScene from './scenes/GameScene';
import GameUIScene from './scenes/GameUIScene';
import { LeaderboardService } from './services/leaderboard';

export const enum SceneKeys {
  PRELOAD_SCENE = 'PreloadScene',
  GAME_SCENE = 'GameScene',
  GAME_UI_SCENE = 'GameUIScene',
}

// Since there is no dependency injection system (yet) and we don't want to always re-init firebase, this service is made available like this to whoever needs it.
export const leaderboardService = new LeaderboardService();

export const SETTINGS_KEY_DEBUG = 'snowboarding_game_debug';
export const SETTINGS_KEY_DEBUG_ZOOM = 'snowboarding_game_debug_zoom';
export const SETTINGS_KEY_RESOLUTION = 'snowboarding_game_resolution';
export const SETTINGS_KEY_VOLUME_MUSIC = 'snowboarding_game_volume_music';
export const SETTINGS_KEY_VOLUME_SFX = 'snowboarding_game_volume_sfx';

export const KEY_USER_NAME = 'snowboarding_game_user_name';
export const KEY_USER_SCORES = 'snowboarding_game_user_scores_v3';

export const KEY_LEVEL_CURRENT = 'snowboarding_game_level_current';

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
];

export const POINTS_PER_COIN = 100;
export const LEVEL_SUCCESS_BONUS_POINTS = 5000;
export const BASE_FLIP_POINTS = 200;
export const TRICK_POINTS_COMBO_FRACTION = 0.2;
export const HEAD_MAX_IMPULSE = 8;

export const DEFAULT_WIDTH = 1280;
export const DEFAULT_HEIGHT = 720;
export const RESOLUTION_SCALE: number = Number(localStorage.getItem(SETTINGS_KEY_RESOLUTION) || 1);
export const DEFAULT_ZOOM: number = Number(localStorage.getItem(SETTINGS_KEY_DEBUG_ZOOM) || 0.9);
export const DEBUG: boolean = Boolean(localStorage.getItem(SETTINGS_KEY_DEBUG));

export const gameConfig: Ph.Types.Core.GameConfig = {
  title: 'Snowboarding Game',
  version: '1.1.1',
  type: Ph.AUTO,
  backgroundColor: '#ffffff',
  disableContextMenu: true,
  parent: 'phaser-wrapper',
  dom: {
    createContainer: true,
  },
  fps: {
    min: 55,
    target: 60,
    smoothStep: true,
  },
  // roundPixels: true,
  // pixelArt: true,
  scale: {
    mode: Ph.Scale.FIT,
    autoCenter: Ph.Scale.CENTER_BOTH,
    width: DEFAULT_WIDTH * RESOLUTION_SCALE,
    height: DEFAULT_HEIGHT * RESOLUTION_SCALE,
  },
  scene: [PreloadScene, GameScene, GameUIScene],
  plugins: {
    global: [{
      key: 'rexFirebase',
      plugin: FirebasePlugin,
      start: true,
    }],
  },
};

export let b2: typeof Box2D & EmscriptenModule;
window.addEventListener('load', () => {
  Box2DFactory({ locateFile: () => `assets/Box2D.wasm` }).then((_b2) => {
    b2 = _b2;
    new Ph.Game(gameConfig);
  });
});

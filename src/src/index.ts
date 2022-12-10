import * as Ph from 'phaser';
import PreloadScene from './scenes/PreloadScene';
import GameScene from './scenes/GameScene';
import GameStats from 'gamestats.js';
import GameUIScene from './scenes/GameUIScene';

export const SETTINGS_KEY_DEBUG = 'snowboarding_game_debug';
export const SETTINGS_KEY_DEBUG_ZOOM = 'snowboarding_game_debug_zoom';
export const SETTINGS_KEY_RESOLUTION = 'snowboarding_game_resolution';
export const SETTINGS_KEY_VOLUME_MUSIC = 'snowboarding_game_volume_music';
export const SETTINGS_KEY_VOLUME_SFX = 'snowboarding_game_volume_sfx';

export const DEFAULT_WIDTH = 1280;
export const DEFAULT_HEIGHT = 720;
export const RESOLUTION_SCALE: number = Number(localStorage.getItem(SETTINGS_KEY_RESOLUTION) || 1);
export const DEFAULT_ZOOM: number = Number(localStorage.getItem(SETTINGS_KEY_DEBUG_ZOOM) || 1);
export const DEBUG: boolean = Boolean(localStorage.getItem(SETTINGS_KEY_DEBUG));

export const gameConfig: Ph.Types.Core.GameConfig = {
  title: 'Snowboarding Game',
  version: '1.0.0',
  type: Ph.WEBGL,
  backgroundColor: '#ffffff',
  disableContextMenu: true,
  parent: 'phaser-wrapper',
  dom: {
    createContainer: true,
  },
  fps: {
    min: 50,
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
};

const config = {
  autoPlace: true, /* auto place in the dom */
  targetFPS: 60, /* the target max FPS */
  redrawInterval: 200, /* the interval in MS for redrawing the FPS graph */
  maximumHistory: 200, /* the length of the visual graph history in frames */
  scale: 1, /* the scale of the canvas */
  memoryUpdateInterval: 100, /* the interval for measuring the memory */
  memoryMaxHistory: 60 * 10, /* the max amount of memory measures */

  // Styling props
  FONT_FAMILY: 'Arial',
  COLOR_FPS_BAR: '#34cfa2',
  COLOR_FPS_AVG: '#FFF',
  COLOR_TEXT_LABEL: '#FFF',
  COLOR_TEXT_TO_LOW: '#eee207',
  COLOR_TEXT_BAD: '#d34646',
  COLOR_TEXT_TARGET: '#d249dd',
  COLOR_BG: '#333333',
};

export let stats: GameStats = {begin: () => null, end: () => null} as unknown as GameStats;
window.addEventListener('load', () => {
  const game = new Ph.Game(gameConfig);

  if (DEBUG) {
    stats = new GameStats(config);
    document.body.appendChild(stats.dom);
  }
});

import * as Ph from 'phaser';
import PreloadScene from './scenes/preload.scene';
import GameScene from './scenes/game.scene';
import GameStats from 'gamestats.js';
import UiScene from './scenes/ui.scene';

export const DEFAULT_WIDTH = 1280;
export const DEFAULT_HEIGHT = 720;
export const DEFAULT_ZOOM = 1;
export const RESOLUTION_SCALE = 1;


export const gameConfig: Ph.Types.Core.GameConfig = {
  title: 'Snowboarding Game',
  version: '1.0.0',
  type: Ph.WEBGL,
  backgroundColor: '#ffffff',
  disableContextMenu: true,
  fps: {
    min: 50,
    target: 60,
    smoothStep: true,
  },
  // roundPixels: true,
  // pixelArt: true,
  scale: {
    parent: 'phaser-wrapper',
    mode: Ph.Scale.FIT,
    autoCenter: Ph.Scale.CENTER_BOTH,
    width: DEFAULT_WIDTH * RESOLUTION_SCALE,
    height: DEFAULT_HEIGHT * RESOLUTION_SCALE,
  },
  scene: [PreloadScene, GameScene, UiScene],
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

export let stats: GameStats;
window.addEventListener('load', () => {
  const game = new Ph.Game(gameConfig);
  stats = new GameStats(config);
  document.body.appendChild(stats.dom);
});

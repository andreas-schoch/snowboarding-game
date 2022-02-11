import * as Ph from 'phaser';
import PreloadScene from './scenes/preload.scene';
import GameScene from './scenes/game.scene';
import UIScene from './scenes/ui-scene';
import GameStats from 'gamestats.js';

export const DEFAULT_WIDTH = 960;
export const DEFAULT_HEIGHT = 540;

const gameConfig: Ph.Types.Core.GameConfig = {
  title: 'Wicked Snowman',
  version: '0.4.2',
  type: Ph.WEBGL,
  backgroundColor: '#ffffff',
  disableContextMenu: true,
  fps: {
    min: 50,
    target: 60,
    // smoothStep: true,
  },
  // roundPixels: true,
  // pixelArt: true,
  scale: {
    parent: 'phaser-wrapper',
    mode: Ph.Scale.FIT,
    autoCenter: Ph.Scale.CENTER_BOTH,
    width: 0 || DEFAULT_WIDTH,
    height: 0 || DEFAULT_HEIGHT,
  },
  scene: [PreloadScene, GameScene, UIScene],
};

const config = {
  autoPlace: true, /* auto place in the dom */
  targetFPS: 60, /* the target max FPS */
  redrawInterval: 200, /* the interval in MS for redrawing the FPS graph */
  maximumHistory: 200, /* the length of the visual graph history in frames */
  scale: 1.25, /* the scale of the canvas */
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

// TODO Phaser is huge even minified. Figure out how to reduce the bundle size.

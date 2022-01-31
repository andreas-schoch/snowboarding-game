import * as Ph from 'phaser';

import GameScene from './scenes/game.scene';
import PreloadScene from './scenes/preload.scene';

const DEFAULT_WIDTH = 960;
const DEFAULT_HEIGHT = 540;

const gameConfig: Ph.Types.Core.GameConfig = {
  type: Ph.WEBGL,
  backgroundColor: '#ffffff',
  disableContextMenu: true,
  fps: {
    min: 55,
    target: 60,
    smoothStep: true,
  },
  scale: {
    parent: 'phaser-wrapper',
    mode: Ph.Scale.FIT,
    autoCenter: Ph.Scale.CENTER_BOTH,
    width: 0 || DEFAULT_WIDTH,
    height: 0 || DEFAULT_HEIGHT,
  },
  scene: [PreloadScene, GameScene],
};

window.addEventListener('load', () => {
  const game = new Ph.Game(gameConfig);
});

// TODO Phaser is huge even minified. Figure out how to reduce the bundle size.

// TODO look into path followers to maybe implement something like an avalanche: https://phaser.io/examples/v3/view/paths/followers/rotate-to-path
//  Could also be useful to move physics objects in a controlled manner along the terrain (e.g moving obstacles coming from right to left)
//  Or for particle effects etc

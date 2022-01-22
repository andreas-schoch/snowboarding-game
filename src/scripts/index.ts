import * as Ph from 'phaser';

import GameScene from './scenes/game.scene';
import PreloadScene from './scenes/preload.scene';
import Box2DFactory from 'box2d-wasm';

const DEFAULT_WIDTH = 1920;
const DEFAULT_HEIGHT = 1080;

export let b2: typeof Box2D & EmscriptenModule;

export async function initBox2D() {
  b2 = await Box2DFactory({locateFile: () => `assets/Box2D.wasm`});
}

export const gameConfig = {
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
// TODO experiment with faster box2d ports. Planckjs seems like the slowest option performance wise.

// TODO look into path followers to maybe implement something like an avalanche: https://phaser.io/examples/v3/view/paths/followers/rotate-to-path
//  Could also be useful to move physics objects in a controlled manner along the terrain (e.g moving obstacles coming from right to left)
//  Or for particle effects etc

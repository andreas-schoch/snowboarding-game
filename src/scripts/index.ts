import * as Ph from 'phaser';
import PreloadScene from './scenes/preload.scene';
import GameScene from './scenes/game.scene';
import UIScene from './scenes/ui-scene';

export const DEFAULT_WIDTH = 960;
export const DEFAULT_HEIGHT = 540;

const gameConfig: Ph.Types.Core.GameConfig = {
  title: 'Wicked Snowman',
  version: '0.3.1',
  type: Ph.WEBGL,
  backgroundColor: '#ffffff',
  disableContextMenu: true,
  fps: {
    min: 55,
    target: 60,
    smoothStep: true,
  },
  roundPixels: true,
  // pixelArt: true,
  scale: {
    parent: 'phaser-wrapper',
    mode: Ph.Scale.FIT,
    autoCenter: Ph.Scale.CENTER_BOTH,
    width: 0 || DEFAULT_WIDTH / 2,
    height: 0 || DEFAULT_HEIGHT / 2,
  },
  scene: [PreloadScene, GameScene, UIScene],
};

window.addEventListener('load', () => {
  const game = new Ph.Game(gameConfig);
});

// TODO Phaser is huge even minified. Figure out how to reduce the bundle size.

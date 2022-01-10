import 'phaser';
import GameScene from './scenes/game.scene';
import PreloadScene from './scenes/preload.scene';

const DEFAULT_WIDTH = 1920;
const DEFAULT_HEIGHT = 1080;

export const gameConfig = {
  type: Phaser.WEBGL,
  backgroundColor: '#ffffff',
  scale: {
    parent: 'phaser-wrapper',
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 0 || DEFAULT_WIDTH,
    height: 0 || DEFAULT_HEIGHT,
  },
  scene: [PreloadScene, GameScene],
};

window.addEventListener('load', () => {
  const game = new Phaser.Game(gameConfig);
});

// TODO Phaser is huge even minified. Figure out how to reduce the bundle size.
// TODO experiment with faster box2d ports. Planckjs seems like the slowest option performance wise.

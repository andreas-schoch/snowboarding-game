import {DEFAULT_HEIGHT} from '../index';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({key: 'PreloadScene'});
  }

  preload() {
    this.load.audio('theme', [
      'assets/audio/theme/theme.ogg',
      'assets/audio/theme/theme.mp3',
      'assets/audio/theme/theme.aac',
    ]);

    const size = this.game.canvas.height === DEFAULT_HEIGHT ? '960x540' : '480x270';
    this.load.image('space-back', `assets/img/bgSpace/bg-space-back-${size}.png`);
    this.load.image('space-mid', `assets/img/bgSpace/bg-space-mid-${size}.png`);
    this.load.image('space-front', `assets/img/bgSpace/bg-space-front-${size}.png`);
    this.load.image('mountain-back', `assets/img/bgLandscape/mountain-back-${size}.png`);
    this.load.image('mountain-mid', `assets/img/bgLandscape/mountain-mid-${size}.png`);

    this.load.image('rock-01', 'assets/img/rock-01.png');
    this.load.bitmapFont('atari-classic', 'assets/fonts/bitmap/atari-classic.png', 'assets/fonts/bitmap/atari-classic.xml');
  }

  create() {
    this.scene.start('GameScene');
  }
}

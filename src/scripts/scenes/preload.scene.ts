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
    this.load.atlas('atlas-backdrop', `assets/img/atlas/packed-${size}.png`, `assets/img/atlas/packed-${size}.json`);
    this.load.atlas('atlas-foliage', `assets/img/atlas/foliage.png`, `assets/img/atlas/foliage.json`);
    this.load.bitmapFont('atari-classic', 'assets/fonts/bitmap/atari-classic.png', 'assets/fonts/bitmap/atari-classic.xml');
  }

  create() {
    this.scene.start('GameScene');
  }
}

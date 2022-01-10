export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({key: 'PreloadScene'});
  }

  preload() {
    this.load.audio('theme', [
      'assets/audio/theme.ogg',
      'assets/audio/theme.aac',
      'assets/audio/theme.mp3',
    ]);
  }

  create() {
    this.scene.start('GameScene');
  }
}

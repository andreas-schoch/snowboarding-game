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

    this.load.image('space-back', 'assets/img/bgSpace/bg_space_seamless.png');
    this.load.image('space-mid', 'assets/img/bgSpace/bg_space_seamless_fl1.png');
    this.load.image('space-front', 'assets/img/bgSpace/bg_space_seamless_fl2.png');

    this.load.image('bg-landscape-3-trees', 'assets/img/bgLandscape/landscape_0002_3_trees.png');
    this.load.image('bg-landscape-4-mountain', 'assets/img/bgLandscape/landscape_0003_4_mountain.png');
  }

  create() {
    this.scene.start('GameScene');
  }
}

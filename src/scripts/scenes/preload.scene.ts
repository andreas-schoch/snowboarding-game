export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({key: 'PreloadScene'});
  }

  preload() {
    this.load.audio('nightmare', [
      'assets/audio/nightmare/nightmarechipheavy.mp3',
      'assets/audio/nightmare/nightmarechipheavy.ogg',
      'assets/audio/nightmare/nightmarechipheavy.aac',
    ]);

    this.load.image('space-back', 'assets/img/bgSpace/bg_space_seamless.png');
    this.load.image('space-mid', 'assets/img/bgSpace/bg_space_seamless_fl1.png');
    this.load.image('space-front', 'assets/img/bgSpace/bg_space_seamless_fl2.png');

    this.load.image('bg-landscape-3-trees', 'assets/img/bgLandscape/landscape_0002_3_trees.png');
    this.load.image('bg-landscape-4-mountain', 'assets/img/bgLandscape/landscape_0003_4_mountain.png');
    this.load.image('bg-landscape-5-clouds', 'assets/img/bgLandscape/landscape_0004_5_clouds.png');
  }

  create() {
    this.scene.start('GameScene');
  }
}

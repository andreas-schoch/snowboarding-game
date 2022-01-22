import * as Ph from 'phaser';
import Box2DFactory from 'box2d-wasm';
import {initBox2D} from '../index';

export default class PreloadScene extends Ph.Scene {
  box2d: typeof Box2D & EmscriptenModule;

  constructor() {
    super({key: 'PreloadScene'});
  }

  async preload() {
    // this.load.audio('theme', [
    //   'assets/audio/theme/theme.mp3',
    //   'assets/audio/theme/theme.ogg',
    //   'assets/audio/theme/theme.aac',
    // ]);

    this.load.audio('nightmare', [
      'assets/audio/nightmare/nightmarechipheavy.mp3',
      'assets/audio/nightmare/nightmarechipheavy.ogg',
      'assets/audio/nightmare/nightmarechipheavy.aac',
    ]);

    this.load.image('space-back', 'assets/img/bgSpace/bg_space_seamless.png');
    this.load.image('space-mid', 'assets/img/bgSpace/bg_space_seamless_fl1.png');
    this.load.image('space-front', 'assets/img/bgSpace/bg_space_seamless_fl2.png');

    this.load.image('bg-landscape-1-trees', 'assets/img/bgLandscape/landscape_0000_1_trees.png');
    this.load.image('bg-landscape-2-trees', 'assets/img/bgLandscape/landscape_0001_2_trees.png');
    this.load.image('bg-landscape-3-trees', 'assets/img/bgLandscape/landscape_0002_3_trees.png');
    this.load.image('bg-landscape-4-mountain', 'assets/img/bgLandscape/landscape_0003_4_mountain.png');
    this.load.image('bg-landscape-5-clouds', 'assets/img/bgLandscape/landscape_0004_5_clouds.png');
    this.load.image('bg-landscape-6-back', 'assets/img/bgLandscape/landscape_0005_6_background.png');

    console.log('before init b2')
    await initBox2D();
    // this.box2d = await Box2DFactory({locateFile: () => `/assets/Box2D.wasm`});
    console.log('After init b2', this.box2d);
  }

    create() {
    console.log('create preloadScene')
      this.scene.start('GameScene', this.box2d);
    }
  }

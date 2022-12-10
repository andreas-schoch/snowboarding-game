import {DEFAULT_HEIGHT, RESOLUTION_SCALE} from '../index';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({key: 'PreloadScene'});
  }

  preload() {
    this.load.html('dom_game_ui', 'assets/html/game_ui.html');

    this.load.audio('riverside_ride', [
      'assets/audio/riverside_ride/riverside_ride.ogg',
      'assets/audio/riverside_ride/riverside_ride.mp3',
    ]);

    // TODO convert wav to ogg, mp3 and aac
    this.load.audio('boink', [
      'assets/audio/sfx/boink.wav',
    ]);

    this.load.audio('pickup_present', [
      'assets/audio/sfx/pickupgem.wav',
    ]);

    this.load.audio('death', [
      'assets/audio/sfx/death2.ogg',
    ]);

        this.load.audio('grunt', [
      'assets/audio/sfx/grunt.wav',
    ]);

    this.load.json('santa', 'assets/santa-v01.json');

    const height = DEFAULT_HEIGHT * RESOLUTION_SCALE;
    const closestSize = [360, 540, 720].reduce((prev, curr) => Math.abs(curr - height) < Math.abs(prev - height) ? curr : prev);
    const sizes = {360: '640x360',540: '960x540',720: '1280x720'};
    this.load.atlas('bg_space_pack', `assets/img/packed/bg_space_${sizes[closestSize]}.png`, `assets/img/packed/bg_space_${sizes[closestSize]}.json`);

    // TODO create packed for everything needed
    this.load.image('ice_spikes', 'assets/img/obstacles/ice_spikes.png');
    this.load.image('snowy_rock', 'assets/img/obstacles/snowy_rock.png');
    this.load.image('present_temp', 'assets/img/present_temp.png');
    this.load.image('tree_01.png', 'assets/img/svgsilh/tree_01.png');
    this.load.image('cottage2.png', 'assets/img/svgsilh/cottage2.png');
    this.load.image('santa-board.png', 'assets/img/santa_parts_v01/santa-board.png');

    this.load.atlas('atlas-santa', `assets/img/packed/character-santa.png`, `assets/img/packed/character-santa.json`);
    this.load.bitmapFont('atari-classic', 'assets/fonts/bitmap/atari-classic.png', 'assets/fonts/bitmap/atari-classic.xml');
  }

  create() {
    this.scene.start('GameScene');
  }
}
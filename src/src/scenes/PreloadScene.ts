import {DEFAULT_HEIGHT, RESOLUTION_SCALE} from '../index';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({key: 'PreloadScene'});
  }

  preload() {
    this.loadAudio();
    this.loadImg();
    this.loadLevels();
    this.load.html('dom_game_ui', 'assets/html/game_ui.html');
  }

  create() {
    this.scene.start('GameScene');
  }

  private loadAudio() {
    this.load.audio('riverside_ride', [
      'assets/audio/riverside_ride/riverside_ride.ogg',
      'assets/audio/riverside_ride/riverside_ride.mp3',
    ]);
    this.load.audio('boink', [
      'assets/audio/sfx/jump/boink.ogg',
      'assets/audio/sfx/jump/boink.mp3',
    ]);
    this.load.audio('pickup_present', [
      'assets/audio/sfx/pickup/pickupgem.ogg',
      'assets/audio/sfx/pickup/pickupgem.mp3',
    ]);
    this.load.audio('death', [
      'assets/audio/sfx/crash/death.ogg',
      'assets/audio/sfx/crash/death.mp3',
    ]);
    this.load.audio('grunt', [
      'assets/audio/sfx/crash_grunt/grunt.ogg',
      'assets/audio/sfx/crash_grunt/grunt.mp3',
    ]);
  }

  private loadImg() {
    const height = DEFAULT_HEIGHT * RESOLUTION_SCALE;
    const closestSize = [360, 540, 720].reduce((prev, curr) => Math.abs(curr - height) < Math.abs(prev - height) ? curr : prev);
    const sizes = {360: '640x360', 540: '960x540', 720: '1280x720'};
    this.load.atlas('bg_space_pack', `assets/img/packed/bg_space_${sizes[closestSize]}.png`, `assets/img/packed/bg_space_${sizes[closestSize]}.json`);

    // TODO create packed for everything needed
    this.load.image('ice_spikes', 'assets/img/obstacles/ice_spikes.png');
    this.load.image('snowy_rock', 'assets/img/obstacles/snowy_rock.png');
    this.load.image('present_temp', 'assets/img/present_temp.png');
    this.load.image('tree_01.png', 'assets/img/svgsilh/tree_01.png');
    this.load.image('cottage.png', 'assets/img/svgsilh/cottage.png');
    this.load.image('santa-board.png', 'assets/img/santa_parts_v01/santa-board.png');

    this.load.atlas('atlas-santa', `assets/img/packed/character-santa.png`, `assets/img/packed/character-santa.json`);
  }

  private loadLevels() {
    // this.load.json('santa', 'assets/levels/santa-v01.json');
    this.load.json('santa', 'assets/levels/santa-v01.json');
  }
}

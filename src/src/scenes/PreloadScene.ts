import { BackgroundMusicKeys, CharacterKeys, DEFAULT_HEIGHT, LEVELS, LevelKeys, RESOLUTION_SCALE, SceneKeys } from '../index';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.PRELOAD_SCENE });
  }

  preload() {
    this.loadAudio();
    this.loadImg();
    this.loadLevels();
    this.load.html('dom_game_ui', 'assets/html/game_ui.html');
  }
  
  create() {
    this.scene.start(SceneKeys.GAME_SCENE);
  }
  
  private loadAudio() {
    Object.values(BackgroundMusicKeys).forEach(key => this.load.audio(key, `assets/audio/music/${key}.mp3`)); 
    this.load.audio('boink', 'assets/audio/sfx/jump/boink.mp3');
    this.load.audio('pickup_present', 'assets/audio/sfx/pickup/pickup_coins.wav');
    this.load.audio('death', 'assets/audio/sfx/crash/death.mp3');
    this.load.audio('grunt', 'assets/audio/sfx/crash_grunt/grunt.mp3');
    this.load.audio('applause', 'assets/audio/sfx/applause/applause.mp3');
    this.load.audio('game_over_demon', 'assets/audio/sfx/game_over_demon/game_over_demon.mp3');
    this.load.audio('snowboard_slide_04', 'assets/audio/sfx/nox_sound/snowboard_slide_loop_04.mp3');
    this.load.audio('wind', 'assets/audio/sfx/wind/wind-seamless-02.mp3');
  }
  
  private loadImg() {
    const height = DEFAULT_HEIGHT * RESOLUTION_SCALE;
    const closestSize = [360, 540, 720].reduce((prev, curr) => Math.abs(curr - height) < Math.abs(prev - height) ? curr : prev);
    const size = { 360: '640x360', 540: '960x540', 720: '1280x720' }[closestSize];
    this.load.atlas('bg_space_pack', `assets/img/packed/bg_space_${size}.png`, `assets/img/packed/bg_space_${size}.json`);
    this.load.atlas('atlas_santa', `assets/img/packed/character_santa_${size}.png`, `assets/img/packed/character_santa_${size}.json`);
    this.load.atlas('atlas_environment', `assets/img/packed/environment_${size}.png`, `assets/img/packed/environment_${size}.json`);
  }

  private loadLevels() {
    // Character itself is currently imported by levels themselves (as RUBE Object) but will be loaded separately once game allows character selection
    // (e.g. Santa clause, Mrs. Clause, Snowman, Easter Bunny, The Hoff etc.)
    this.load.json(CharacterKeys.character_santa_old, `assets/levels/export/${CharacterKeys.character_santa_old}.json`);
    this.load.json(CharacterKeys.character_santa, `assets/levels/export/${CharacterKeys.character_santa}.json`);

    LEVELS.forEach(level => this.load.json(level, `assets/levels/export/${level}.json`));
  }
}

import sfxApplause from '../../assets/audio/sfx/applause/applause.mp3';
import sfxDeath from '../../assets/audio/sfx/crash/death.mp3';
import sfxGrunt from '../../assets/audio/sfx/crash_grunt/grunt.mp3';
import sfxGameOverDemon from '../../assets/audio/sfx/game_over_demon/game_over_demon.mp3';
import sfxSnowboardSlide04 from '../../assets/audio/sfx/nox_sound/snowboard_slide_loop_04.mp3';
import sfxPickupCoins from '../../assets/audio/sfx/pickup/pickup_coins.wav';
import sfxWind from '../../assets/audio/sfx/wind/wind-seamless-02.mp3';
import {Settings} from '../Settings';
import {BackgroundMusicKeys} from '../SoundManager';
import {SCENE_EDITOR, SCENE_GAME, SCENE_PRELOAD} from '../index';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({key: SCENE_PRELOAD});
  }

  preload() {
    this.loadAudio();
    this.loadImg();

    this.load.binary('coin.rube', 'assets/levels/prefabs/coin.bin');
    this.load.binary('cane.rube', 'assets/levels/prefabs/cane.bin');
    this.load.binary('rock.rube', 'assets/levels/prefabs/rock.bin');
    this.load.binary('crate.rube', 'assets/levels/prefabs/crate.bin');
    this.load.binary('plank.rube', 'assets/levels/prefabs/plank.bin');
    this.load.binary('character_v02.rube', 'assets/levels/character_v02.bin');
  }

  create() {
    const editorOpen = Settings.editorOpen();
    this.scene.start(editorOpen ? SCENE_EDITOR : SCENE_GAME);
  }

  private loadAudio() {
    Object.values(BackgroundMusicKeys).forEach(key => this.load.audio(key, `assets/audio/music/${key}.mp3`));
    this.load.audio('pickup_present', sfxPickupCoins);
    this.load.audio('death', sfxDeath);
    this.load.audio('grunt', sfxGrunt);
    this.load.audio('applause', sfxApplause);
    this.load.audio('game_over_demon', sfxGameOverDemon);
    this.load.audio('snowboard_slide_04', sfxSnowboardSlide04);
    this.load.audio('wind', sfxWind);
  }

  private loadImg() {
    const height = Settings.heightScaled();
    const closestSize = [360, 540, 720].reduce((prev, curr) => Math.abs(curr - height) < Math.abs(prev - height) ? curr : prev);
    const size = {360: '640x360', 540: '960x540', 720: '1280x720'}[closestSize];
    this.load.atlas('atlas_environment', `assets/img/packed/environment_${size}.png`, `assets/img/packed/environment_${size}.json`);
    this.load.atlas('bg_space_pack', `assets/img/packed/bg_space_${size}.png`, `assets/img/packed/bg_space_${size}.json`);
    const characterSkin = Settings.selectedCharacterSkin();
    this.load.atlas(characterSkin, `assets/img/packed/${characterSkin}_${size}.png`, `assets/img/packed/${characterSkin}_${size}.json`);
  }
}

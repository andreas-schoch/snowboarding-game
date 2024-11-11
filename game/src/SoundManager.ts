import {GameInfo} from './GameInfo';
import {PersistedStore} from './PersistedStore';
import {ENTER_CRASHED, ENTER_IN_AIR, LEVEL_FINISH, COLLECT_COIN, WIND_SPEED_CHANGE, SURFACE_IMPACT, RESTART_GAME, SET_PAUSE_GAME} from './eventTypes';
import {IScore} from './pocketbase/types';
import {GameScene} from './scenes/GameScene';

export class SoundManager {
  private music?: Phaser.Sound.BaseSound;
  private sfx_pickup_present: Phaser.Sound.BaseSound;
  private sfx_death: Phaser.Sound.BaseSound | undefined;
  private sfx_grunt: Phaser.Sound.BaseSound | undefined;
  private sfx_applause: Phaser.Sound.BaseSound | undefined;
  private sfx_game_over_demon: Phaser.Sound.BaseSound | undefined;
  private sfx_windNoise: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound | undefined;
  private sfx_snowboardSlide: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound | undefined;

  musicWasPlaying = false;
  sfxSlideWasPlaying = false;
  sfxWindWasPlaying = false;

  constructor(private scene: GameScene) {
    const sfxVolume = PersistedStore.volumeSfx() / 100;
    this.sfx_pickup_present = this.scene.sound.add('pickup_present', {detune: 0, rate: 1, volume: sfxVolume * 0.6});

    this.initListeners();
    const randomMusicKey = Object.values(BackgroundMusicKeys)[Math.floor(Math.random() * Object.values(BackgroundMusicKeys).length)];
    this.initSfx();
    this.initMusic(randomMusicKey);
  }

  initMusic(key: BackgroundMusicKey) {
    const musicVolume = PersistedStore.volumeMusic() / 100;
    if (musicVolume === 0) return;
    if (this.music !== undefined) return;

    if (this.scene.cache.audio.exists(key)) {
      this.music = this.scene.sound.add(key, {loop: true, volume: musicVolume * 0.3, rate: 1, delay: 1, detune: 0});
      this.music.play();
      return;
    } else setTimeout(() => this.scene.load.audio(key, `assets/audio/music/${key}.mp3`).start(), 100);
  }

  initSfx() {
    setTimeout(() => {
      const sfxVolume = PersistedStore.volumeSfx() / 100;

      if (this.scene.cache.audio.exists('death')) this.sfx_death = this.scene.sound.add('death', {detune: 700, rate: 1.25, volume: sfxVolume * 0.8});
      else this.scene.load.audio('death', 'assets/audio/sfx/crash/death.mp3');

      if (this.scene.cache.audio.exists('grunt')) this.sfx_grunt = this.scene.sound.add('grunt', {detune: 400, rate: 1.25, volume: sfxVolume * 0.5});
      else this.scene.load.audio('grunt', 'assets/audio/sfx/crash_grunt/grunt.mp3');

      if (this.scene.cache.audio.exists('game_over_demon')) this.sfx_game_over_demon = this.scene.sound.add('game_over_demon', {detune: 0, rate: 0.95, volume: 0.05});
      else this.scene.load.audio('game_over_demon', 'assets/audio/sfx/game_over_demon/game_over_demon.mp3');

      if (this.scene.cache.audio.exists('applause')) this.sfx_applause = this.scene.sound.add('applause', {detune: 0, rate: 1, volume: sfxVolume * 0.6});
      else this.scene.load.audio('applause', 'assets/audio/sfx/applause/applause.mp3');

      if (this.scene.cache.audio.exists('snowboard_slide_04')) {
        this.sfx_snowboardSlide = this.scene.sound.add('snowboard_slide_04', {loop: true, volume: 0.03, rate: 1, delay: 0, detune: 1000});
        this.sfx_snowboardSlide.play();
        this.sfxSlideWasPlaying = true;
      } else this.scene.load.audio('snowboard_slide_04', 'assets/audio/sfx/nox_sound/snowboard_slide_loop_04.mp3');

      if (this.scene.cache.audio.exists('wind')) {
        this.sfx_windNoise = this.scene.sound.add('wind', {loop: true, volume: 0.02, rate: 1, delay: 0, detune: 0});
        this.sfx_windNoise.play();
        this.sfxWindWasPlaying = true;
      } else this.scene.load.audio('wind', 'assets/audio/sfx/wind/wind-seamless-02.mp3');

      if (this.scene.cache.audio.exists('pickup_present')) this.sfx_pickup_present = this.scene.sound.add('pickup_present', {detune: 0, rate: 1, volume: sfxVolume * 0.6});
      else this.scene.load.audio('pickup_present', 'assets/audio/sfx/pickup/pickup_coins.mp3');
    }, 50);
  }

  private initListeners() {
    this.musicWasPlaying = true;
    this.sfxSlideWasPlaying = true;
    this.sfxWindWasPlaying = true;
    GameInfo.observer.on(SET_PAUSE_GAME, (isPaused: boolean) => {
      if (!this.sfx_snowboardSlide || !this.sfx_windNoise) return;
      if (isPaused) {
        this.musicWasPlaying = this.music !== undefined && this.music.isPlaying;
        this.sfxSlideWasPlaying = this.sfx_snowboardSlide.isPlaying;
        this.sfxWindWasPlaying = this.sfx_windNoise.isPlaying;
        if (this.musicWasPlaying) this.music?.pause();
        if (this.sfxSlideWasPlaying) this.sfx_snowboardSlide.pause();
        if (this.sfxWindWasPlaying) this.sfx_windNoise.pause();
      } else {
        if (this.musicWasPlaying) this.music?.resume();
        if (this.sfxSlideWasPlaying) this.sfx_snowboardSlide.resume();
        if (this.sfxWindWasPlaying) this.sfx_windNoise.resume();
      }
    });

    GameInfo.observer.on(COLLECT_COIN, () => this.sfx_pickup_present.play());
    GameInfo.observer.on(ENTER_CRASHED, (score: IScore, id: string) => {
      if (id !== GameInfo.possessedCharacterId) return;
      this.sfx_death?.play();
      this.sfx_grunt?.play();
      this.sfx_game_over_demon?.play();
      this.scene.tweens.add({
        targets: this.music,
        volume: 0.0,
        detune: -500,
        rate: 0.5,
        duration: 750,
        onComplete: async () => this.music?.stop,
      });
    });

    GameInfo.observer.on(LEVEL_FINISH, (score: IScore, isCrashed: boolean) => {
      if (isCrashed) return;
      this.sfx_applause?.play();
      this.scene.tweens.add({
        targets: this.music,
        duration: 2000,
        volume: 0,
        onComplete: async () => this.music?.stop(),
      });
    });

    GameInfo.observer.on(SURFACE_IMPACT, (impulse: number, type: string, tailOrNose: boolean, center: boolean) => {
      if (!this.sfx_snowboardSlide) return;
      // TODO improve. Needs sound for other surface types (e.g. ice, snow, rock, etc.)
      const maxImpulse = 12;
      const target = center ? 0 : 1200;
      const lerpFactor = 0.7;
      const currentDetune = this.sfx_snowboardSlide.detune;
      const newDetune = currentDetune + lerpFactor * (target - currentDetune);
      this.sfx_snowboardSlide?.setDetune(newDetune);
      const sfxVolume = PersistedStore.volumeSfx() / 100;
      const percentage = Math.min(impulse / maxImpulse, 1) * sfxVolume * 0.5;
      const volume = Math.max(Math.min(percentage, 1), 0.2);
      this.sfx_snowboardSlide?.setVolume(volume);
    });

    GameInfo.observer.on(ENTER_IN_AIR, () => {
      this.scene.add.tween({
        targets: this.sfx_snowboardSlide,
        volume: 0.03,
        ease: 'Linear',
        duration: 250,
        onComplete: () => this.sfx_snowboardSlide?.setDetune(0)
      });
    });

    GameInfo.observer.on(WIND_SPEED_CHANGE, (ratio: number) => {
      this.sfx_windNoise?.setVolume(Math.min(Math.max(ratio * 0.3, 0.02), 0.5));
      this.sfx_windNoise?.setRate(Math.min(Math.max(ratio * 1.5, 0.5), 1.5));
    });

    GameInfo.observer.on(RESTART_GAME, () => {
      this.music?.destroy();
      this.sfx_game_over_demon?.destroy();
      this.sfx_applause?.destroy();
      this.sfx_snowboardSlide?.destroy();
      this.sfx_windNoise?.destroy();
      this.sfx_pickup_present?.destroy();
      this.sfx_death?.destroy();
      this.sfx_grunt?.destroy();
    });

    this.scene.load.on('filecomplete', (key: string) => {
      const sfxVolume = PersistedStore.volumeSfx() / 100;
      switch (key) {
      case 'KevinMacLeod/Continue Life':
      case 'KevinMacLeod/Heartbreaking':
      case 'KevinMacLeod/Rains Will Fall':
      case 'KevinMacLeod/Sad Trio':
      case 'KevinMacLeod/Stages of Grief':
        this.music = this.scene.sound.add(key, {loop: true, volume: (PersistedStore.volumeMusic() / 100) * 0.3, rate: 1, delay: 1, detune: 0});
        this.music.play();
        break;
      case 'death':
        this.sfx_death = this.scene.sound.add('death', {detune: 700, rate: 1.25, volume: sfxVolume * 0.8});
        break;
      case 'grunt':
        this.sfx_grunt = this.scene.sound.add('grunt', {detune: 400, rate: 1.25, volume: sfxVolume * 0.5});
        break;
      case 'applause':
        this.sfx_applause = this.scene.sound.add('applause', {detune: 0, rate: 1, volume: sfxVolume * 0.6});
        break;
      case 'game_over_demon':
        this.sfx_game_over_demon = this.scene.sound.add('game_over_demon', {detune: 0, rate: 0.95, volume: 0.05});
        break;
      case 'snowboard_slide_04':
        this.sfx_snowboardSlide = this.scene.sound.add('snowboard_slide_04', {loop: true, volume: 0.03, rate: 1, delay: 0, detune: 1000});
        this.sfx_snowboardSlide.play();
        this.sfxSlideWasPlaying = true;
        break;
      case 'wind':
        this.sfx_windNoise = this.scene.sound.add('wind', {loop: true, volume: 0.02, rate: 1, delay: 0, detune: 0});
        this.sfx_windNoise.play();
        this.sfxWindWasPlaying = true;
        break;
      case 'pickup_present':
        this.sfx_pickup_present = this.scene.sound.add('pickup_present', {detune: 0, rate: 1, volume: sfxVolume * 0.6});
        break;
      default:
        throw new Error(`Unknown sfx key: ${key}`);
      }
    });
  }
}

export const BackgroundMusicKeys = {
  ContinueLife: 'KevinMacLeod/Continue Life',
  Heartbreaking: 'KevinMacLeod/Heartbreaking',
  RainsWillFall: 'KevinMacLeod/Rains Will Fall',
  SadTrio: 'KevinMacLeod/Sad Trio',
  StagesOfGrief: 'KevinMacLeod/Stages of Grief',
} as const;

type BackgroundMusicKey = typeof BackgroundMusicKeys[keyof typeof BackgroundMusicKeys];

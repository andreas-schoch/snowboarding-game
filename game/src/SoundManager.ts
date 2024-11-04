import {GameInfo} from './GameInfo';
import {PersistedStore} from './PersistedStore';
import {ENTER_CRASHED, ENTER_IN_AIR, LEVEL_FINISH, COLLECT_COIN, WIND_SPEED_CHANGE, SURFACE_IMPACT, RESTART_GAME, SET_PAUSE_GAME} from './eventTypes';
import {IScore} from './pocketbase/types';
import {GameScene} from './scenes/GameScene';

export class SoundManager {
  private music?: Phaser.Sound.BaseSound;
  private sfx_pickup_present: Phaser.Sound.BaseSound;
  private sfx_death: Phaser.Sound.BaseSound;
  private sfx_grunt: Phaser.Sound.BaseSound;
  private sfx_applause: Phaser.Sound.BaseSound;
  private sfx_game_over_demon: Phaser.Sound.BaseSound;

  private sfx_windNoise: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
  private sfx_snowboardSlide: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;

  constructor(private scene: GameScene) {
    const randomMusicKey = Object.values(BackgroundMusicKeys)[Math.floor(Math.random() * Object.values(BackgroundMusicKeys).length)];
    this.playMusic(randomMusicKey);
    const sfxVolume = PersistedStore.volumeSfx() / 100;
    this.sfx_pickup_present = this.scene.sound.add('pickup_present', {detune: 0, rate: 1, volume: sfxVolume * 0.6});
    this.sfx_death = this.scene.sound.add('death', {detune: 700, rate: 1.25, volume: sfxVolume * 0.8});
    this.sfx_grunt = this.scene.sound.add('grunt', {detune: 400, rate: 1.25, volume: sfxVolume * 0.5});
    this.sfx_applause = this.scene.sound.add('applause', {detune: 0, rate: 1, volume: sfxVolume * 0.6});
    this.sfx_game_over_demon = this.scene.sound.add('game_over_demon', {detune: 0, rate: 0.95, volume: 0.05});
    this.sfx_snowboardSlide = this.scene.sound.add('snowboard_slide_04', {loop: true, volume: 0.03, rate: 1, delay: 0, detune: 1000});
    this.sfx_windNoise = this.scene.sound.add('wind', {loop: true, volume: 0.02, rate: 1, delay: 0, detune: 0});
    this.sfx_snowboardSlide.play();
    this.sfx_windNoise.play();
    this.initListeners();
  }

  playMusic(key: BackgroundMusicKey) {
    const musicVolume = PersistedStore.volumeMusic() / 100;
    if (musicVolume === 0) return;
    if (this.music !== undefined) return;

    if (this.scene.cache.audio.exists(key)) {
      console.debug('Music already loaded:', key);
      this.music = this.scene.sound.add(key, {loop: true, volume: musicVolume * 0.3, rate: 1, delay: 1, detune: 0});
      this.music.play();
      return;
    }

    setTimeout(() => {
      const songLoader = this.scene.load.audio(key, `assets/audio/music/${key}.mp3`);
      songLoader.on('filecomplete', () => {
        console.debug('Music loaded:'),
        this.music = this.scene.sound.add(key, {loop: true, volume: musicVolume * 0.3, rate: 1, delay: 1, detune: 0});
        this.music.play();
      });
      songLoader.start();
    }, 50);
  }

  private initListeners() {
    let musicWasPlaying = true;
    let sfxSlideWasPlaying = true;
    let sfxWindWasPlaying = true;
    GameInfo.observer.on(SET_PAUSE_GAME, (isPaused: boolean) => {
      if (isPaused) {
        musicWasPlaying = this.music !== undefined && this.music.isPlaying;
        sfxSlideWasPlaying = this.sfx_snowboardSlide.isPlaying;
        sfxWindWasPlaying = this.sfx_windNoise.isPlaying;
        if (musicWasPlaying) this.music?.pause();
        if (sfxSlideWasPlaying) this.sfx_snowboardSlide.pause();
        if (sfxWindWasPlaying) this.sfx_windNoise.pause();
      } else {
        if (musicWasPlaying) this.music?.resume();
        if (sfxSlideWasPlaying) this.sfx_snowboardSlide.resume();
        if (sfxWindWasPlaying) this.sfx_windNoise.resume();
      }
    });

    GameInfo.observer.on(COLLECT_COIN, () => this.sfx_pickup_present.play());
    GameInfo.observer.on(ENTER_CRASHED, (score: IScore, id: string) => {
      if (id !== GameInfo.possessedCharacterId) return;
      this.sfx_death.play();
      this.sfx_grunt.play();
      this.sfx_game_over_demon.play();
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
      this.sfx_applause.play();
      this.scene.tweens.add({
        targets: this.music,
        duration: 2000,
        volume: 0,
        onComplete: async () => this.music?.stop(),
      });
    });

    GameInfo.observer.on(SURFACE_IMPACT, (impulse: number, type: string, tailOrNose: boolean, center: boolean) => {
      // TODO improve. Needs sound for other surface types (e.g. ice, snow, rock, etc.)
      const maxImpulse = 12;
      const target = center ? 0 : 1200;
      const lerpFactor = 0.7;
      const currentDetune = this.sfx_snowboardSlide.detune;
      const newDetune = currentDetune + lerpFactor * (target - currentDetune);
      this.sfx_snowboardSlide.setDetune(newDetune);
      const sfxVolume = PersistedStore.volumeSfx() / 100;
      const percentage = Math.min(impulse / maxImpulse, 1) * sfxVolume * 0.5;
      const volume = Math.max(Math.min(percentage, 1), 0.2);
      this.sfx_snowboardSlide.setVolume(volume);
    });

    GameInfo.observer.on(ENTER_IN_AIR, () => {
      this.scene.add.tween({
        targets: this.sfx_snowboardSlide,
        volume: 0.03,
        ease: 'Linear',
        duration: 250,
        onComplete: () => this.sfx_snowboardSlide.setDetune(0)
      });
    });

    GameInfo.observer.on(WIND_SPEED_CHANGE, (ratio: number) => {
      this.sfx_windNoise.setVolume(Math.min(Math.max(ratio * 0.3, 0.02), 0.5));
      this.sfx_windNoise.setRate(Math.min(Math.max(ratio * 1.5, 0.5), 1.5));
    });

    GameInfo.observer.on(RESTART_GAME, () => {
      this.music?.destroy();
      this.sfx_game_over_demon.destroy();
      this.sfx_applause.destroy();
      this.sfx_snowboardSlide.destroy();
      this.sfx_windNoise.destroy();
      this.sfx_pickup_present.destroy();
      this.sfx_death.destroy();
      this.sfx_grunt.destroy();
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

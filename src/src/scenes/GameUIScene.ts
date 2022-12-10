import * as Ph from 'phaser';
import {DEFAULT_WIDTH, SETTINGS_KEY_RESOLUTION, SETTINGS_KEY_VOLUME_MUSIC, SETTINGS_KEY_VOLUME_SFX} from '../index';


enum PanelIds {
  PANEL_PAUSE_MENU = 'panel-pause-menu',
  PANEL_SELECT_LEVEL = 'panel-select-level',
  PANEL_LEADERBOARDS = 'panel-leaderboards',
  PANEL_SETTINGS = 'panel-settings',
  PANEL_CREDITS = 'panel-credits',
  PANEL_YOUR_SCORE = 'panel-your-score',
  NONE = 'none',
}


enum HudIds {
  HUD_DISTANCE = 'hud-distance',
  HUD_COMBO = 'hud-combo',
  HUD_SCORE = 'hud-score',
}


export default class GameUIScene extends Ph.Scene {
  private observer: Phaser.Events.EventEmitter;
  private restartGame: () => void;

  private music: Phaser.Sound.BaseSound;
  private sfx_jump_start: Phaser.Sound.BaseSound;
  private sfx_pickup_present: Phaser.Sound.BaseSound;
  private sfx_death: Phaser.Sound.BaseSound;
  private sfx_grunt: Phaser.Sound.BaseSound;

  private comboLeewayChart: Ph.GameObjects.Graphics;
  private resolutionMod: number;

  private panels: HTMLElement[] = [];
  private panelPauseMenu: HTMLElement | null;
  private panelLeaderboards: HTMLElement | null;
  private panelSelectLevel: HTMLElement | null;
  private panelSettings: HTMLElement | null;
  private panelCredits: HTMLElement | null;
  private panelYourScore: HTMLElement | null;

  private hudDistance: HTMLElement | null;
  private hudCombo: HTMLElement | null;
  private hudScore: HTMLElement | null;

  constructor() {
    super({key: 'GameUIScene'});

  }

  init([observer, restartGameCB]: [Ph.Events.EventEmitter, () => void]) {
    this.observer = observer;
    this.restartGame = restartGameCB;
    this.resolutionMod = this.game.canvas.width / DEFAULT_WIDTH;
  }

  create() {
    const musicVolume = Number(localStorage.getItem(SETTINGS_KEY_VOLUME_MUSIC) || 80) / 100;
    this.music = this.sound.add('riverside_ride', {loop: true, volume: musicVolume * 0.5, rate: 0.95, delay: 1, detune: 0});
    this.music.play();
    const sfxVolume = Number(localStorage.getItem(SETTINGS_KEY_VOLUME_SFX) || 80) / 100;
    this.sfx_jump_start = this.sound.add('boink', {detune: -200, volume: sfxVolume});
    this.sfx_pickup_present = this.sound.add('pickup_present', {detune: 100, rate: 1.1, volume: sfxVolume});
    this.sfx_death = this.sound.add('death', {detune: 700, rate: 1.25, volume: sfxVolume});
    this.sfx_grunt = this.sound.add('grunt', {detune: 700, rate: 1.25, volume: sfxVolume * 0.6});

    const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

    this.initDomUi();
    this.setPanelVisibility(PanelIds.NONE);

    this.observer.on('toggle_pause', (paused) => {
      console.log('------toggle pause', this.panelPauseMenu?.classList);
      paused
        ? this.setPanelVisibility(PanelIds.PANEL_PAUSE_MENU)
        : this.setPanelVisibility(PanelIds.NONE);
    });
    this.observer.on('jump_start', () => this.sfx_jump_start.play({delay: 0.1}));
    this.observer.on('pickup_present', total => this.sfx_pickup_present.play());
    this.observer.on('combo-change', (accumulated, multiplier) => {
      if (this.hudCombo) this.hudCombo.innerText = accumulated ? (accumulated + 'x' + multiplier) : '-';
    });
    this.observer.on('score-change', score => {
      if (this.hudScore) this.hudScore.innerText = score;
    });
    this.observer.on('distance-change', distance => {
      if (this.hudDistance) this.hudDistance.innerText = String(distance) + 'm';
    });

    this.comboLeewayChart = this.add.graphics();
    this.observer.on('combo-leeway-update', (value) => {
      this.comboLeewayChart
      .clear()
      .fillStyle(0xffffff)
      .slice(screenCenterX, 72 * this.resolutionMod, 12 * this.resolutionMod, value, Math.PI * 1.5)
      .fillPath();
    });

    this.observer.on('enter-crashed', (distance: number, coins: number, trickScore: number, bestCombo: string, total: number) => {
      this.sfx_death.play();
      this.sfx_grunt.play();
      this.tweens.add({
        targets: this.music,
        volume: 0.0,
        detune: -500,
        rate: 0.5,
        duration: 2000,
        onComplete: tween => {
          this.music.stop();
          this.updateYourScorePanelData(distance, coins, trickScore, bestCombo, total);
          this.setPanelVisibility(PanelIds.PANEL_YOUR_SCORE);
        },
      });
    });
  }

  update() {
  }

  private initDomUi(): Ph.GameObjects.DOMElement {
    const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

    const element = this.add.dom(screenCenterX, screenCenterY).createFromCache('dom_game_ui');
    element.setScale(this.resolutionMod).addListener('click');

    const val = localStorage.getItem(SETTINGS_KEY_RESOLUTION) || '1';
    const radios: HTMLInputElement[] = Array.from(document.querySelectorAll('#settings-form input[name="resolution"]'));
    console.log('--------------settings page', val, radios);
    for (const radio of radios) if (radio.value === val) radio.checked = true;
    const valVolumeMusic = localStorage.getItem(SETTINGS_KEY_VOLUME_MUSIC) || '80';
    const inputVolumeMusic: HTMLInputElement | null = document.querySelector('#settings-form input[name="volumeMusic"]');
    if (inputVolumeMusic) inputVolumeMusic.value = valVolumeMusic;
    const valVolumeSfx = localStorage.getItem(SETTINGS_KEY_VOLUME_SFX) || '80';
    const inputVolumeSfx: HTMLInputElement | null = document.querySelector('#settings-form input[name="volumeSfx"]');
    if (inputVolumeSfx) inputVolumeSfx.value = valVolumeSfx;

    this.panelPauseMenu = document.getElementById(PanelIds.PANEL_PAUSE_MENU);
    this.panelSelectLevel = document.getElementById(PanelIds.PANEL_SELECT_LEVEL);
    this.panelLeaderboards = document.getElementById(PanelIds.PANEL_LEADERBOARDS);
    this.panelSettings = document.getElementById(PanelIds.PANEL_SETTINGS);
    this.panelCredits = document.getElementById(PanelIds.PANEL_CREDITS);
    this.panelYourScore = document.getElementById(PanelIds.PANEL_YOUR_SCORE);

    this.hudDistance = document.getElementById(HudIds.HUD_DISTANCE);
    this.hudCombo = document.getElementById(HudIds.HUD_COMBO);
    this.hudScore = document.getElementById(HudIds.HUD_SCORE);

    if (!this.panelPauseMenu) throw new Error('panelPauseMenu not found');
    if (!this.panelSelectLevel) throw new Error('panelSelectLevel not found');
    if (!this.panelLeaderboards) throw new Error('panelLeaderboards not found');
    if (!this.panelSettings) throw new Error('panelSettings not found');
    if (!this.panelCredits) throw new Error('panelCredits not found');
    if (!this.panelYourScore) throw new Error('panelYourScore not found');

    if (!this.hudDistance) throw new Error('hudDistance not found');
    if (!this.hudCombo) throw new Error('hudCombo not found');
    if (!this.hudScore) throw new Error('hudScore not found');

    this.panels = [
      this.panelPauseMenu,
      this.panelSelectLevel,
      this.panelLeaderboards,
      this.panelSettings,
      this.panelCredits,
      this.panelYourScore,
    ];

    element.on('click', (evt) => {
        switch (evt.target.id) {
          case 'btn-goto-pause-menu': {
            this.setPanelVisibility(PanelIds.PANEL_PAUSE_MENU);
            break;
          }
          case 'btn-resume-game': {
            this.setPanelVisibility(PanelIds.NONE);
            this.observer.emit('resume-game');
            break;
          }
          case 'btn-goto-select-level': {
            this.setPanelVisibility(PanelIds.PANEL_SELECT_LEVEL);
            break;
          }
          case 'btn-goto-leaderboards': {
            this.setPanelVisibility(PanelIds.PANEL_LEADERBOARDS);
            break;
          }
          case 'btn-goto-settings': {
            this.setPanelVisibility(PanelIds.PANEL_SETTINGS);
            break;
          }
          case 'btn-goto-credits': {
            this.setPanelVisibility(PanelIds.PANEL_CREDITS);
            break;
          }
          case 'btn-save-settings': {
            evt.preventDefault();
            const settingsForm = this.panelSettings?.querySelector('form');
            if (settingsForm) {
              localStorage.setItem(SETTINGS_KEY_RESOLUTION, settingsForm.resolution.value || '1');
              localStorage.setItem(SETTINGS_KEY_VOLUME_MUSIC, settingsForm.volumeMusic.value);
              localStorage.setItem(SETTINGS_KEY_VOLUME_SFX, settingsForm.volumeSfx.value);
              location.reload();
            }
            break;
          }
          case 'btn-play-again': {
            this.playAgain();
            break;
          }
          default: {
            console.log('--------clicked default invalid target id', evt.target.id);
          }

        }
      },
    );

    return element;

  }

  private initDomSettings(): Ph.GameObjects.DOMElement {
    const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

    const element = this.add.dom(screenCenterX, screenCenterY).createFromCache('settings_form');
    element.setScale(this.resolutionMod).addListener('click');

    const val = localStorage.getItem(SETTINGS_KEY_RESOLUTION) || '1';
    const radios: HTMLInputElement[] = Array.from(document.querySelectorAll('#settings-form input[name="resolution"]'));
    console.log('--------------settings page', val, radios);
    for (const radio of radios) if (radio.value === val) radio.checked = true;

    const valVolumeMusic = localStorage.getItem(SETTINGS_KEY_VOLUME_MUSIC) || '80';
    const inputVolumeMusic: HTMLInputElement | null = document.querySelector('#settings-form input[name="volumeMusic"]');
    if (inputVolumeMusic) inputVolumeMusic.value = valVolumeMusic;

    const valVolumeSfx = localStorage.getItem(SETTINGS_KEY_VOLUME_SFX) || '80';
    const inputVolumeSfx: HTMLInputElement | null = document.querySelector('#settings-form input[name="volumeSfx"]');
    if (inputVolumeSfx) inputVolumeSfx.value = valVolumeSfx;

    element.on('click', (evt) => {
      if (evt.target.id === 'settings-form-save') {
        evt.preventDefault();
        const settingsForm = document.forms.namedItem('settings-form');
        if (settingsForm) {
          const resolution = settingsForm.resolution.value || 1;
          const volumeMusic = settingsForm.volumeMusic.value;
          const volumeSfx = settingsForm.volumeSfx.value;
          localStorage.setItem('snowboarding_game_resolution', resolution);
          localStorage.setItem('snowboarding_game_volume_music', volumeMusic);
          localStorage.setItem('snowboarding_game_volume_sfx', volumeSfx);
          location.reload();
        }
      } else if (evt.target.id === 'settings-form-close') {
        element.visible = false;
      }
    });

    return element;
  }

  private playAgain() {
    this.music.stop();
    this.restartGame();
  }

  private setPanelVisibility(panelId: PanelIds) {
    console.log('-----set panel visible', panelId);
    this.panels.forEach(p => {
      if (panelId === PanelIds.NONE) {
        // TODO unpause game
      }
      console.log('--set panel visible', p.id, p.id === panelId);
      if (p.id === panelId) {
        p.classList.remove('hidden');
      } else {
        p.classList.add('hidden');
      }

    });

  }

  private updateYourScorePanelData(distance: number, coins: number, trickScore: number, bestCombo: string, total: number) {
    if (this.panelYourScore) {
      const elDistance = document.getElementById('your-score-distance');
      const elCoins = document.getElementById('your-score-coins');
      const elTricks = document.getElementById('your-score-trick-score');
      const elTotal = document.getElementById('your-score-total');

      if (elDistance) elDistance.innerText = String(distance) + 'm';
      if (elCoins) elCoins.innerText = `${coins}x100`;
      if (elTricks) elTricks.innerText = String(trickScore);
      if (elTotal) elTotal.innerText = String(trickScore);
    }
  }
}

import * as Ph from 'phaser';
import {DEFAULT_WIDTH, POINTS_PER_COIN, SETTINGS_KEY_RESOLUTION, SETTINGS_KEY_VOLUME_MUSIC, SETTINGS_KEY_VOLUME_SFX} from '../index';
import {IScore} from '../components/State';
import {calculateTotalScore} from '../util/calculateTotalScore';


export enum PanelIds {
  PANEL_PAUSE_MENU = 'panel-pause-menu',
  PANEL_SELECT_LEVEL = 'panel-select-level',
  PANEL_LEADERBOARDS = 'panel-leaderboards',
  PANEL_HOW_TO_PLAY = 'panel-how-to-play',
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
  private sfx_applause: Phaser.Sound.BaseSound;

  private comboLeewayChart: Ph.GameObjects.Graphics;
  private resolutionMod: number;

  private panels: HTMLElement[] = [];
  private panelPauseMenu: HTMLElement | null;
  private panelLeaderboards: HTMLElement | null;
  private panelSelectLevel: HTMLElement | null;
  private panelHowToPlay: HTMLElement | null;
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
    this.sfx_applause = this.sound.add('applause', {detune: 0, rate: 1, volume: sfxVolume * 0.6});

    const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

    this.initDomUi();

    this.observer.on('toggle_pause', (paused, activePanel) => this.setPanelVisibility(paused ? activePanel : PanelIds.NONE));
    this.observer.on('jump_start', () => this.sfx_jump_start.play({delay: 0.15}));
    this.observer.on('pickup_present', total => {
      if (this.hudDistance) this.hudDistance.innerText = String(total) + 'x';
      this.sfx_pickup_present.play();
    });
    this.observer.on('combo_change', (accumulated, multiplier) => {
      if (this.hudCombo) this.hudCombo.innerText = accumulated ? (accumulated + 'x' + multiplier) : '-';
    });
    this.observer.on('score_change', score => {
      if (this.hudScore) this.hudScore.innerText = String(calculateTotalScore(score));
    });

    this.comboLeewayChart = this.add.graphics();
    this.observer.on('combo_leeway_update', (value) => {
      this.comboLeewayChart
      .clear()
      .fillStyle(0xffffff)
      .slice(screenCenterX, 72 * this.resolutionMod, 12 * this.resolutionMod, value, Math.PI * 1.5)
      .fillPath();
    });

    this.observer.on('enter_crashed', (score: IScore) => {
      this.sfx_death.play();
      this.sfx_grunt.play();
      this.comboLeewayChart.clear();
      if (this.hudCombo) this.hudCombo.innerText = '-';
      this.tweens.add({
        targets: this.music,
        volume: 0.0,
        detune: -500,
        rate: 0.5,
        duration: 2000,
        onComplete: tween => {
          this.music.stop();
          this.updateYourScorePanelData(score);
          this.setPanelVisibility(PanelIds.PANEL_YOUR_SCORE);
        },
      });
    });

    this.observer.on('level_finish', (score: IScore) => {
      this.sfx_applause.play();
      this.comboLeewayChart.clear();
      this.tweens.add({
        targets: this.music,
        volume: 0,
        duration: 2000,
        onComplete: tween => {
          this.music.stop();
          this.updateYourScorePanelData(score);
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
    for (const radio of radios) if (radio.value === val) radio.checked = true;
    const valVolumeMusic = localStorage.getItem(SETTINGS_KEY_VOLUME_MUSIC) || '80';
    const inputVolumeMusic: HTMLInputElement | null = document.querySelector('#settings-form input[name="volumeMusic"]');
    if (inputVolumeMusic) inputVolumeMusic.value = valVolumeMusic;
    const valVolumeSfx = localStorage.getItem(SETTINGS_KEY_VOLUME_SFX) || '80';
    const inputVolumeSfx: HTMLInputElement | null = document.querySelector('#settings-form input[name="volumeSfx"]');
    if (inputVolumeSfx) inputVolumeSfx.value = valVolumeSfx;

    // The game may not run well on unverified browsers. For example it seems to run quite bad on firefox atm.
    // For now a text message is shown encouraging user to switch to a different browser if there are issues.
    // Older v0.5.0 prototype was running fairly well on lowest resolution on a raspberry pi. v1.0.0 can definitely be optimized better.
    const browser = this.sys.game.device.browser;
    if (!(browser.chrome || browser.edge || browser.opera)) {
      const elUnsupportedBrowserNotice = document.getElementById('unsupported-browser-notice');
      if (!elUnsupportedBrowserNotice) throw new Error('element with id "unsupported-browser-notice" not found');
      console.warn('Unsupported browser detected. Game may run well but it was not optimized for this particular browser:', browser);
      elUnsupportedBrowserNotice.classList.remove('hidden');
    }

    const elPauseIcon = document.getElementById('pause-game-icon');
    const elHowToPlayIcon = document.getElementById('how-to-play-icon');
    if (elPauseIcon && elHowToPlayIcon) setTimeout(() => {
      elPauseIcon.classList.remove('hidden');
      elHowToPlayIcon.classList.remove('hidden');
    }, 250); // if not hidden at the start it may show the material icon text for a split second until loaded.

    this.panelPauseMenu = document.getElementById(PanelIds.PANEL_PAUSE_MENU);
    this.panelSelectLevel = document.getElementById(PanelIds.PANEL_SELECT_LEVEL);
    this.panelHowToPlay = document.getElementById(PanelIds.PANEL_HOW_TO_PLAY);
    this.panelLeaderboards = document.getElementById(PanelIds.PANEL_LEADERBOARDS);
    this.panelSettings = document.getElementById(PanelIds.PANEL_SETTINGS);
    this.panelCredits = document.getElementById(PanelIds.PANEL_CREDITS);
    this.panelYourScore = document.getElementById(PanelIds.PANEL_YOUR_SCORE);

    this.hudDistance = document.getElementById(HudIds.HUD_DISTANCE);
    this.hudCombo = document.getElementById(HudIds.HUD_COMBO);
    this.hudScore = document.getElementById(HudIds.HUD_SCORE);

    if (!this.panelPauseMenu) throw new Error('panelPauseMenu not found');
    if (!this.panelSelectLevel) throw new Error('panelSelectLevel not found');
    if (!this.panelHowToPlay) throw new Error('panelHowToPlay not found');
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
      this.panelHowToPlay,
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
            this.observer.emit('resume_game');
            break;
          }
          case 'btn-goto-select-level': {
            this.setPanelVisibility(PanelIds.PANEL_SELECT_LEVEL);
            break;
          }
          case 'btn-goto-how-to-play': {
            this.setPanelVisibility(PanelIds.PANEL_HOW_TO_PLAY);
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
          case 'pause-game-icon': {
            if (this.panelPauseMenu?.classList.contains('hidden')) {
              this.observer.emit('pause_game_icon_pressed');
            }
            break;
          }
          case 'how-to-play-icon': {
            if (this.panelPauseMenu?.classList.contains('hidden')) {
              this.observer.emit('how_to_play_icon_pressed');
            }
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
            console.log('non-interactable target id', evt.target.id);
          }

        }
      },
    );

    return element;

  }

  private playAgain() {
    this.music.stop();
    this.restartGame();
  }

  private setPanelVisibility(panelId: PanelIds) {
    const elPauseIcon = document.getElementById('pause-game-icon');
    const elHowtoPlay = document.getElementById('how-to-play-icon');
    if (elPauseIcon && elHowtoPlay) {
      if (panelId === PanelIds.NONE) {
        elPauseIcon.classList.remove('hidden');
        elHowtoPlay.classList.remove('hidden');
      } else {
        elPauseIcon.classList.add('hidden');
        elHowtoPlay.classList.add('hidden');
      }
    }

    this.panels.forEach(p => {
      if (p.id === panelId) {
        p.classList.remove('hidden');
      } else {
        p.classList.add('hidden');
      }

    });

  }

  private updateYourScorePanelData(score: IScore) {
    if (this.panelYourScore) {
      const elDistance = document.getElementById('your-score-distance');
      const elCoins = document.getElementById('your-score-coins');
      const elTricks = document.getElementById('your-score-trick-score');
      const elTricksBestCombo = document.getElementById('your-score-best-combo');
      const elTotal = document.getElementById('your-score-total');

      score.finishedLevel
        ? this.panelYourScore.classList.add('succeeded')
        : this.panelYourScore.classList.remove('succeeded');

      if (elDistance) elDistance.innerText = String(score.distance) + 'm';
      if (elCoins) elCoins.innerText = `${score.coins}x${POINTS_PER_COIN}`;
      if (elTricks) elTricks.innerText = String(score.trickScore);
      if (elTricksBestCombo) elTricksBestCombo.innerText = String(score.bestCombo.accumulator * score.bestCombo.multiplier);
      if (elTotal) elTotal.innerText = String(calculateTotalScore(score));
    }
  }
}

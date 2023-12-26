import { IComboTrickScore, IScore } from '../components/State';
import { calculateTotalScore } from '../util/calculateTotalScore';
import { pseudoRandomId } from '../util/pseudoRandomId';
import { getCurrentLevel } from '../util/getCurrentLevel';
import { BackgroundMusicKeys, DEBUG, DEFAULT_WIDTH, KEY_LEVEL_CURRENT, KEY_USER_NAME, KEY_USER_SCORES, LEVEL_SUCCESS_BONUS_POINTS, POINTS_PER_COIN, SCENE_GAME_UI, SETTINGS_KEY_RESOLUTION, SETTINGS_KEY_VOLUME_MUSIC, SETTINGS_KEY_VOLUME_SFX, leaderboardService } from '..';


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


export default class GameUIScene extends Phaser.Scene {
  private observer: Phaser.Events.EventEmitter;
  private restartGame: () => void;

  private music: Phaser.Sound.BaseSound;
  private sfx_pickup_present: Phaser.Sound.BaseSound;
  private sfx_death: Phaser.Sound.BaseSound;
  private sfx_grunt: Phaser.Sound.BaseSound;
  private sfx_applause: Phaser.Sound.BaseSound;
  private sfx_game_over_demon: Phaser.Sound.BaseSound;

  private comboLeewayChart: Phaser.GameObjects.Graphics;
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

  private pendingScore: IScore | null = null;
  private localScores: IScore[] = [];
  private crashed: boolean = false;
  private finished: boolean = false;

  constructor() {
    super({ key: SCENE_GAME_UI });
  }

  init([observer, restartGameCB]: [Phaser.Events.EventEmitter, () => void]) {
    this.observer = observer;
    this.restartGame = restartGameCB;
    this.resolutionMod = this.game.canvas.width / DEFAULT_WIDTH;
  }

  create() {
    const musicVolume = Number(localStorage.getItem(SETTINGS_KEY_VOLUME_MUSIC) || 80) / 100;
    const randomMusicKey = Object.values(BackgroundMusicKeys)[Math.floor(Math.random() * Object.values(BackgroundMusicKeys).length)];
    this.music = this.sound.add(randomMusicKey, { loop: true, volume: musicVolume * 1, rate: 1, delay: 1, detune: 0 });
    this.music.play();
    const sfxVolume = Number(localStorage.getItem(SETTINGS_KEY_VOLUME_SFX) || 80) / 100;
    this.sfx_pickup_present = this.sound.add('pickup_present', { detune: 0, rate: 1, volume: sfxVolume * 0.6 });
    this.sfx_death = this.sound.add('death', { detune: 700, rate: 1.25, volume: sfxVolume * 0.8 });
    this.sfx_grunt = this.sound.add('grunt', { detune: 400, rate: 1.25, volume: sfxVolume * 0.5 });
    this.sfx_applause = this.sound.add('applause', { detune: 0, rate: 1, volume: sfxVolume * 0.6 });
    this.sfx_game_over_demon = this.sound.add('game_over_demon', { detune: 0, rate: 0.95, volume: sfxVolume * 0.6 });

    const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

    leaderboardService.setLevel(getCurrentLevel());
    this.initDomUi();

    this.observer.on('toggle_pause', (paused, activePanel) => this.setPanelVisibility(paused ? activePanel : PanelIds.NONE));
    // this.observer.on('jump_start', () => this.sfx_jump_start.play({delay: 0.15, detune: -200, rate: 1}));
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
      this.pendingScore = score;
      this.crashed = true;
      this.sfx_death.play();
      this.sfx_grunt.play();
      if (this.finished) return;
      this.comboLeewayChart.clear();
      if (this.hudCombo) this.hudCombo.innerText = '-';
      this.sfx_game_over_demon.play();
      this.tweens.add({
        targets: this.music,
        volume: 0.0,
        detune: -500,
        rate: 0.5,
        duration: 750,
        onComplete: async () => {
          this.music.stop();
          await this.updateYourScorePanelData(score);
          this.setPanelVisibility(PanelIds.PANEL_YOUR_SCORE);
        },
      });
    });

    this.observer.on('level_finish', (score: IScore) => {
      if (this.crashed) return;
      this.pendingScore = score;
      this.finished = true;
      this.sfx_applause.play();
      this.comboLeewayChart.clear();
      this.tweens.add({
        targets: this.music,
        volume: 0,
        duration: 2000,
        onComplete: async () => {
          this.music.stop();
          await this.updateYourScorePanelData(score);
          this.setPanelVisibility(PanelIds.PANEL_YOUR_SCORE);
        },
      });
    });
  }

  update() {
  }

  private initDomUi(): Phaser.GameObjects.DOMElement {
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
    if (!(browser.chrome || browser.edge || browser.opera || browser.firefox)) {
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

    element.on('click', async (evt) => {
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
          const backBtn = document.querySelector('#panel-select-level #btn-goto-pause-menu');
          backBtn && (this.crashed ? backBtn.classList.add('hidden') : backBtn.classList.remove('hidden'));
          this.setPanelVisibility(PanelIds.PANEL_SELECT_LEVEL);
          break;
        }
        case 'btn-goto-how-to-play': {
          this.setPanelVisibility(PanelIds.PANEL_HOW_TO_PLAY);
          break;
        }
        case 'btn-goto-leaderboards': {
          await this.updateLeaderboardPanelData();
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
        case 'btn-score-submit': {
          const submitScoreForm = document.querySelector('.submit-score');
          const nameInput: HTMLInputElement | null = document.getElementById('username') as HTMLInputElement;
          const name = nameInput?.value;
          if (name && this.pendingScore && submitScoreForm) {
            if (leaderboardService.auth?.currentUser) {
              leaderboardService.rexLeaderboard.setUser({ userID: leaderboardService.auth.currentUser.uid, userName: nameInput.value });
              await leaderboardService.auth.currentUser.updateProfile({ displayName: nameInput.value });
            }
            localStorage.setItem(KEY_USER_NAME, nameInput.value);
            await leaderboardService.submit(this.pendingScore); // TODO add loading indicator
            await this.updateYourScorePanelData(this.pendingScore);
            submitScoreForm.classList.add('hidden');
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
        case 'level_001':
        case 'level_002':
        case 'level_003':
        case 'level_004':
        case 'level_005': {
          localStorage.setItem(KEY_LEVEL_CURRENT, evt.target.id);
          leaderboardService.setLevel(evt.target.id);
          this.playAgain();
          break;
        }
        default: {
          DEBUG && console.log('non-interactable target id', evt.target.id);
        }

      }
    },
    );

    return element;
  }

  private playAgain() {
    this.music.stop();
    this.sfx_game_over_demon.stop();
    this.crashed = false;
    this.finished = false;
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

  private async updateYourScorePanelData(score: IScore) {
    if (this.panelYourScore) {
      const elDistance = document.getElementById('your-score-distance');
      const elCoins = document.getElementById('your-score-coins');
      const elTricks = document.getElementById('your-score-trick-score');
      const elBonus = document.getElementById('your-score-bonus');
      const elTricksBestCombo = document.getElementById('your-score-best-combo');
      const elTotal = document.getElementById('your-score-total');
      const elUsername = document.getElementById('username') as HTMLInputElement;
      const elSubmitScoreForm = document.querySelector('.submit-score');

      score.finishedLevel
        ? this.panelYourScore.classList.add('succeeded')
        : this.panelYourScore.classList.remove('succeeded');

      const comboScores = score.trickScoreLog.filter(s => s.type === 'combo') as IComboTrickScore[];
      const bestCombo = comboScores.length ? Math.max(...comboScores.map(s => s.accumulator * s.multiplier)) : 0;
      if (elDistance) elDistance.innerText = String(score.distance) + 'm';
      if (elCoins) elCoins.innerText = `${score.coins}x${POINTS_PER_COIN}`;
      if (elTricks) elTricks.innerText = String(score.trickScore);
      if (elBonus) elBonus.innerText = String(score.finishedLevel ? LEVEL_SUCCESS_BONUS_POINTS : 0);
      if (elTricksBestCombo) elTricksBestCombo.innerText = String(bestCombo);
      if (elTotal) elTotal.innerText = String(calculateTotalScore(score));

      const currentUser = leaderboardService.auth?.currentUser;
      if (!currentUser) {
        // When leaderboard is disabled; TODO refactor and clean the mess
        if (!localStorage.getItem(KEY_USER_NAME)) {
          elUsername.value = `Player_${pseudoRandomId()}`;
          elUsername.setAttribute('value', elUsername.value); // to make floating label move up
          localStorage.setItem(KEY_USER_NAME, elUsername.value);
        } else {
          elSubmitScoreForm?.classList.add('hidden');
          await leaderboardService.submit(score);
        }
        return;
      }

      // Everything below is expected to work only when leaderboards are enabled
      if (!elUsername) throw new Error('username input field not found');
      const note: HTMLElement | null = document.querySelector('.submit-score-offline-info');
      note && note.classList.add('hidden');

      if (!currentUser.displayName) {
        // First time player without a username. Score is submitted manually somewhere else after clicking a button.
        elUsername.value = `Player_${pseudoRandomId()}`;
        elUsername.setAttribute('value', elUsername.value); // to make floating label move up
        localStorage.setItem(KEY_USER_NAME, elUsername.value);
      } else {
        // Score is submitted automatically for users that submitted a score once before from this device and browser.
        elSubmitScoreForm?.classList.add('hidden');
        leaderboardService.rexLeaderboard.setUser({ userID: currentUser.uid, userName: currentUser.displayName });
        await leaderboardService.submit(score);
        const fbScores = await leaderboardService.rexLeaderboard.loadFirstPage();
        // Cannot trust plain value total on firebase nor the rank nor the order atm
        // const yourRank = await leaderboardService.rexLeaderboard.getRank(currentUser.uid);
        const scores: IScore[] = fbScores.map(s => ({ ...s, total: calculateTotalScore(s as IScore, false) } as IScore)).sort((a, b) => Number(b.total) - Number(a.total));
        const yourRank = scores.findIndex(s => s.userID === currentUser.uid);
        const elYourRank = document.getElementById('your-score-rank-value');
        if (elYourRank && yourRank !== -1 && scores?.length) elYourRank.innerText = `${yourRank + 1}/${scores.length}`;
      }
    }
  }

  private async updateLeaderboardPanelData() {
    if (leaderboardService.auth?.currentUser) {
      const note: HTMLElement | null = document.querySelector('.leaderboard-note');
      note && note.classList.add('hidden');
    }

    // TODO cleanup this mess
    let fbScores = leaderboardService.auth
      ? await leaderboardService.rexLeaderboard.loadFirstPage()
      : (JSON.parse(localStorage.getItem(KEY_USER_SCORES) || '{}')[getCurrentLevel()] || []).map(s => ({ ...s, userName: localStorage.getItem(KEY_USER_NAME) }));
    const leaderboardItemTemplate: HTMLTemplateElement | null = document.getElementById('leaderboard-item-template') as HTMLTemplateElement;
    const leaderboardItemContainer = document.getElementById('leaderboard-item-container');
    if (this.panelLeaderboards && leaderboardItemTemplate && leaderboardItemContainer) {
      const localPlayerUsername = leaderboardService.auth?.currentUser?.displayName || localStorage.getItem(KEY_USER_NAME) as string;
      const scores: IScore[] = fbScores.map(s => ({ ...s, total: calculateTotalScore(s as IScore, false) } as IScore)).sort((a, b) => Number(b.total) - Number(a.total));
      leaderboardItemContainer.innerText = '';
      for (const [i, score] of scores.entries()) {
        const displayName = score.userName;
        const clone: HTMLElement = leaderboardItemTemplate.content.cloneNode(true) as HTMLElement;
        const cloneElRank = clone.querySelector('#leaderboard-item-rank');
        const cloneElUsername = clone.querySelector('#leaderboard-item-username');
        const cloneElScore = clone.querySelector('#leaderboard-item-score');
        if (cloneElRank) cloneElRank.innerHTML = String(i + 1);
        if (cloneElUsername) cloneElUsername.innerHTML = String(displayName);
        if (cloneElScore) cloneElScore.innerHTML = String(calculateTotalScore(score as IScore));
        if (cloneElUsername && localPlayerUsername && (leaderboardService.auth?.currentUser?.uid === score.userID || !leaderboardService.auth)) cloneElUsername.classList.add('your-own-score');
        leaderboardItemContainer.appendChild(clone);
      }
    }
  }
}

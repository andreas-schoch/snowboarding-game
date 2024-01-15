import { IComboTrickScore, IScore } from '../State';
import { calculateTotalScore } from '../util/calculateTotalScore';
import { pseudoRandomId } from '../util/pseudoRandomId';
import { DEFAULT_WIDTH, LEVEL_SUCCESS_BONUS_POINTS, POINTS_PER_COIN, SCENE_GAME_UI, leaderboardService } from '..';
import { COMBO_LEEWAY_UPDATE, ENTER_CRASHED, HOW_TO_PLAY_ICON_PRESSED, LEVEL_FINISH, PAUSE_GAME_ICON_PRESSED, RESTART_GAME, RESUME_GAME, TOGGLE_PAUSE } from '../eventTypes';
import { LevelKeys, levels } from '../levels';
import { GameInfo } from '../GameInfo';
import { Settings } from '../Settings';
import { initSolidUI } from '../UI';


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

export default class GameUIScene extends Phaser.Scene {
  private observer: Phaser.Events.EventEmitter;

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

  private pendingScore: IScore | null = null;
  private localScores: IScore[] = [];
  private crashed: boolean = false;

  constructor() {
    super({ key: SCENE_GAME_UI });
  }

  init([observer]: [Phaser.Events.EventEmitter]) {
    this.observer = observer;
    this.resolutionMod = this.game.canvas.width / DEFAULT_WIDTH;
  }

  create() {
    const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

    leaderboardService.setLevel(Settings.currentLevel());
    this.initDomUi();

    this.observer.on(TOGGLE_PAUSE, (paused, activePanel) => this.setPanelVisibility(paused ? activePanel : PanelIds.NONE));

    this.comboLeewayChart = this.add.graphics();
    this.observer.on(COMBO_LEEWAY_UPDATE, (value) => {
      this.comboLeewayChart
        .clear()
        .fillStyle(0xffffff)
        .slice(screenCenterX, 72 * this.resolutionMod, 12 * this.resolutionMod, value, Math.PI * 1.5)
        .fillPath();
    });

    this.observer.on(ENTER_CRASHED, (score: IScore, id: string) => {
      if (id !== GameInfo.possessedCharacterId) return;
      this.pendingScore = score;
      this.crashed = true;
      if (score.finishedLevel) return;
      // if (this.hudCombo) this.hudCombo.innerText = '-';
      this.comboLeewayChart.clear();
      setTimeout(async () => {
        await this.updateYourScorePanelData(score);
        this.setPanelVisibility(PanelIds.PANEL_YOUR_SCORE);
      }, 750);
    });

    this.observer.on(LEVEL_FINISH, (score: IScore) => {
      if (this.crashed) return;
      this.pendingScore = score;
      this.comboLeewayChart.clear();
      setTimeout(async () => {
        await this.updateYourScorePanelData(score);
        this.setPanelVisibility(PanelIds.PANEL_YOUR_SCORE);
      }, 2000);
    });
  }

  update() {
  }

  private initDomUi(): HTMLElement {
    initSolidUI('root-ui');

    const element = document.querySelector<HTMLElement>('#game-ui');
    if (!element) throw new Error('game ui not found');

    document.body.classList.add(Settings.darkmodeEnabled() ? 'darkmode' : 'ligghtmode');

    const radios = Array.from(document.querySelectorAll<HTMLInputElement>('#settings-form input[name="resolution"]'));
    if (!radios.length) throw new Error('resolution radio inputs not found');
    for (const radio of radios) if (Number(radio.value) === Settings.resolutionScale()) radio.checked = true;

    const inputVolumeMusic = document.querySelector<HTMLInputElement>('#settings-form input[name="volumeMusic"]');
    if (inputVolumeMusic) inputVolumeMusic.value = String(Settings.volumeMusic());
    else throw new Error('inputVolumeMusic not found');

    const inputVolumeSfx = document.querySelector<HTMLInputElement>('#settings-form input[name="volumeSfx"]');
    if (inputVolumeSfx) inputVolumeSfx.value = String(Settings.volumeSfx());
    else throw new Error('inputVolumeSfx not found');

    const darkmodeToggle = document.querySelector<HTMLInputElement>('#settings-form input[name="darkmodeEnabled"]');
    if (darkmodeToggle) darkmodeToggle.checked = Settings.darkmodeEnabled();
    else throw new Error('darkmodeToggle not found');

    // The game may not run well on unverified browsers.
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
    if (!elPauseIcon) throw new Error('pause-game-icon not found');
    if (!elHowToPlayIcon) throw new Error('how-to-play-icon not found');
    setTimeout(() => {
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

    // TODO wrap in get element or error method
    if (!this.panelPauseMenu) throw new Error('panelPauseMenu not found');
    if (!this.panelSelectLevel) throw new Error('panelSelectLevel not found');
    if (!this.panelHowToPlay) throw new Error('panelHowToPlay not found');
    if (!this.panelLeaderboards) throw new Error('panelLeaderboards not found');
    if (!this.panelSettings) throw new Error('panelSettings not found');
    if (!this.panelCredits) throw new Error('panelCredits not found');
    if (!this.panelYourScore) throw new Error('panelYourScore not found');

    this.panels = [
      this.panelPauseMenu,
      this.panelSelectLevel,
      this.panelHowToPlay,
      this.panelLeaderboards,
      this.panelSettings,
      this.panelCredits,
      this.panelYourScore,
    ];

    element.onclick = async evt => {
      const target = evt.target as HTMLElement;
      if (!target) return;
      switch (target.id) {
        case 'btn-goto-pause-menu': {
          this.setPanelVisibility(PanelIds.PANEL_PAUSE_MENU);
          break;
        }
        case 'btn-resume-game': {
          this.setPanelVisibility(PanelIds.NONE);
          this.observer.emit(RESUME_GAME);
          break;
        }
        case 'btn-goto-select-level': {
          const backBtn = document.querySelector('#panel-select-level #btn-goto-pause-menu');
          backBtn && (this.crashed ? backBtn.classList.add('hidden') : backBtn.classList.remove('hidden'));
          await this.updateLevelItems();
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
            this.observer.emit(PAUSE_GAME_ICON_PRESSED);
          }
          break;
        }
        case 'how-to-play-icon': {
          if (this.panelPauseMenu?.classList.contains('hidden')) {
            this.observer.emit(HOW_TO_PLAY_ICON_PRESSED);
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
            Settings.set('userName', nameInput.value);
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
            Settings.set('resolution', settingsForm.resolution.value || '1');
            Settings.set('volumeMusic', settingsForm.volumeMusic.value);
            Settings.set('volumeSfx', settingsForm.volumeSfx.value);
            Settings.set('darkmodeEnabled', String(settingsForm.darkmodeEnabled.checked));
            location.reload();
          }
          break;
        }
        case 'btn-play-again': {
          this.setPanelVisibility(PanelIds.NONE);
          this.playAgain();
          break;
        }
        case 'level_001':
        case 'level_002':
        case 'level_003':
        case 'level_004':
        case 'level_005': {
          Settings.set('levelCurrent', target.id);
          leaderboardService.setLevel(target.id as LevelKeys);
          this.setPanelVisibility(PanelIds.NONE);
          this.playAgain();
          break;
        }
        default: {
          Settings.debug() && console.log('non-interactable target id', target.id);
        }

      }
    };

    return element;
  }

  private playAgain() {
    this.crashed = false;
    this.observer.emit(RESTART_GAME);
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
        if (!Settings.username()) {
          elUsername.value = `Player_${pseudoRandomId()}`;
          elUsername.setAttribute('value', elUsername.value); // to make floating label move up
          Settings.set('userName', elUsername.value);
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
        // TODO disabled default username for now as too many just us the default name instead of overriding it.
        // First time player without a username. Score is submitted manually somewhere else after clicking a button.
        // elUsername.value = `Player_${pseudoRandomId()}`;
        // elUsername.setAttribute('value', elUsername.value); // to make floating label move up
        // localStorage.setItem(KEY_USER_NAME, elUsername.value);
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

    // TODO replace firebase with pocketbase backend
    let fbScores = leaderboardService.auth
      ? await leaderboardService.rexLeaderboard.loadFirstPage()
      : Settings.localScores()[Settings.currentLevel()].map(s => ({ ...s, userName: Settings.username() }));
    const leaderboardItemTemplate: HTMLTemplateElement | null = document.getElementById('leaderboard-item-template') as HTMLTemplateElement;
    const leaderboardItemContainer = document.getElementById('leaderboard-item-container');
    if (this.panelLeaderboards && leaderboardItemTemplate && leaderboardItemContainer) {
      const localPlayerUsername = leaderboardService.auth?.currentUser?.displayName || Settings.username();
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

  private async updateLevelItems() {
    const levelItemTemplate: HTMLTemplateElement | null = document.getElementById('level-item-template') as HTMLTemplateElement;
    const levelItemContainer = document.getElementById('level-item-container');
    if (this.panelSelectLevel && levelItemTemplate && levelItemContainer) {
      levelItemContainer.innerText = '';
      for (const level of levels) {
        const clone: HTMLElement = levelItemTemplate.content.cloneNode(true) as HTMLElement;
        const id = clone.querySelector('.level-item-overlay') as HTMLElement;
        const number = clone.querySelector('.level-item-number') as HTMLElement;
        const name = clone.querySelector('.level-item-name') as HTMLElement;
        const thumbnail = clone.querySelector('.level-item-thumbnail') as HTMLElement;
        if (id) id.id = level.id;
        if (number) number.innerHTML = `Level ${String(level.number).padStart(3, '0')}`;
        if (name) name.innerHTML = level.name;
        if (thumbnail) thumbnail.style.backgroundImage = `url('${level.thumbnail}')`;
        levelItemContainer.appendChild(clone);
      }
    }
  }
}
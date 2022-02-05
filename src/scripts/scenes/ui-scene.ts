import * as Ph from 'phaser';
import {StateComponent} from '../objects/state-component';
import {DEFAULT_WIDTH} from '../index';

export default class UIScene extends Ph.Scene {
  private state: StateComponent;
  private restartGame: () => void;

  private playAgainButton: Phaser.GameObjects.BitmapText;
  private music: Phaser.Sound.BaseSound;

  private textDistance: Phaser.GameObjects.BitmapText;
  private textCombo: Phaser.GameObjects.BitmapText;
  private textScore: Phaser.GameObjects.BitmapText;
  private comboLeewayChart: Ph.GameObjects.Graphics;

  constructor() {
    super({key: 'UIScene'});
  }

  init([state, restartGameCB]: [StateComponent, () => void]) {
    this.state = state;
    this.restartGame = restartGameCB;
  }

  create() {
    this.cameras.main.setRoundPixels(true);
    const resolutionModifier = this.game.canvas.width === DEFAULT_WIDTH ? 1 : 0.5;
    const FONTSIZE_TITLE = 20 * resolutionModifier;
    const FONTSIZE_VALUE = 18 * resolutionModifier;
    const FONTSIZE_BUTTON = 24 * resolutionModifier;
    const PADDING = 4 * resolutionModifier;

    this.music = this.sound.add('theme');
    this.music.play({loop: true, volume: 0.2, rate: 0.9, delay: 1.25});

    const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

    // TODO create leaderboard component
    this.playAgainButton = this.add.bitmapText(screenCenterX, screenCenterY * 1.5, 'atari-classic', 'PLAY AGAIN?')
    .setScrollFactor(0)
    .setFontSize(FONTSIZE_BUTTON)
    .setOrigin(0.5)
    .setDropShadow(1, 2, 0x222222)
    .setAlpha(0)
    .setInteractive({useHandCursor: true})
    .on('pointerdown', () => this.playAgain())
    .on('pointerover', () => this.playAgainButton.setCharacterTint(0, -1, true, 10, 10, 10, 10))
    .on('pointerout', () => this.playAgainButton.setCharacterTint(0, -1, false, -10, -10, -10, -10));
    // const bounds1 = this.playAgainButton.getTextBounds();
    // this.graphics.fillRect(bounds1.global.x, bounds1.global.y, bounds1.global.width, bounds1.global.height);

    this.add.bitmapText(4, 4, 'atari-classic', 'DISTANCE').setScrollFactor(0, 0).setFontSize(FONTSIZE_TITLE);
    this.textDistance = this.add.bitmapText(PADDING * 1.5, FONTSIZE_TITLE + (PADDING * 2), 'atari-classic', 'Distance: 0m').setScrollFactor(0, 0).setFontSize(FONTSIZE_VALUE);

    this.add.bitmapText(screenCenterX, PADDING, 'atari-classic', 'COMBO').setScrollFactor(0, 0).setOrigin(0.5, 0).setFontSize(FONTSIZE_TITLE);
    this.textCombo = this.add.bitmapText(screenCenterX, FONTSIZE_TITLE + (PADDING * 2), 'atari-classic', '-').setScrollFactor(0, 0).setFontSize(FONTSIZE_VALUE).setOrigin(0.5, 0);

    this.add.bitmapText(screenCenterX * 2 - PADDING, PADDING, 'atari-classic', 'SCORE').setScrollFactor(0, 0).setOrigin(1, 0).setFontSize(FONTSIZE_TITLE);
    this.textScore = this.add.bitmapText(screenCenterX * 2 - PADDING, FONTSIZE_TITLE + (PADDING * 2), 'atari-classic', '0').setScrollFactor(0, 0).setFontSize(FONTSIZE_VALUE).setOrigin(1, 0);

    this.state.on('combo-change', (accumulated, multiplier) => this.textCombo.setText(accumulated ? (accumulated + 'x' + multiplier) : '-'));
    this.state.on('score-change', (score) => this.textScore.setText(score));

    this.comboLeewayChart = this.add.graphics();

    this.state.on('combo-leeway-update', (value) => {
      this.comboLeewayChart
      .clear()
      .fillStyle(0xffffff)
      .slice(screenCenterX, 72 * resolutionModifier, 12 * resolutionModifier, value, Math.PI * 1.5)
      .fillPath();
    });

    this.state.on('enter-crashed', () => {
      this.playAgainButton.setAlpha(1);
      this.tweens.add({
        targets: this.music,
        volume: 0.0,
        detune: -500,
        rate: 0.5,
        duration: 3000,
        onComplete: tween => this.music.stop(),
      });
    });
  }

  update() {
    if (!this.state.isCrashed) this.textDistance.setText(String(this.state.getTravelDistanceMeters()) + 'm');
  }

  private playAgain() {
    this.music.stop();
    this.restartGame();
  }
}

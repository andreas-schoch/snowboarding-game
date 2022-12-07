import * as Ph from 'phaser';
import {DEFAULT_WIDTH} from '../index';

export default class UiScene extends Ph.Scene {
  private observer: Phaser.Events.EventEmitter;
  private restartGame: () => void;

  private playAgainButton: Phaser.GameObjects.BitmapText;
  private music: Phaser.Sound.BaseSound;
  private sfx_jump_start: Phaser.Sound.BaseSound;
  private sfx_pickup_present: Phaser.Sound.BaseSound;

  private textDistance: Phaser.GameObjects.BitmapText;
  private textCombo: Phaser.GameObjects.BitmapText;
  private textScore: Phaser.GameObjects.BitmapText;
  private comboLeewayChart: Ph.GameObjects.Graphics;

  constructor() {
    super({key: 'UiScene'});
  }

  init([observer, restartGameCB]: [Ph.Events.EventEmitter, () => void]) {
    this.observer = observer;
    this.restartGame = restartGameCB;
  }

  create() {
    console.log('--------------ui scene create');
    debugger;
    this.cameras.main.setRoundPixels(true);
    const resolutionMod = this.game.canvas.width / DEFAULT_WIDTH;

    // const resolutionModifier = this.game.canvas.width === DEFAULT_WIDTH ? 1 : 0.5;
    const FONTSIZE_TITLE = 20 * resolutionMod;
    const FONTSIZE_VALUE = 18 * resolutionMod;
    const FONTSIZE_BUTTON = 24 * resolutionMod;
    const PADDING = 4 * resolutionMod;

    // this.music = this.sound.add('xmas_synth', {loop: true, volume: 0.2, rate: 0.85, delay: 1, detune: -100});
    this.music = this.sound.add('riverside_ride', {loop: true, volume: 0.2, rate: 0.95, delay: 1, detune: 0});
    this.music.play();

    this.sfx_jump_start = this.sound.add('boink', {detune: -200});
    this.sfx_pickup_present = this.sound.add('pickup_present', {detune: 100, rate: 1.1});

    const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

    // this.boostBar = new BoostBar(this, this.observer, 10, 100);

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

    this.observer.on('jump_start', () => this.sfx_jump_start.play({delay: 0.1}));
    this.observer.on('pickup_present', () => this.sfx_pickup_present.play());

    this.observer.on('combo-change', (accumulated, multiplier) => this.textCombo.setText(accumulated ? (accumulated + 'x' + multiplier) : '-'));
    this.observer.on('score-change', score => this.textScore.setText(score));
    this.observer.on('distance-change', distance => this.textDistance.setText(String(distance) + 'm'));

    this.comboLeewayChart = this.add.graphics();

    this.observer.on('combo-leeway-update', (value) => {
      this.comboLeewayChart
      .clear()
      .fillStyle(0xffffff)
      .slice(screenCenterX, 72 * resolutionMod, 12 * resolutionMod, value, Math.PI * 1.5)
      .fillPath();
    });

    this.observer.on('enter-crashed', () => {
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
  }

  private playAgain() {
    this.music.stop();
    this.restartGame();
  }
}

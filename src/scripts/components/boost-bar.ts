import * as Ph from 'phaser';
import {DEFAULT_WIDTH} from '../index';


export class BoostBar {
  private readonly scene: Ph.Scene;
  private readonly observer: Ph.Events.EventEmitter;
  private readonly maxBoost: number;
  private currentBoost: number;

  constructor(scene: Ph.Scene, observer: Ph.Events.EventEmitter, startingBoost: number = 10, maxBoost: number = 100) {
    this.scene = scene;
    this.observer = observer;
    this.currentBoost = startingBoost;
    this.maxBoost = maxBoost;

    const resolutionModifier = this.scene.game.canvas.width === DEFAULT_WIDTH ? 1 : 0.5;
    const PADDING = 32 * resolutionModifier;
    const BOOSTBAR_WIDTH = 15;
    const STROKE_WIDTH = 4 * resolutionModifier;

    const screenCenterX = this.scene.cameras.main.worldView.x + this.scene.cameras.main.width / 2;
    const screenCenterY = this.scene.cameras.main.worldView.y + this.scene.cameras.main.height / 2;

    const background = this.scene.add.graphics();
    background.lineStyle(STROKE_WIDTH, 0xffffff);
    background.strokeRect(screenCenterX * 2 - PADDING - BOOSTBAR_WIDTH - STROKE_WIDTH, 150 * resolutionModifier, BOOSTBAR_WIDTH * resolutionModifier, screenCenterY);

    const boostMeter = this.scene.add.graphics();
    this.observer.on('boost-change', (availableBoost, maxBoost) => {
      const ratio = availableBoost / maxBoost;
      const height = screenCenterY * ratio;
      boostMeter.clear();
      boostMeter.fillStyle(0xffffff, 1);
      boostMeter.fillRect(screenCenterX * 2 - PADDING - BOOSTBAR_WIDTH - (STROKE_WIDTH / 2), (screenCenterY + 150 * resolutionModifier) - height, BOOSTBAR_WIDTH * resolutionModifier - STROKE_WIDTH, height);
    });
  }
}

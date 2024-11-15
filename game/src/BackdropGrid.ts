import {EditorInfo} from './EditorInfo';
import {EDITOR_SET_GRID_VISIBLE} from './eventTypes';
import {wrapWithin} from './helpers/angle';
import {ppm} from './index';

export class BackdropGrid {
  private scene: Phaser.Scene;
  private grid: Phaser.GameObjects.TileSprite;
  private cellSize = ppm * 8; // 8 meters
  private cellScale = 2;
  private shouldShowGrid = true;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const graphics = this.scene.add.graphics();
    graphics.lineStyle(2, 0x000000, 1);
    graphics.strokeRect(1, 1, this.cellSize - 1, this.cellSize - 1);
    graphics.generateTexture('grid_1m', this.cellSize, this.cellSize);
    graphics.destroy();

    this.grid = this.scene.add
      .tileSprite(0, 0, this.cellSize * 12, this.cellSize * 8, 'grid_1m')
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(-200)
      .setScale(this.cellScale)
      .setAlpha(0.1);

    EditorInfo.observer.on(EDITOR_SET_GRID_VISIBLE, (shouldShowGrid: boolean) => {
      this.shouldShowGrid = shouldShowGrid;
      this.grid.setVisible(shouldShowGrid);
    });
  }

  update() {
    const {scrollX, scrollY} = this.scene.cameras.main;
    const scaledCellSize = this.cellSize * this.cellScale;
    // FIXME this works for regular full window size but a bit off whenever resizing and restarting
    this.grid.x = -wrapWithin(scrollX, 0, scaledCellSize) + (scaledCellSize * 2);
    this.grid.y = -wrapWithin(scrollY, 0, scaledCellSize) + (scaledCellSize * 1);

    // grid won't be able to fit the screen if zoomed more than this.
    if (this.shouldShowGrid) this.grid.setVisible(this.scene.cameras.main.zoom > 0.2);
    else this.grid.setVisible(false);
  }
}

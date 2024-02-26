export class BackdropGrid {
  private scene: Phaser.Scene;
  private grid: Phaser.GameObjects.TileSprite;
  private cellSize = 40 * 8; // 8 meters
  private cellScale = 2;

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
  }

  update() {
    const {scrollX, scrollY} = this.scene.cameras.main;
    const scaledCellSize = this.cellSize * this.cellScale;
    // FIXME this works for regular full window size but a bit off whenever resizing and restarting
    this.grid.x = -Phaser.Math.Wrap(scrollX, 0, scaledCellSize) + (scaledCellSize * 2);
    this.grid.y = -Phaser.Math.Wrap(scrollY, 0, scaledCellSize) + (scaledCellSize * 1);

    // grid won't be able to fit the screen if zoomed more than this.
    this.grid.setVisible(this.scene.cameras.main.zoom > 0.2);
  }
}

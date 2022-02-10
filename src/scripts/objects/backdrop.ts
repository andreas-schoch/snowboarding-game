import * as Ph from 'phaser';
import {stats} from '../index';


export class Backdrop {
  private scene: Ph.Scene;

  private bgSpaceBack: Phaser.GameObjects.TileSprite;
  private bgSpaceMid: Phaser.GameObjects.TileSprite;

  private bgLandscapeMountains: Phaser.GameObjects.TileSprite;
  private bgLandscapeHills: Phaser.GameObjects.TileSprite;

  constructor(scene: Ph.Scene) {
    this.scene = scene;

    this.bgSpaceBack = this.registerLayer('space-back');
    this.bgSpaceMid = this.registerLayer('space-mid');
    this.bgLandscapeMountains = this.registerLayer('mountain-back').setTint(30, 30, 30, 30);
    this.bgLandscapeHills = this.registerLayer('mountain-mid').setTint(50, 50, 50, 50);
  }

  update() {
    stats.begin('backdrop');
    const {scrollX, scrollY} = this.scene.cameras.main;
    this.bgSpaceBack.setTilePosition(scrollX * 0.001, scrollY * 0.001);
    this.bgSpaceMid.setTilePosition(scrollX * 0.0025, scrollY * 0.0025);
    this.bgLandscapeMountains.setTilePosition(scrollX * 0.025, 0);
    this.bgLandscapeHills.setTilePosition(scrollX * 0.035, 0);
    stats.end('backdrop');
  }

  private registerLayer(key: string, scaleX: number = 1, scaleY: number = 1): Ph.GameObjects.TileSprite {
    const {width, height, zoomX, zoomY, worldView} = this.scene.cameras.main;
    return this.scene.add.tileSprite(worldView.x + width / 2, worldView.y + height / 2, width, height, key)
    .setOrigin(0.5, 0.5)
    .setScrollFactor(0, 0)
    .setScale(scaleX * (1 / zoomX), scaleY * (1 / zoomY));
  }
}

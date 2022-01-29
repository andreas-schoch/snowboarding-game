import * as Ph from 'phaser';


export class Backdrop {
  private scene: Ph.Scene;

  private bgSpaceBack: Phaser.GameObjects.TileSprite;
  private bgSpaceMid: Phaser.GameObjects.TileSprite;
  private bgSpaceFront: Phaser.GameObjects.TileSprite;

  private bgLandscapeMountains: Phaser.GameObjects.TileSprite;
  private bgLandscapeHills: Phaser.GameObjects.TileSprite;

  constructor(scene: Ph.Scene) {
    this.scene = scene;
    const {width, height} = this.scene.cameras.main;
    this.bgSpaceBack = this.scene.add.tileSprite(0, 0, width, height, 'space-back').setOrigin(0).setScrollFactor(0, 0);
    this.bgSpaceMid = this.scene.add.tileSprite(0, 0, width, height, 'space-mid').setOrigin(0).setScrollFactor(0, 0);
    this.bgSpaceFront = this.scene.add.tileSprite(0, 0, width, height, 'space-front').setOrigin(0).setScrollFactor(0, 0);

    this.bgLandscapeMountains = this.scene.add.tileSprite(0, 0, width, height, 'bg-landscape-4-mountain')
    .setZ(2)
    .setScale(1.25, 2)
    .setOrigin(0, 0.5)
    .setScrollFactor(0, 0)
    .setTint(30, 30, 30, 30);
    this.bgLandscapeHills = this.scene.add.tileSprite(0, 0, width, height, 'bg-landscape-3-trees')
    .setScale(1.25, 1.5)
    .setOrigin(0, 0.25)
    .setScrollFactor(0, 0).setZ(1)
    .setTint(50, 50, 50, 50);
  }

  update() {
    const {scrollX, scrollY} = this.scene.cameras.main;
    this.bgSpaceBack.setTilePosition(scrollX * 0.001, scrollY * 0.001);
    this.bgSpaceMid.setTilePosition(scrollX * 0.0025, scrollY * 0.0025);
    this.bgSpaceFront.setTilePosition(scrollX * 0.005, scrollY * 0.005);
    this.bgLandscapeMountains.setTilePosition(scrollX * 0.025, 0);
    this.bgLandscapeHills.setTilePosition(scrollX * 0.035, 0);
  }
}

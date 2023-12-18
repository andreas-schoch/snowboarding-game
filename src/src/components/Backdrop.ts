// import * as Ph from 'phaser';
// import {DEFAULT_HEIGHT, DEFAULT_WIDTH} from '../index';
// import GameScene from '../scenes/GameScene';


// export class Backdrop {
//   private scene: GameScene;
//   // private bgSpaceBack: Phaser.GameObjects.TileSprite;
//   // private bgSpaceMid: Phaser.GameObjects.TileSprite;
//   // private bgSpaceFront: Phaser.GameObjects.TileSprite;
//   // private bgLandscapeMountains: Phaser.GameObjects.TileSprite;
//   // private bgLandscapeHills: Phaser.GameObjects.TileSprite;
//   bgAir: Ph.GameObjects.TileSprite;

//   constructor(scene: GameScene) {
//     this.scene = scene;
//     // this.bgSpaceBack = this.registerLayer('bg_space_pack', 'bg_space_back.png');
//     // this.bgSpaceMid = this.registerLayer('bg_space_pack', 'bg_space_mid.png');
//     // this.bgSpaceFront = this.registerLayer('bg_space_pack', 'bg_space_front.png');

//     const g = this.scene.add.graphics();
//     g.fillStyle(0x65A9CC, 1);
//     g.fillRect(0, 0, DEFAULT_WIDTH * scene.resolutionMod, DEFAULT_HEIGHT * scene.resolutionMod);
//     g.generateTexture('bg_air', DEFAULT_WIDTH * scene.resolutionMod, DEFAULT_HEIGHT * scene.resolutionMod);
//     g.destroy();

//     this.bgAir = this.registerLayer('bg_air', '');
//   }

//   update() {
//     const {scrollX, scrollY, zoomX, zoomY} = this.scene.cameras.main;
//     // this.bgSpaceBack.setTilePosition(scrollX * 0.005, scrollY * 0.000).setScale(1 * (1 / zoomX), 1 * (1 / zoomY))
//     // this.bgSpaceMid.setTilePosition(scrollX * 0.01, scrollY * 0.01).setScale(1 * (1 / zoomX), 1 * (1 / zoomY))
//     // this.bgSpaceFront.setTilePosition(scrollX * 0.025, scrollY * 0.025).setScale(1 * (1 / zoomX), 1 * (1 / zoomY))
//     // this.bgLandscapeMountains.setTilePosition(scrollX * 0.03, 0);
//     // this.bgLandscapeHills.setTilePosition(scrollX * 0.04, 0);
//     this.bgAir.setScale(1 * (1 / zoomX), 1 * (1 / zoomY))
//   }

//   private registerLayer(atlas: string, key: string, scaleX: number = 1, scaleY: number = 1): Ph.GameObjects.TileSprite {
//     const {width, height, zoomX, zoomY, worldView} = this.scene.cameras.main;
//     return this.scene.add.tileSprite(worldView.x + width / 2, worldView.y + height / 2, width, height, atlas, key)
//     .setOrigin(0.5, 0.5)
//     .setScrollFactor(0, 0)
//     .setScale(scaleX * (1 / zoomX), scaleY * (1 / zoomY))
//     .setDepth(-200);
//   }
// }

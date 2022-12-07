import * as Ph from 'phaser';
import {stats} from '../index';
import GameScene from '../scenes/game.scene';


export class Backdrop {
  private scene: GameScene;

  private bgSpaceBack: Phaser.GameObjects.TileSprite;
  private bgSpaceMid: Phaser.GameObjects.TileSprite;
  private bgSpaceFront: Phaser.GameObjects.TileSprite;

  constructor(scene: GameScene) {
    this.scene = scene;
    this.bgSpaceBack = this.registerLayer('bg_space_back.png');
    this.bgSpaceMid = this.registerLayer('bg_space_mid.png');
    this.bgSpaceFront = this.registerLayer('bg_space_front.png');
  }

  update() {
    stats.begin('backdrop');
    const {scrollX, scrollY} = this.scene.cameras.main;
    this.bgSpaceBack.setTilePosition(scrollX * 0.005, scrollY * 0.005);
    this.bgSpaceMid.setTilePosition(scrollX * 0.01, scrollY * 0.01);
    this.bgSpaceFront.setTilePosition(scrollX * 0.025, scrollY * 0.025);
    stats.end('backdrop');
  }

  private registerLayer(key: string, scaleX: number = 1, scaleY: number = 1): Ph.GameObjects.TileSprite {
    const {width, height, zoomX, zoomY, worldView} = this.scene.cameras.main;
    return this.scene.add.tileSprite(worldView.x + width / 2, worldView.y + height / 2, width, height, 'bg_space_pack', key)
    .setOrigin(0.5, 0.5)
    .setScrollFactor(0, 0)
    .setScale(scaleX * (1 / zoomX), scaleY * (1 / zoomY))
    .setDepth(-200);
  }
}

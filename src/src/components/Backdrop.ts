import { DARKMODE_ENABLED, DEFAULT_HEIGHT, DEFAULT_WIDTH } from '../index';
import GameScene from '../scenes/GameScene';


export class Backdrop {
  private scene: GameScene;
  // private bgSpaceBack: Phaser.GameObjects.TileSprite;
  private bgSpaceMid: Phaser.GameObjects.TileSprite;
  private bgSpaceFront: Phaser.GameObjects.TileSprite;
  bgSky: Phaser.GameObjects.TileSprite;
  resolutionMod: number;

  constructor(scene: GameScene) {
    this.scene = scene;
    this.resolutionMod = this.scene.cameras.main.width / DEFAULT_WIDTH;

    // this.bgSpaceBack = this.registerLayer('bg_space_pack', 'bg_space_back.png');

    const g = this.scene.add.graphics();
    g.fillStyle(DARKMODE_ENABLED ? 0x666666 : 0x3470c6, 1);
    g.fillRect(0, 0, DEFAULT_WIDTH * this.resolutionMod, DEFAULT_HEIGHT * this.resolutionMod);
    g.generateTexture('bg_sky', DEFAULT_WIDTH * this.resolutionMod, DEFAULT_HEIGHT * this.resolutionMod);
    g.destroy();

    this.bgSky = this.registerLayer('bg_sky', '');

    if (DARKMODE_ENABLED) {
      this.bgSpaceMid = this.registerLayer('bg_space_pack', 'bg_space_mid.png');
      this.bgSpaceFront = this.registerLayer('bg_space_pack', 'bg_space_front.png');
    }
  }

  update() {
    const { scrollX, scrollY, zoomX, zoomY } = this.scene.cameras.main;
    // this.bgSpaceBack.setTilePosition(scrollX * 0.005, scrollY * 0.000).setScale(1 * (1 / zoomX), 1 * (1 / zoomY))
    if (DARKMODE_ENABLED) {
      this.bgSpaceMid.setTilePosition(scrollX * 0.01 * 0.2, scrollY * 0.01 * 0.2).setScale(1 * (1 / zoomX), 1 * (1 / zoomY))
      this.bgSpaceFront.setTilePosition(scrollX * 0.025 * 0.2, scrollY * 0.025 * 0.2).setScale(1 * (1 / zoomX), 1 * (1 / zoomY))
    }
    this.bgSky.setScale(1 * (1 / zoomX), 1 * (1 / zoomY))
  }

  private registerLayer(atlas: string, key: string, scaleX: number = 1, scaleY: number = 1): Phaser.GameObjects.TileSprite {
    const { width, height, zoomX, zoomY, worldView } = this.scene.cameras.main;
    const tilesprite = this.scene.add.tileSprite(worldView.x + width / 2, worldView.y + height / 2, width, height, atlas, key)
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0, 0)
      .setScale(scaleX * (1 / zoomX), scaleY * (1 / zoomY))
      .setDepth(-200)

    // if (DARKMODE_ENABLED) tilesprite.setPipeline('Light2D');
    return tilesprite;
  }
}

import {Settings} from './Settings';
import {GameScene} from './scenes/GameScene';
import {DEFAULT_HEIGHT, DEFAULT_WIDTH} from './index';


export class Backdrop {
  private scene: GameScene;
  private bgSky: Phaser.GameObjects.TileSprite;
  private bgSpaceMid: Phaser.GameObjects.TileSprite;
  private bgSpaceFront: Phaser.GameObjects.TileSprite;
  private resolutionMod: number;

  constructor(scene: GameScene) {
    this.scene = scene;
    this.resolutionMod = this.scene.cameras.main.width / DEFAULT_WIDTH;
    
    const g = this.scene.add.graphics();
    g.fillStyle(Settings.darkmodeEnabled() ? 0x666666 : 0x3470c6, 1);
    g.fillRect(0, 0, DEFAULT_WIDTH * this.resolutionMod, DEFAULT_HEIGHT * this.resolutionMod);
    g.generateTexture('bg_sky', DEFAULT_WIDTH * this.resolutionMod, DEFAULT_HEIGHT * this.resolutionMod);
    g.destroy();
    
    this.bgSky = this.registerLayer('bg_sky', '');
    
    if (Settings.darkmodeEnabled()) {
      this.bgSpaceMid = this.registerLayer('bg_space_pack', 'bg_space_mid.png');
      this.bgSpaceFront = this.registerLayer('bg_space_pack', 'bg_space_front.png');
    }
  }

  update() {
    const {scrollX, scrollY, zoomX, zoomY} = this.scene.cameras.main;
    if (Settings.darkmodeEnabled() && this.bgSpaceMid && this.bgSpaceFront) {
      this.bgSpaceMid.setTilePosition(scrollX * 0.01 * 0.2, scrollY * 0.01 * 0.2).setScale(1 * (1 / zoomX), 1 * (1 / zoomY));
      this.bgSpaceFront.setTilePosition(scrollX * 0.025 * 0.2, scrollY * 0.025 * 0.2).setScale(1 * (1 / zoomX), 1 * (1 / zoomY));
    }
    this.bgSky.setScale(1 * (1 / zoomX), 1 * (1 / zoomY));
  }

  private registerLayer(atlas: string, key: string, scaleX: number = 1, scaleY: number = 1): Phaser.GameObjects.TileSprite {
    const {width, height, zoomX, zoomY, worldView} = this.scene.cameras.main;
    const tilesprite = this.scene.add.tileSprite(worldView.x + width / 2, worldView.y + height / 2, width, height, atlas, key)
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0, 0)
      .setScale(scaleX * (1 / zoomX), scaleY * (1 / zoomY))
      .setDepth(-200);
    // if (Settings.darkmodeEnabled()) tilesprite.setPipeline('Light2D');
    return tilesprite;
  }
}

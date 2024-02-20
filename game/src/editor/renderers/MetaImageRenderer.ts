import {Settings} from '../../Settings';
import {XY} from '../../Terrain';
import {rubeToXY} from '../../helpers/rubeTransformers';
import {EditorImage} from '../../physics/RUBE/RubeMetaLoader';

export class MetaImageRenderer {
  constructor(private scene: Phaser.Scene, private pixelsPerMeter: number) {
  }

  render(images: EditorImage[], offset: XY = {x: 0, y: 0}) {
    for (const image of images) {
      const {meta: {center, angle, file, scale, aspectScale, flip, renderOrder, opacity}, customProps} = image;

      const textureFrame = (file || '').split('/').reverse()[0];
      const textureAtlas = customProps['phaserTexture'] as string;

      const position = rubeToXY(center);
      position.x += offset.x;
      position.y += offset.y;

      const img: Phaser.GameObjects.Image = this.scene.add.image(
        position.x * this.pixelsPerMeter,
        -position.y * this.pixelsPerMeter,
        textureAtlas || textureFrame,
        textureFrame
      );
      img.rotation = -(angle || 0);
      img.scaleY = (this.pixelsPerMeter / img.height) * scale;
      img.scaleX = img.scaleY * aspectScale;
      img.alpha = opacity || 1;
      img.flipX = flip;
      img.setDepth(renderOrder);
      img.setDataEnabled();

      // TODO deduplicate this code and RubeImageAdapter
      const isPlayerCharacterPart = customProps['playerCharacterPart'] === true;
      if (Settings.darkmodeEnabled()) {
        const isLight = customProps?.['light'] === true || textureFrame === 'present_temp.png';
        if (isPlayerCharacterPart) img.setTintFill(0x000000);
        else if (isLight) img.setTintFill(0xbbbbbb);
        else img.setTintFill(0x222222);
      }

      // draw image bounds as outline (not using tint but graphics and taking angle into account)
      // img.setInteractive();
      // img.on('pointerdown', () => {
      // });

      const graphics = this.scene.add.graphics().setDepth(100000);
      graphics.setPosition(img.x, img.y);
      graphics.fillStyle(0x00ff00, 1);
      graphics.fillCircle(0, 0, 10);

      graphics.lineStyle(2, 0x00ff00, 1);
      const width = img.width * img.scaleX;
      const height = img.height * img.scaleY;
      graphics.strokeRect(-width / 2, -height / 2, width, height);
      graphics.rotation = img.rotation;
    }
  }
}

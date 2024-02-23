import {Settings} from '../../Settings';
import {throttle} from '../../helpers/debounce';
import {EditorImage} from '../items/EditorImage';

type ImageContext = {
  imageId: string;
  image: Phaser.GameObjects.Image;
  gizmo: Phaser.GameObjects.Graphics;
  // bounds: Bounds
};
export class MetaImageRenderer {
  renderThrottled = throttle(this.render.bind(this), 100);
  private contextMap: Map<string, ImageContext> = new Map();

  constructor(private scene: Phaser.Scene, private pixelsPerMeter: number) { }

  render(images: EditorImage[], offsetX = 0, offsetY = 0, offsetAngle = 0) {
    console.log('rendering images', images, offsetX, offsetY, offsetAngle);
    const ppm = this.pixelsPerMeter;

    for (const editorImage of images) {
      const context = this.getContext(editorImage.id);
      const customProps = editorImage.getCustomProps();
      const {file, scale, aspectScale, flip, renderOrder, opacity} = editorImage.meta;
      const textureFrame = (file || '').split('/').reverse()[0];
      const textureAtlas = customProps['phaserTexture'] as string;

      const position = editorImage.getPosition();
      const angle = editorImage.getAngle();

      const twoPI = Math.PI * 2;
      let actualAngle = (angle || 0) + offsetAngle;
      if (actualAngle > twoPI) actualAngle -= twoPI;
      if (actualAngle < 0) actualAngle += twoPI;

      const image = context.image;
      image.setTexture(textureAtlas || textureFrame, textureFrame);
      image.x = (position.x + offsetX) * ppm;
      image.y = (position.y + offsetY) * ppm;
      image.rotation = actualAngle;
      image.scaleY = (ppm / image.height) * scale;
      image.scaleX = image.scaleY * aspectScale;
      image.alpha = opacity || 1;
      image.flipX = flip;
      image.setDepth(renderOrder);
      image.setDataEnabled();

      // TODO deduplicate this code and RubeImageAdapter
      const isPlayerCharacterPart = customProps['playerCharacterPart'] === true;
      if (Settings.darkmodeEnabled()) {
        const isLight = customProps['light'] === true || textureFrame === 'present_temp.png';
        if (isPlayerCharacterPart) image.setTintFill(0x000000);
        else if (isLight) image.setTintFill(0xbbbbbb);
        else image.setTintFill(0x222222);
      }

      // draw image bounds as outline (not using tint but graphics and taking angle into account)
      // img.setInteractive();
      // img.on('pointerdown', () => {
      // });

      // const graphics = context.gizmo;
      // graphics.setPosition(image.x, image.y);
      // graphics.fillStyle(0x00ff00, 1);
      // graphics.fillCircle(0, 0, 10);

      // graphics.lineStyle(2, 0x00ff00, 1);
      // const width = image.width * image.scaleX;
      // const height = image.height * image.scaleY;
      // graphics.strokeRect(-width / 2, -height / 2, width, height);
      // graphics.rotation = image.rotation;
    }
  }

  getContext(imageId: string): ImageContext {
    let context = this.contextMap.get(imageId);
    if (!context) {
      const image: Phaser.GameObjects.Image = this.scene.add.image(0, 0, 'missing');
      const gizmo = this.scene.add.graphics().setDepth(100000).fillStyle(0x00ff00, 1);
      context = {image, gizmo, imageId: imageId};
      this.contextMap.set(imageId, context);
    }
    return context;
  }
}

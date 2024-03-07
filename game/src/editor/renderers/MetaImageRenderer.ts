import {ppm} from '../..';
import {PersistedStore} from '../../PersistedStore';
import {throttle} from '../../helpers/debounce';
import {EditorImage} from '../items/EditorImage';
import {EditorObject} from '../items/EditorObject';
import {selected, setSelected} from '../items/ItemTracker';

type ImageContext = {
  imageId: string;
  image: Phaser.GameObjects.Image;
  gizmo: Phaser.GameObjects.Graphics;
  // bounds: Bounds
};
export class MetaImageRenderer {
  renderThrottled = throttle(this.render.bind(this), 100);
  private contextMap: Map<string, ImageContext> = new Map();

  constructor(private scene: Phaser.Scene) { }

  render(images: EditorImage[], offsetX = 0, offsetY = 0, offsetAngle = 0) {

    for (const editorImage of images) {
      const context = this.getContext(editorImage.id);
      const customProps = editorImage.getCustomProps();
      const {file, scale, aspectScale, flip, renderOrder, opacity} = editorImage.meta;
      const textureFrame = (file || '').split('/').reverse()[0];
      let textureAtlas = customProps['phaserTexture'] as string;

      const bodyProps = editorImage.getBodyCustomProps();
      const isPlayerCharacterPart = Boolean(bodyProps && bodyProps['phaserPlayerCharacterPart']);

      if (isPlayerCharacterPart) textureAtlas = PersistedStore.selectedCharacterSkin();

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
      image.setInteractive();
      image.on('pointerdown', () => {
        const root = this.getRootItem(editorImage);
        if (root === selected()) return;
        setSelected(root);
      });

      // TODO deduplicate this code and RubeImageAdapter
      if (PersistedStore.darkmodeEnabled()) {
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

  resetAll() {
    for (const context of this.contextMap.values()) {
      context.image.destroy();
      context.gizmo.destroy();
    }
    this.contextMap.clear();
  }

  private getContext(imageId: string): ImageContext {
    let context = this.contextMap.get(imageId);
    if (!context) {
      const image: Phaser.GameObjects.Image = this.scene.add.image(0, 0, 'missing');
      const gizmo = this.scene.add.graphics().setDepth(100000).fillStyle(0x00ff00, 1);
      context = {image, gizmo, imageId: imageId};
      this.contextMap.set(imageId, context);
    }
    return context;
  }

  private getRootItem(editorImage: EditorImage): EditorImage | EditorObject {
    let potentialRoot: EditorImage | EditorObject = editorImage;
    while (potentialRoot.parent) {
      potentialRoot = potentialRoot.parent;
    }
    return potentialRoot;
  }
}

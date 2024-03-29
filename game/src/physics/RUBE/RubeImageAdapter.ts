import {ppm} from '../..';
import {PersistedStore} from '../../PersistedStore';
import {Physics} from '../Physics';
import {BodyEntityData, RubeCustomPropsMap} from './EntityTypes';
import {RubeImage} from './RubeExport';
import {customPropsMapToArray, rubeToVec2} from './rubeTransformers';

// The loader and serializer classes themselves should not concern themselves with anything Phaser specific.
// They should not care about how we decide to render the images. That is the job of the adapter.
export class RubeImageAdapter implements IBaseAdapter {
  readonly images: Phaser.GameObjects.Image[] = [];

  constructor(private scene: Phaser.Scene) { }

  loadImage(imageJson: RubeImage, bodyEntityData: BodyEntityData | undefined, imageCustomProps: RubeCustomPropsMap): Phaser.GameObjects.Image | null {
    const {file, center, angle, aspectScale, scale, flip, renderOrder} = imageJson;
    const pos = bodyEntityData?.body ? bodyEntityData.body.GetPosition() : rubeToVec2(center);

    // For any player character part, we interject and choose a texture atlas based on what skin the player has selected.
    // const bodyProps = bodyObj ? this.physics.loader.customProps.get(bodyObj) : null;
    const isPlayerCharacterPart = Boolean(bodyEntityData?.customProps['phaserPlayerCharacterPart']);

    if (!pos) return null;

    const textureFrame = (file || '').split('/').reverse()[0];
    const textureAtlas = isPlayerCharacterPart ? PersistedStore.selectedCharacterSkin() : imageCustomProps['phaserTexture'] as string;

    const img: Phaser.GameObjects.Image = this.scene.add.image(
      pos.x * ppm,
      -pos.y * ppm,
      textureAtlas || textureFrame,
      textureFrame
    );

    img.rotation = bodyEntityData?.body ? -bodyEntityData.body.GetAngle() + -(angle || 0) : -(angle || 0);
    img.scaleY = (ppm / img.height) * scale;
    img.scaleX = img.scaleY * aspectScale;
    img.alpha = imageJson.opacity || 1;
    img.flipX = flip;
    img.setDepth(renderOrder);
    img.setDataEnabled();

    if (PersistedStore.darkmodeEnabled()) {
      const isLight = bodyEntityData?.customProps?.['light'] === true || textureFrame === 'present_temp.png';
      if (isPlayerCharacterPart) img.setTintFill(0x000000);
      else if (isLight) img.setTintFill(0xbbbbbb);
      else img.setTintFill(0x222222);
    }
    // TODO not sure if this is the way to go. If I want to keep full compatibility with RUBE, I need to somehow keep the opengl specific data.
    //  I don't know yet if I can derive them fully from just the generated phaser image. Once I start with the level editor, I'll look into it.
    img.data.set('image-json', imageJson);
    img.data.set('angle_offset', -(angle || 0)); // need to preserve original angle it was expeorted with
    this.images.push(img);
    return img;
  }

  serializeImage(image: Phaser.GameObjects.Image): RubeImage {
    const imageEntityData = Physics.instance.worldEntity.entityData.get(image);
    return {
      name: imageEntityData?.name || 'image',
      opacity: image.alpha,
      renderOrder: image.depth,
      scale: image.scaleY,
      aspectScale: image.scaleX / image.scaleY,
      angle: image.rotation,
      body: 0,
      center: {x: 0, y: 0},
      file: image.texture.firstFrame,
      flip: image.flipX,
      customProperties: customPropsMapToArray(imageEntityData?.customProps || {} as RubeCustomPropsMap),
    };
  }
}

export interface IBaseAdapter {
  images: unknown[];
  loadImage(imageJson: RubeImage, bodyEntityData: BodyEntityData | undefined, imageCustomProps: RubeCustomPropsMap): unknown | null;
  serializeImage(image: unknown): RubeImage;
}

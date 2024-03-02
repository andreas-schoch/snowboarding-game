import {game} from '..';
import {XY} from '../Terrain';

export function domToPhaserCoords(e: MouseEvent, camera: Phaser.Cameras.Scene2D.Camera): XY {
  const elementRect = game.canvas.getBoundingClientRect();
  const clickX = e.clientX - elementRect.left;
  const clickY = e.clientY - elementRect.top;

  const ratioX = clickX / elementRect.width;
  const ratioY = clickY / elementRect.height;

  const x = camera.worldView.x + (camera.worldView.width * ratioX);
  const y = camera.worldView.y + (camera.worldView.height * ratioY);

  return {x, y};
}

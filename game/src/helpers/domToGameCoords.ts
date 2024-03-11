import {game} from '..';
import {XY} from '../Terrain';

export function domToPhaserCoords(clientX: number, clientY: number, camera: Phaser.Cameras.Scene2D.Camera): XY {
  const elementRect = game.canvas.getBoundingClientRect();
  const clickX = clientX - elementRect.left;
  const clickY = clientY - elementRect.top;

  const ratioX = clickX / elementRect.width;
  const ratioY = clickY / elementRect.height;

  const x = camera.worldView.x + (camera.worldView.width * ratioX);
  const y = camera.worldView.y + (camera.worldView.height * ratioY);

  return {x, y};
}

import * as Ph from 'phaser';
import {DEFAULT_WIDTH, DEFAULT_ZOOM} from '../index';

export const setupCamera = (camera: Ph.Cameras.Scene2D.Camera) => {
  camera.setDeadzone(50, 125);
  camera.setBackgroundColor(0x555555);
  camera.setZoom(DEFAULT_ZOOM * (camera.width / DEFAULT_WIDTH));
  camera.scrollX -= camera.width;
  camera.scrollY -= camera.height;
}

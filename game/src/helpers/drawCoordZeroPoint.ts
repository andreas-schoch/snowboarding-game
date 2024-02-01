export const drawCoordZeroPoint = (scene: Phaser.Scene) => {
  const graphics = scene.add.graphics();
  graphics.lineStyle(5, 0x048708, 1.0);
  graphics.beginPath();
  graphics.moveTo(0, 0);
  graphics.lineTo(40, 0);
  graphics.closePath();
  graphics.setDepth(1000);
  graphics.strokePath();

  graphics.lineStyle(5, 0xba0b28, 1.0);
  graphics.beginPath();
  graphics.moveTo(0, 0);
  graphics.lineTo(0, 40);
  graphics.closePath();
  graphics.setDepth(1000);
  graphics.strokePath();
};

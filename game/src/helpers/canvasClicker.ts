export function clickedCanvas(pointer: Phaser.Input.Pointer): boolean {
  // Phaser may trigger events on gameobjects even when clicking outside the canvas for some reason.
  return (pointer.downElement as HTMLElement)?.tagName === 'CANVAS';
}

export function framesToTime(frames: number): number {
  return Math.floor((frames / 60) * 1000);
}

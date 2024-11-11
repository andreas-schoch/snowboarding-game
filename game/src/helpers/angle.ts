export function normalizeRadians(angle: number): number {
  // taken from phaser Math.Angle.Normalize()
  angle = angle % (2 * Math.PI);
  if (angle >= 0) return angle;
  else return angle + 2 * Math.PI;
}

export function wrapWithin(value: number, min: number, max: number): number {
  // taken from phaser Math.wrap()
  const range = max - min;
  return (min + ((((value - min) % range) + range) % range));
}

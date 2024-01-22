export function formatTimeExplicit(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  // const milliseconds = Math.floor(ms % 100);
  return minutes.toString().padStart(1, '0') + ' min ' +
         seconds.toString().padStart(1, '0') + ' sec';
  //  milliseconds.toString().padStart(2, '0') + ' ms';
}

export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  // const milliseconds = Math.floor(ms % 100);
  return minutes.toString().padStart(2, '0') + ':' +
         seconds.toString().padStart(2, '0');
  //  milliseconds.toString().padStart(1, '0');
}

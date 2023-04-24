let lastTime = 0;
export const isDoubleClick = (time = Date.now(), doubleClickTime = 300): boolean => {
  const result = time - lastTime < doubleClickTime;
  lastTime = time;
  return result;
}

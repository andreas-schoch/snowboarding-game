export const debounce = <T extends unknown[]>(fn: (...args: T) => void, delay: number) => {
  let timeoutId;
  return function (...args: T) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

export const throttle = <T extends unknown[]>(fn: (...args: T) => void, delay: number) => {
  let lastCall = 0;
  return function (...args: T) {
    const now = Date.now();
    if (now - lastCall < delay) return;
    lastCall = now;
    fn(...args);
  };
};

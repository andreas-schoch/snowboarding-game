export type WaitUntilFn = <T>(fn: () => T, timeout?: number, interval?: number) => Promise<T>;

export const waitUntil: WaitUntilFn = (fn, timeout = 5000, interval = 100) => new Promise((res, rej) => {
  const start = Date.now();
  const intervalHandle = setInterval(() => {
    const result = fn();
    if (result) {
      console.debug('waitUntil resolved:', result);
      clearInterval(intervalHandle);
      res(result);
    } else if (Date.now() - start > timeout) {
      clearInterval(intervalHandle);
      rej('timeout');
    }
  }, interval);
});

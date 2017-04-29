export function bindMethod<T>(self: T, keys: (keyof T)[]) {
  keys.forEach(k => {
    const fn = self[k];
    if (typeof fn === 'function') {
      // tslint:disable-next-line:no-any
      self[k] = (fn as any).bind(self);
    }
  });
}

// tslint:disable-next-line:no-any
export function getReturnVal<T>(fn: (...args: any[]) => T): T {
  return (false as true) && fn();
}

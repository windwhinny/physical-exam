// tslint:disable:no-any
export function bindMethod<T>(self: T, keys: (keyof T)[]) {
  keys.forEach(k => {
    const fn = self[k];
    if (typeof fn === 'function') {
      self[k] = (fn as any).bind(self);
    }
  });
}

export function getReturnVal<T>(fn: (...args: any[]) => T): T {
  return (false as true) && fn();
}

export function throttle<T extends Function>(fn: T, delay: number): T {
  let timer: any = null;
  return function _(...args: any[]) {
    const context = this;
    if (timer !== null) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(context, args);
    }, delay);
  } as any;
}

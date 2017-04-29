export function bindMethod<T>(self: T, keys: (keyof T)[]) {
  keys.forEach(k => {
    const fn = self[k];
    if (typeof fn === 'function') {
      // tslint:disable-next-line:no-any
      self[k] = (fn as any).bind(self);
    }
  });
}

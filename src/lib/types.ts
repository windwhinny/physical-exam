// tslint:disable:no-any
export function isDate(date: any): date is Date {
  if (!date) return false;
  return Object.prototype.toString.call(date) === '[object Date]';
}

export function isDateNoGuards(date: any): boolean {
  if (!date) return false;
  return Object.prototype.toString.call(date) === '[object Date]';
}

export function isNumber(num: any): num is number {
  return typeof num === 'number';
}

export function isString(str: any): str is string {
  return typeof str === 'string';
}

export function isNull(nill: any): nill is null {
  return nill === null;
}

export function isUndefined(u: any): u is undefined {
  return typeof u === 'undefined';
}

export function isBoolean(b: any): b is boolean {
  return typeof b === 'boolean';
}

export function isEmptyObject(o: any): o is ({}) {
  return !!Object.keys(o).length;
}

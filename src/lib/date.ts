export const oneSec = 1000;
export const oneMin = oneSec * 60;
export const oneHour = oneMin * 60;
export const oneDay = oneHour * 24;

export function isSomeDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

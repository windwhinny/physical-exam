export const oneSec = 1000;
export const oneMin = oneSec * 60;
export const oneHour = oneMin * 60;
export const oneDay = oneHour * 24;

export function isSameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

/**
 * 获取一个日期当天的起始时间
 */
export function getStartOfDate(idate: Date): Date {
  idate = new Date(idate);
  const year = idate.getFullYear();
  const month = idate.getMonth();
  const date = idate.getDate();

  return new Date(year, month, date);
}

/**
 * 获取一个日期当天的结束时间
 */
export function getEndOfDate(idate: Date): Date {
  idate = new Date(idate);
  const date = this.getStartOfDate(idate);

  return new Date(date.setDate(date.getDate() + 1) - 1);
}

export function getDateString(date: Date) {
  date = new Date(date);
  const month = String(date.getMonth() + 101).slice(1, 3);
  const d = String(date.getDate() + 100).slice(1, 3);
  return `${date.getFullYear()}-${month}-${d}`;
}

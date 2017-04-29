export type DataSetGetter = (start: Date, end: Date) => Promise<{ date: Date, count: number }[]>;

export type CommonCalendarProps = {
  getDataSet?: DataSetGetter,
  onSelectedDateChanged?: (d: Date) => void,
  date: Date,
}

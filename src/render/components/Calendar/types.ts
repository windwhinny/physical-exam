export type DataSetGetter = (start: Date, end: Date) => Promise<{ date: Date, count: number }[]>;

export type CommonCalendarProps = {
   getDataSet?: DataSetGetter,
  date: Date,
  onSelectedDateChanged?: (d: Date) => void,
  onHoveredMonthChanged?: (y: number, m: number) => void,
}

export type CalendarDataSet = {
  date: Date,
  records: number,
}[];

export type CommonCalendarProps = {
  dataSet?: CalendarDataSet,
  onSelectedDateChanged?: (d: Date) => void,
  date: Date,
}

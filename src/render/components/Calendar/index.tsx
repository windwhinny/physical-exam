import React = require('react');
import DateCell, { DateData } from './DateCell';
import { oneDay } from '../../../lib/date';
import {
  CalendarDataSet,
  CommonCalendarProps,
} from './types';

require('./index.scss');

type State = {
  dates: DateData[][]
}

type Props = CommonCalendarProps;

export {
  CalendarDataSet,
}

export default class Calendar extends React.Component<Props, State> {
  dates: DateData[][] = [];
  generateDates() {
    const dates: DateData[][] = [];
    const year = this.props.date.getFullYear();
    const month = this.props.date.getMonth();
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);
    const offset = startOfMonth.getDay();
    const startOfData = new Date(year, month, -offset);
    for (let i = 0; i < 6; i++) {
      let row: DateData[] = [];
      for (let j = 0; j < 7; j++) {
        const date = new Date(startOfData.getTime() + oneDay * (i * 7 +  j));
        row.push({
          date,
          disabled: date < startOfMonth || date > endOfMonth,
          haveData: false,
        });
      }
      dates.push(row);
    }

    this.dates = dates;
  }

  render() {
    this.generateDates();

    return <table className="calendar">
      <thead>
        <tr>
          <th>日</th>
          <th>一</th>
          <th>二</th>
          <th>三</th>
          <th>四</th>
          <th>五</th>
          <th>六</th>
        </tr>
      </thead>
      <tbody>
        {this.dates.map((ds, i) => <tr key={i}>
          {ds.map((d, j) => <td key={j}><DateCell dateData={d}/></td>)}
        </tr>)}
      </tbody>
    </table>;
  }
}

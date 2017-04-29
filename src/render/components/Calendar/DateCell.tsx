import React = require('react');
import cx = require('classnames');

export type DateData = {
  date: Date,
  disabled: boolean,
  haveData: boolean,
}

type State = {
  now: {
    year: number,
    month: number,
    date: number
  }
}

type Props = {
  dateData: DateData,
}

export default class DateCell extends React.Component<Props, State> {
  state: State;

  constructor(props: Props) {
    super(props);

    const now = new Date();
    this.state = {
      now: {
        year: now.getFullYear(),
        month: now.getMonth(),
        date: now.getDate(),
      }
    }
  }

  isToday(d: Date): boolean {
    const { year, month, date } = this.state.now;
    return year === d.getFullYear() &&
      month  === d.getMonth() &&
      date === d.getDate()
  }

  render() {
    const { dateData } = this.props;
    const className = cx('date-cell', {
      actived: this.isToday(dateData.date),
    });
    return <div className={className} disabled={dateData.disabled}>
      {dateData.date.getDate()}
    </div>
  }
}

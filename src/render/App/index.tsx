import React = require('react');
import CalendarScroller from '../components/Calendar/Scroller';
import SportsEvents from '../components/SportsEvents';
import { bindMethod } from '../../lib/utils';

require('./index.scss');

type State = {
  date: Date,
};

type Props = {

}

export default class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      date: new Date(),
    };

    bindMethod(this, ['onSelectedDateChanged']);
  }

  onSelectedDateChanged(date: Date) {
    this.setState({
      date,
    });
  }

  render() {
    const { date } = this.state;
    return <div className="app">
      <header>
        <div className="date">{date.getFullYear()}年{date.getMonth()}月</div>
      </header>
      <CalendarScroller
        date={date}
        onSelectedDateChanged={this.onSelectedDateChanged}/>
      <SportsEvents />
    </div>;
  }
}

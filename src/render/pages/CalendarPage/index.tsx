import React = require('react');
import { State as RootState } from '../../store';
import { connect } from 'react-redux';
import Calendar from '../../components/Calendar';
import NavigationBar, { Title, Action } from '../../components/NavigationBar';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import actions from '../../actions';
import {
  bindMethod,
} from '../../../lib/utils'

type Props = RouteComponentProps<{}> & {
  date: Date,
}

type State = {
  activeMonth: [number, number],
}

class CalendarPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const date = props.date;
    this.state = {
      activeMonth: [date.getFullYear(), date.getMonth()]
    }

    bindMethod(this, ['updateMonth']);
  }

  // componentWillReceiveProps(newProps: Props, oldProps: Props) {
  //   if (newProps.date !== oldProps.date) {
  //     const date = newProps.date;
  //     this.setState({activeMonth: [date.getFullYear(), date.getMonth()]});
  //   }
  // }

  updateMonth(year: number, month: number) {
    this.setState({
      activeMonth: [year, month],
    })
  }

  renderMonth() {
    const { activeMonth } = this.state;
    let year: number, month: number;
    year = activeMonth[0];
    month = activeMonth[1];

    return <div className="month">
      {year}年{month + 1}月
    </div>
  }

  render() {
    const { activeMonth } = this.state;
    const { date } = this.props;
    const { history } = this.props;
    return <div className="calendar-page">
      <NavigationBar onBack={history.goBack}>
        <Title>
          {this.renderMonth()}
        </Title>
        <Action>
          <Link to="/search">搜索</Link>
        </Action>
      </NavigationBar>
      <Calendar date={date}
        onSelectedDateChanged={actions.updateSelectedDate}
        onHoveredMonthChanged={this.updateMonth}
        activeMonth={activeMonth}
        />
    </div>;
  }
}

export default connect((state: RootState) => ({
  date: state.selectedDate,
}))(CalendarPage)

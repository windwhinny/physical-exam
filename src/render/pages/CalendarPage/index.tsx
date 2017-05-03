import React = require('react');
import { State as RootState } from '../../store';
import { connect } from 'react-redux';
import Calendar from '../../components/Calendar';
import NavigationBar, { Title, Action } from '../../components/NavigationBar';
import { RouteComponentProps } from 'react-router';
import TestCategoryTab from '../../components/TestCategory/Tab'
import SearchIcon from '../../components/SearchIcon';
import TestResult from '../../components/TestResult';
import { Link } from 'react-router-dom';
import actions from '../../actions';
import {
  bindMethod,
} from '../../../lib/utils'
import {
  TestType,
  TestRecord,
  Pagination,
} from '../../../constants';

require('./index.scss');

type Props = RouteComponentProps<{}> & {
  date: Date,
  type: TestType,
  records: TestRecord[],
  pending: boolean,
  error: Error | null,
  pagination: Pagination,
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

    bindMethod(this, ['updateMonth', 'onScrollToBottom', 'onSelect', 'updateSelectedDate']);
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

  componentDidMount() {
    const { date, type, pagination } = this.props;
    actions.CPClear();
    this.fetch(date, type, Object.assign({}, pagination, {
      page: 1
    }));
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

  onSelect(type: TestType) {
    const { date, pagination } = this.props;
    actions.cpChangeType(type);
    this.fetch(date, type, Object.assign({}, pagination, {
      page: 1,
    }));
  }

  fetch(date: Date, type: TestType, pagination: Pagination) {
    if (this.props.pending) return;
    actions.CPloadRecords(date, type, pagination);
  }

  onScrollToBottom() {
    const { date, type, pagination } = this.props;
    this.fetch(date, type, Object.assign({}, pagination, {
      page: pagination.page + 1,
    }));
  }

  updateSelectedDate(date: Date) {
    const { type, pagination } = this.props;
    actions.updateSelectedDate(date);
    this.fetch(date, type, Object.assign({}, pagination, {
      page: 1,
    }));
  }

  render() {
    const { activeMonth } = this.state;
    const { date, type, records } = this.props;
    const { history } = this.props;
    return <div className="calendar-page">
      <header>
        <NavigationBar onBack={history.goBack} mode="fusion">
          <Title>
            {this.renderMonth()}
          </Title>
          <Action>
            <Link to="/search"><SearchIcon/></Link>
          </Action>
        </NavigationBar>
        <Calendar date={date}
          onSelectedDateChanged={this.updateSelectedDate}
          onHoveredMonthChanged={this.updateMonth}
          activeMonth={activeMonth}
          />
      </header>
      <TestCategoryTab active={type} onSelect={this.onSelect}/>
      <TestResult records={records} type={type} onScrollToBottom={this.onScrollToBottom}/>
    </div>;
  }
}

export default connect((state: RootState) => {
  const pageState = state.calendarPage;
  return Object.assign({}, pageState, {
    date: state.selectedDate,
  });
})(CalendarPage)

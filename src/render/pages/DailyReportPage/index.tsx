import React = require('react');
import { RouteComponentProps } from 'react-router';
import NavigationBar, { Title, Action } from '../../components/NavigationBar';
import { connect } from 'react-redux';
import { State as RootState } from '../../store';
import { Link } from 'react-router-dom';
import Calendar from '../../components/Calendar';
import TestResult from '../../components/TestResult';
import url = require('url');
import actions from '../../actions';
import cx = require('classnames');
import {
  bindMethod,
} from '../../../lib/utils';
import {
  TestRecord,
  Pagination,
  TestType,
} from '../../../constants';
import {
  TestName,
} from '../../../constants';
require('./index.scss');
type Props = RouteComponentProps<{
  item: number,
}> & {
  date: Date,
  records: TestRecord[],
  pagination: Pagination,
  pending: boolean,
};

type State = {
  isCalendarShow: boolean,
  activeMonth: [number, number],
}

class DailyReportPage extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    const { date } = this.props;
    this.state = {
      isCalendarShow: false,
      activeMonth: [date.getFullYear(), date.getMonth()],
    }

    bindMethod(this, ['toggleCalendar', 'onHoveredMonthChanged', 'onScrollToBottom']);
  }

  componentDidMount() {
    this.fetch(this.props.date, Object.assign({}, this.props.pagination, {
      page: 1,
    }));
  }

  getTestType(): TestType {
    const { location } = this.props;
    const path = url.parse(location.search, true);
    return path.query.item;
  }

  fetch(date: Date, pagination: Pagination) {
    actions.DRPloadRecords(date, this.getTestType(), pagination)
  }

  componentWillReceiveProps(newProps: Props) {
    if (newProps.date.getTime() !== this.props.date.getTime()) {
      actions.DRPClear();
      const { pagination } = this.props;
      this.fetch(newProps.date, Object.assign({}, pagination, {
        page: 1,
      }));
      this.setState({
        isCalendarShow: false,
      })
    }
  }

  toggleCalendar() {
    this.setState({
      isCalendarShow: !this.state.isCalendarShow,
    })
  }
  nextPage() {
    return Object.assign({}, this.props.pagination, {
      page: this.props.pagination.page + 1,
    });
  }

  onScrollToBottom() {
    if (this.props.pending) return;
    if (this.props.pagination.done) return;
    this.fetch(this.props.date, this.nextPage());
  }

  onHoveredMonthChanged(year: number, month: number) {
    this.setState({
      activeMonth: [year, month],
    });
  }

  render() {
    const {
      history,
      location,
      date,
      records,
    } = this.props;
    const { isCalendarShow, activeMonth } = this.state;
    const path = url.parse(location.search, true);
    return <div className="daily-report">
      <NavigationBar onBack={history.goBack}>
        <Title>
          {isCalendarShow ?
          <div className="title-inner" onClick={this.toggleCalendar}>
            <div className="big-date">{activeMonth[0]}年{activeMonth[1] + 1}月</div>
         </div>
          :
          <div className="title-inner" onClick={this.toggleCalendar}>
            <div className="test-name">{TestName[path.query.item]}</div>
            <div className="date">{date.getMonth() + 1}月{date.getDate()}日</div>
          </div>
          }
        </Title>
        <Action>
          <Link to="/addStudent">添加学生信息</Link>
        </Action>
      </NavigationBar>
      <div className={cx('mask', isCalendarShow && 'show')} onClick={this.toggleCalendar}></div>
      <div className={cx('calendar-container', isCalendarShow && 'show')}>
        <Calendar
          date={date}
          onSelectedDateChanged={actions.updateSelectedDate}
          onHoveredMonthChanged={this.onHoveredMonthChanged}
          activeMonth={activeMonth}
          type={this.getTestType()}
          />
      </div>
      <TestResult type={this.getTestType()} records={records} onScrollToBottom={this.onScrollToBottom}/>
    </div>;
  }
}

export default connect((state: RootState) => ({
  date: state.selectedDate,
  records: state.dailyReportPage.records,
  pagination: state.dailyReportPage.pagination,
  pending: state.dailyReportPage.pending,
}))(DailyReportPage);

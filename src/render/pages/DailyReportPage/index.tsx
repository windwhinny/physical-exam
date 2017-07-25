import React = require('react');
import { RouteComponentProps } from 'react-router';
import NavigationBar, { Title, Action } from '../../components/NavigationBar';
import { connect } from 'react-redux';
import { State as RootState } from '../../store';
import { Link } from 'react-router-dom';
import Calendar from '../../components/Calendar';
import url = require('url');
import actions from '../../actions';
import cx = require('classnames');
import List from './List';
import Test, { Props as TestProps } from './Test';
import {
  bindMethod,
} from '../../../lib/utils';
import {
  getStartOfDate,
} from '../../../lib/date';
import {
  TestRecord,
  Pagination,
  TestType,
} from '../../../constants';
import {
  TestName,
} from '../../../constants';
require('./index.scss');
type Props = RouteComponentProps<{}> & {
  date: Date,
  records: TestRecord[],
  pagination: Pagination,
  pending: boolean,
  test: TestProps,
  type: TestType,
  ip: string | null,
  error: Error | null,
};

type State = {
  isCalendarShow: boolean,
  activeMonth: [number, number],
  tab: 'testList' | 'resultList',
}

class DailyReportPage extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    const { date } = this.props;
    this.state = {
      isCalendarShow: false,
      activeMonth: [date.getFullYear(), date.getMonth()],
      tab: 'testList',
    }

    bindMethod(this, [
      'toggleCalendar',
      'onHoveredMonthChanged',
      ]);
  }

  componentWillReceiveProps(newProps: Props) {
    if (newProps.date.getTime() !== this.props.date.getTime()) {
      this.setState({
        isCalendarShow: false,
      })
    }
  }

  isTesting() {
    const { test } = this.props;
    return test.status === 'testing';
  }

  toggleCalendar() {
    this.setState({
      isCalendarShow: !this.state.isCalendarShow,
    })
  }

  onHoveredMonthChanged(year: number, month: number) {
    this.setState({
      activeMonth: [year, month],
    });
  }

  renderNavigationBar() {
    const {
      history,
      date,
    } = this.props;
    const path = url.parse(location.search, true);
    const { isCalendarShow, activeMonth } = this.state;
    return <NavigationBar onBack={history.goBack}>
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
    </NavigationBar>;
  }

  renderCalendar() {
     const {
      date,
      type,
    } = this.props;
    const { isCalendarShow, activeMonth } = this.state;

    return <div className={cx('calendar-container', isCalendarShow && 'show')}>
      <Calendar
        date={date}
        onSelectedDateChanged={actions.updateSelectedDate}
        onHoveredMonthChanged={this.onHoveredMonthChanged}
        activeMonth={activeMonth}
        type={type}
        />
    </div>
  }

  renderBottomAction() {
    const { records } = this.props;
    if (records.length) {
      return <Link className="sync" to="/sync">同步数据</Link>
    } else {
      return null;
    }
  }

  renderList() {
    const {
      date,
      records,
      pending,
      pagination,
      test,
      type,
    } = this.props;
    const { tab } = this.state;
    const today = new Date();
    const renderResultList = () => <List
      type={type}
      records={records}
      date={date}
      pending={pending}
      pagination={pagination}
      key={1}
      />;
    const activeList = (name: typeof tab) => () => this.setState({ tab: name});
    if (getStartOfDate(today).getTime() === getStartOfDate(date).getTime()) {
      return <div className="tab">
        <ul>
          <li className={cx(tab === 'testList' && 'active')} onClick={activeList('testList')}>实时数据</li>
          <li className={cx(tab === 'resultList' && 'active')} onClick={activeList('resultList')}>今日数据</li>
        </ul>
        {tab === 'testList' ?
          <Test {...test} /> :
          [renderResultList(), this.renderBottomAction()]
        }
      </div>
    }
    return renderResultList();
  }

  render() {
    const { isCalendarShow } = this.state;
    return <div className={cx('daily-report', this.isTesting() && 'testing')}>
      {this.renderNavigationBar()}
      <div className={cx('mask', isCalendarShow && 'show')} onClick={this.toggleCalendar}></div>
      {this.renderCalendar()}
      {this.renderList()}
    </div>;
  }
}

export default connect((state: RootState) => {
  let testType = TestType.Unknow;
  const location = state.routing.location
  if (location) {
    const path = url.parse(location.search, true);
    testType = Number(path.query.item);
  }
  return Object.assign({}, state.dailyReportPage, {
    date: state.selectedDate,
    type: testType,
    test: Object.assign({}, state.dailyReportPage.test, {
      pinCode: state.app.pinCode,
      type: testType,
      mode: state.app.mode,
    }),
  });
})(DailyReportPage);

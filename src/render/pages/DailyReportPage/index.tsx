import React = require('react');
import { RouteComponentProps } from 'react-router';
import NavigationBar, { Title } from '../../components/NavigationBar';
import { connect } from 'react-redux';
import { State as RootState } from '../../store';
import Calendar from '../../components/Calendar';
import TestResult from '../../components/TestResult';
import url = require('url');
import actions from '../../actions';
import cx = require('classnames');
import {
  bindMethod,
} from '../../../lib/utils';
import {
  TestName,
} from '../../../constants';
require('./index.scss');
type Props = RouteComponentProps<{
  item: number,
}> & {
  date: Date,
};

type State = {
  isCalendarShow: boolean,
}

class DailyReportPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isCalendarShow: false,
    }

    bindMethod(this, ['toggleCalendar']);
  }

  toggleCalendar() {
    this.setState({
      isCalendarShow: !this.state.isCalendarShow,
    })
  }

  render() {
    const { history, location, date } = this.props;
    const { isCalendarShow } = this.state;
    const path = url.parse(location.search, true);

    return <div className="daily-report">
      <NavigationBar onBack={history.goBack}>
        <Title>
          <div className="title-inner" onClick={this.toggleCalendar}>
            <div className="test-name">{TestName[path.query.item]}</div>
            <div className="date">{date.getMonth() + 1}月{date.getDate()}日</div>
          </div>
        </Title>
      </NavigationBar>
      <div className={cx('mask', isCalendarShow && 'show')} onClick={this.toggleCalendar}></div>
      <div className={cx('calendar-container', isCalendarShow && 'show')}>
        <Calendar date={date} onSelectedDateChanged={actions.updateSelectedDate}/>
      </div>
      <TestResult date={date}/>
    </div>;
  }
}

export default connect((state: RootState) => ({
  date: state.selectedDate,
}))(DailyReportPage);

// tslint:disable:no-any
import React = require('react');
import { Route } from 'react-router'
import { ConnectedRouter } from 'react-router-redux'

import AddStudentPage from '../pages/AddStudentPage';
import StudentPage from '../pages/StudentPage';
import HomePage from '../pages/HomePage';
import SearchPage from '../pages/SearchPage';
import DailyReportPage from '../pages/DailyReportPage';
import SettingPage from '../pages/SettingPage';
import CalendarPage from '../pages/CalendarPage';
import SyncPage from '../pages/SyncPage';
import TestSettingPage from '../pages/SettingPage/TestSettingPage';
import { history } from '../store';
import actions from '../actions';
import { connect } from 'react-redux';
import {
  State as RootState,
} from '../store';

require('./index.scss');

type State = { };
type Props = {
  inited: boolean,
  deviceNo: string | null,
};

class App extends React.Component<Props, State> {
  componentDidMount() {
    actions.AppInit();

    setInterval(() => {
      if (this.props.deviceNo && navigator.onLine) {
        fetch(`http://zk.sinthonic.com/sportsExam/schedule/schedule-saveFacilityMessage-save.action?param={"soleIdentifying":"${this.props.deviceNo}"}`);
      }
    }, 1000 * 4);
  }

  render() {
    const { inited } = this.props;
    if (!inited) {
      return null;
    }
    return <ConnectedRouter  history={history}>
      <div id="routes">
        <Route path="/" exact component={HomePage as any}/>
        <Route path="/settings" exact component={SettingPage as any}/>
        <Route path="/settings/test" component={TestSettingPage as any} />
        <Route path="/calendar" component={CalendarPage as any} />
        <Route path="/search" component={SearchPage as any} />
        <Route path="/student" component={StudentPage as any} />
        <Route path="/daily" component={DailyReportPage as any} />
        <Route path="/addStudent" component={AddStudentPage as any} />
        <Route path="/sync" component={SyncPage as any} />
      </div>
    </ConnectedRouter >;
  }
}
export default connect((state: RootState) => ({
  inited: state.app.inited,
  deviceNo: state.app.deviceNo,
}))(App);

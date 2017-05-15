// tslint:disable:no-any
import React = require('react');
import { Route } from 'react-router'
import { ConnectedRouter } from 'react-router-redux'

import AddStudentPage from '../pages/AddStudentPage';
import StudentPage from '../pages/StudentPage';
import HomePage from '../pages/HomePage';
import SearchPage from '../pages/SearchPage';
import DailyReportPage from '../pages/DailyReportPage';
import CalendarPage from '../pages/CalendarPage';
import { history } from '../store';
import actions from '../actions';
import LoginPage from '../pages/LoginPage';
import { connect } from 'react-redux';
import {
  State as RootState,
} from '../store';

require('./index.scss');

type State = { };
type Props = {
  inited: boolean,
  user: {
    ip: string,
  } | null,
};

class App extends React.Component<Props, State> {
  componentDidMount() {
    actions.AppInit();
  }

  render() {
    const { inited, user } = this.props;
    if (!inited) {
      return null;
    }
    if (!user) {
      return <LoginPage />;
    }
    return <ConnectedRouter  history={history}>
      <div id="routes">
        <Route path="/" exact component={HomePage as any}/>
        <Route path="/calendar" component={CalendarPage as any} />
        <Route path="/search" component={SearchPage as any} />
        <Route path="/student" component={StudentPage as any} />
        <Route path="/daily" component={DailyReportPage as any} />
        <Route path="/addStudent" component={AddStudentPage as any} />
      </div>
    </ConnectedRouter >;
  }
}
export default connect((state: RootState) => ({
  inited: state.app.inited,
  user: state.user,
}))(App);

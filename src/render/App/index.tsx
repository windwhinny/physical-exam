// tslint:disable:no-any
import React = require('react');
import { Provider } from 'react-redux';
import { Route } from 'react-router'
import { ConnectedRouter } from 'react-router-redux'

import AddStudentPage from '../pages/AddStudentPage';
import HomePage from '../pages/HomePage';
import SearchPage from '../pages/SearchPage';
import DailyReportPage from '../pages/DailyReportPage';
import CalendarPage from '../pages/CalendarPage';
import store, { history } from '../store';

require('./index.scss');

type State = { };
type Props = { };

export default class App extends React.Component<Props, State> {
  render() {
    return <Provider store={store}>
      <ConnectedRouter  history={history}>
        <div id="routes">
          <Route path="/" exact component={HomePage as any}/>
          <Route path="/calendar" component={CalendarPage} />
          <Route path="/search" component={SearchPage} />
          <Route path="/daily" component={DailyReportPage as any} />
          <Route path="/addStudent" component={AddStudentPage} />
        </div>
      </ConnectedRouter >
    </Provider>;
  }
}

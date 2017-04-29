import React = require('react');
import { State } from '../../store';
import { connect } from 'react-redux';
import store from '../../store';
import { bindActionCreators } from '../../utils';
import CalendarScroller from '../../components/Calendar/Scroller';
import * as UserActions from '../../actions/user';
import * as SelectedDateActions from '../../actions/selectedDate';
import TestCategory from '../../components/TestCategory';
type Props = {
  date: Date,
  user: null | { ip: string},
}

const actions = bindActionCreators(
  Object.assign({}, UserActions, SelectedDateActions),
  store.dispatch);

class HomePage extends React.Component<Props, void> {
  render() {
    const { date, user } = this.props;
    return <div className="home-page">
      <header>
        {date.getFullYear()}年{date.getMonth() + 1}月{date.getDate()}日
      </header>
      <div onClick={actions.loginOrLogout}>{user ? '退出' : '登陆'}</div>
      <CalendarScroller date={date} onSelectedDateChanged={actions.updateSelectedDate}/>
      <TestCategory />
    </div>;
  }
}

export default connect((state: State) => {
  return {
    date: state.selectedDate,
    user: state.user,
  }
})(HomePage);

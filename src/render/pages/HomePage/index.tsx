import React = require('react');
import { State } from '../../store';
import { connect } from 'react-redux';
import CalendarScroller from '../../components/Calendar/Scroller';
import TestCategory from '../../components/TestCategory';
import { Link } from 'react-router-dom';
import actions from '../../actions';
type Props = {
  date: Date,
  user: null | { ip: string},
}

class HomePage extends React.Component<Props, void> {
  render() {
    const { date, user } = this.props;
    return <div className="home-page">
      <header>
        {date.getFullYear()}年{date.getMonth() + 1}月{date.getDate()}日
        <Link to="/calendar">查看更多</Link>
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

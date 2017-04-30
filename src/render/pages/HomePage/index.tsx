import React = require('react');
import { State } from '../../store';
import { connect } from 'react-redux';
import CalendarScroller from '../../components/Calendar/Scroller';
import NavigationBar, {
  Title,
  Action,
} from '../../components/NavigationBar';
import TestCategory from '../../components/TestCategory';
import { Link } from 'react-router-dom';
import actions from '../../actions';
require('./index.scss');
type Props = {
  date: Date,
  user: null | { ip: string},
}

class HomePage extends React.Component<Props, void> {
  render() {
    const { date, user } = this.props;
    return <div className="home-page">
      <header>
        <NavigationBar mode="fusion">
          <Title>
            <div className="month">{date.getFullYear()}年{date.getMonth() + 1}月</div>
            <Link to="/calendar">{'查看更多>'}</Link>
          </Title>
          <Action>
            <div className="login" onClick={actions.loginOrLogout}>{user ? '退出' : '登陆'}</div>
          </Action>
        </NavigationBar>
        <CalendarScroller date={date} onSelectedDateChanged={actions.updateSelectedDate}/>
      </header>
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

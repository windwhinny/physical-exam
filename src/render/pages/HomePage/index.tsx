import React = require('react');
import { State as RootState } from '../../store';
import { connect } from 'react-redux';
import CalendarScroller from '../../components/Calendar/Scroller';
import Dialog from '../../components/Dialog';
import NavigationBar, {
  Title,
  Action,
} from '../../components/NavigationBar';
import TestCategory from '../../components/TestCategory';
import { Link } from 'react-router-dom';
import actions from '../../actions';
import {
  bindMethod,
} from '../../../lib/utils';
require('./index.scss');
type Props = {
  date: Date,
  user: null | { ip: string},
}

type State = {
  showLoginDialog: boolean,
}

class HomePage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showLoginDialog: false,
    }
    bindMethod(this, ['onLogin', 'showLogin', 'onCloseDialog']);
  }

  showLogin() {
    this.setState({
      showLoginDialog: true,
    });
  }

  onLogin() {
    const input = this.refs.input as HTMLInputElement;
    if (!input || !input.value) return;
    actions.loginOrLogout(input.value);
    this.setState({
      showLoginDialog: false,
    });
  }

  onCloseDialog() {
    this.setState({
      showLoginDialog: false,
    });
  }

  render() {
    const { date, user } = this.props;
    const { showLoginDialog } = this.state;
    return <div className="home-page">
      <header>
        <NavigationBar mode="fusion">
          <Title>
            <div className="month">{date.getFullYear()}年{date.getMonth() + 1}月</div>
            <Link to="/calendar">{'查看更多>'}</Link>
          </Title>
          <Action>
            <div className="login" onClick={this.showLogin}>{user ? '退出' : '登陆'}</div>
          </Action>
        </NavigationBar>
        <CalendarScroller date={date} onSelectedDateChanged={actions.updateSelectedDate}/>
      </header>
      <TestCategory />
      {showLoginDialog &&
        <Dialog title="IP地址登陆" onConfirm={this.onLogin} onCancel={this.onCloseDialog} confirmText="登陆">
          <input ref="input" placeholder="请输入IP地址"/>
        </Dialog>
      }
    </div>;
  }
}

export default connect((state: RootState) => {
  return {
    date: state.selectedDate,
    user: state.user,
  }
})(HomePage);

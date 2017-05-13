import React = require('react');
import cx = require('classnames');
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
    bindMethod(this, ['onLogin', 'showLogin', 'onCloseDialog', 'checkLogin']);
  }

  showLogin() {
    const { user } = this.props;
    if (!user) {
      this.setState({
        showLoginDialog: true,
      });
    } else {
      actions.loginOrLogout(null);
    }
  }

  checkLogin(event: React.MouseEvent<HTMLDivElement>) {
    const { user } = this.props;
    const { showLoginDialog } = this.state;
    if (!user && !showLoginDialog) {
      event.preventDefault();
      event.stopPropagation();
      this.setState({
        showLoginDialog: true,
      });
    }
  }

  onLogin() {
    const input = this.refs.input as HTMLInputElement;
    if (!input || !input.value) return;
    if (!input.value.match(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/)) return;
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
    return <div className="home-page" onClickCapture={this.checkLogin}>
      <header>
        <NavigationBar mode="fusion">
          <Title>
            <div className="month">{date.getFullYear()}年{date.getMonth() + 1}月</div>
            <Link to="/calendar">{'查看更多>'}</Link>
          </Title>
          <Action>
            <div className={cx(user ? 'logout' : 'login')} onClick={this.showLogin}>
              <svg width="34" height="30" viewBox="0 0 34 30">
                {user ?
                  <path fillRule="evenodd" fill="#FFFFFF" d="M32.592,16.414 L32.592,16.414 L30.000,18.999 L30.000,26.000 C30.000,28.209 28.209,30.000 26.000,30.000 L4.000,30.000 C1.791,30.000 -0.000,28.209 -0.000,26.000 L-0.000,4.000 C-0.000,1.791 1.791,-0.000 4.000,-0.000 L26.000,-0.000 C28.209,-0.000 30.000,1.791 30.000,4.000 L30.000,11.001 L34.010,15.000 L32.592,16.414 ZM30.171,16.000 L30.000,16.000 L30.000,16.171 L30.171,16.000 ZM29.994,14.000 L29.994,13.823 L26.920,10.757 L28.338,9.343 L29.994,10.995 L29.994,7.000 L28.000,7.000 L28.000,4.000 C28.000,2.895 27.105,2.000 26.000,2.000 L4.000,2.000 C2.895,2.000 2.000,2.895 2.000,4.000 L2.000,26.000 C2.000,27.105 2.895,28.000 4.000,28.000 L26.000,28.000 C27.105,28.000 28.000,27.105 28.000,26.000 L28.000,23.000 L29.994,23.000 L29.994,19.005 L28.338,20.657 L26.920,19.243 L29.994,16.177 L29.994,16.000 L15.030,16.000 L15.030,14.000 L29.994,14.000 ZM30.000,13.829 L30.000,14.000 L30.171,14.000 L30.000,13.829 ZM31.097,15.077 L31.174,15.000 L31.097,14.923 L31.097,15.077 Z"/>
                  :
                  <path fillRule="evenodd" fill="#FFFFFF" d="M30.000,30.000 L8.000,30.000 C5.791,30.000 4.000,28.209 4.000,26.000 L4.000,23.000 L6.000,23.000 L6.000,26.000 C6.000,27.105 6.895,28.000 8.000,28.000 L30.000,28.000 C31.105,28.000 32.000,27.105 32.000,26.000 L32.000,4.000 C32.000,2.895 31.105,2.000 30.000,2.000 L8.000,2.000 C6.895,2.000 6.000,2.895 6.000,4.000 L6.000,7.000 L4.000,7.000 L4.000,4.000 C4.000,1.791 5.791,-0.000 8.000,-0.000 L30.000,-0.000 C32.209,-0.000 34.000,1.791 34.000,4.000 L34.000,26.000 C34.000,28.209 32.209,30.000 30.000,30.000 ZM11.845,10.757 L13.260,9.343 L18.916,15.000 L17.502,16.414 L17.502,16.414 L13.260,20.657 L11.845,19.243 L15.088,16.000 L-0.011,16.000 L-0.011,14.000 L15.088,14.000 L11.845,10.757 ZM16.088,15.000 L16.011,14.923 L16.011,15.077 L16.088,15.000 Z"/>
                }
              </svg>
              <div>{user ? '退出' : '登陆'}</div>
            </div>
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

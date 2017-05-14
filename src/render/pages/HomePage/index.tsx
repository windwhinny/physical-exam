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
        <svg width="868" height="200" viewBox="0 0 868 200">
          <path fill="#ffffff" d="M919.142,227.5l-46.354,130.5l-902.042,25.403l-0.246,-121.403c0,0 15.24,-47.547 31.077,-66c27.75,-32.333 62.814,-128 135.423,-128c48.832,0 73.131,76 119,76c68.058,0 72.448,-33.395 157,-72c37.828,-17.272 29.395,115 72,115c45.486,0 12.925,-187 84,-187c53.174,0 69.67,117.345 112,117c36.087,-0.294 59.398,-58.42 105,-53c39.432,4.687 63.438,43.433 81,65c22.19,27.25 52.142,98.5 52.142,98.5Z" fillOpacity="0.2"/>
          <path fill="#ffffff" d="M925,292.5c-81.665,25.766 -775.791,95.303 -927.453,80.387c-56.655,-5.573 5.564,-143.719 17.477,-169.887c57.541,-126.396 109.472,-141.773 140.976,-137c37.767,5.722 54.929,68.581 75.297,97.387c21.673,30.652 44.442,72.171 72.75,59c33.45,-15.565 100.838,-152.387 127.953,-152.387c41.584,0 29.395,115 72,115c45.486,0 24.328,-145 84,-145c53.174,0 34.67,78.345 77,78c36.087,-0.294 62.681,-53.225 102.449,-48.014c40.823,5.348 72.959,30.95 87.551,52.619c14.41,21.399 94.603,162.133 70,169.895Z" fillOpacity="0.2"/>
          <path fill="#ffffff" d="M0.142,200c20.514,-48.845 59.359,-116.442 116.858,-115c71.029,1.781 116.85,130.091 167.007,120.889c50.156,-9.202 56.851,-161.849 108.993,-116.889c108.867,93.872 105.431,-6.539 156,-39c65.259,-41.891 85.969,189.441 243.241,71.678c27.715,-20.753 75.517,3.884 75.759,4.322l80.333,63l-7.836,139.687l-968.667,18.333l28.312,-147.02Z" fillOpacity="0.4"/>
        </svg>
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

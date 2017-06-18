import React = require('react');
import { State as RootState } from '../../store';
import { connect } from 'react-redux';
import CalendarScroller from '../../components/Calendar/Scroller';
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
  mode: string,
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
    bindMethod(this, ['logout', 'onCloseDialog']);
  }

  logout() {
    actions.loginOrLogout(null);
  }


  onCloseDialog() {
    this.setState({
      showLoginDialog: false,
    });
  }

  setMode(mode: string) {
    actions.AppChangeMode(mode);
  }

  render() {
    const {
      date,
      // mode
    } = this.props;

    return <div className="home-page">
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
            <Link to="/settings">
              <svg viewBox="0 0 1024 1024" width="200" height="200">
                <path fill="#ffffff" d="M516.224 343.722667c-93.056 0-168.746667 75.776-168.746667 168.789333 0 93.056 75.648 168.832 168.746667 168.832 93.013333 0 168.704-75.733333 168.704-168.832S609.237333 343.722667 516.224 343.722667zM516.224 643.754667c-72.490667 0-131.242667-58.752-131.242667-131.242667 0-72.533333 58.752-131.242667 131.242667-131.242667 72.533333 0 131.2 58.709333 131.2 131.242667C647.424 585.002667 588.757333 643.754667 516.224 643.754667z"></path>
                <path fill="#ffffff" d="M905.685333 588.288c-41.642667-71.509333-16.554667-163.541333 55.978667-205.269333l17.834667-10.24-109.354667-188.373333-17.92 10.538667c-22.912 13.312-49.066667 20.437333-75.648 20.437333-83.157333 0-150.912-67.84-150.912-151.04L625.664 43.733333 406.912 43.776l0.170667 20.693333c0.170667 26.538667-6.784 52.650667-20.138667 75.562667-26.709333 46.08-76.842667 74.709333-130.730667 74.709333-26.581333 0-52.864-7.082667-76.032-20.309333l-17.92-10.282667L52.864 372.48l18.133333 10.197333c23.168 13.141333 42.368 32.085333 55.594667 54.997333 41.429333 71.296 16.469333 163.285333-55.637333 205.013333l-17.792 10.325333 109.312 188.202667 17.92-10.453333C203.093333 817.536 229.205333 810.666667 255.744 810.666667c82.816 0 150.4 67.328 150.784 150.229333L406.656 981.333333l218.581333 0-0.085333-20.565333c0-26.24 6.826667-52.096 20.096-74.922667 26.709333-45.994667 76.885333-74.666667 130.645333-74.666667 26.410667 0 52.522667 6.954667 75.690667 20.181333l17.92 10.24 109.312-188.330667-18.005333-10.24C937.898667 630.101333 918.826667 611.072 905.685333 588.288zM853.717333 786.432c-24.448-10.752-50.944-16.341333-77.781333-16.341333-68.565333 0-132.437333 36.48-166.485333 95.274667-13.312 23.04-21.76 48.597333-24.576 74.837333l-138.154667 0c-10.709333-95.786667-92.373333-170.709333-190.933333-170.794667-26.922667 0-53.376 5.674667-77.696 16.384l-69.034667-118.826667c78.208-57.088 102.613333-164.864 53.333333-249.770667C148.949333 393.984 130.730667 373.845333 108.970667 358.186667L178.005333 239.36C202.666667 250.24 229.333333 255.872 256.213333 255.872c68.693333 0 132.437333-36.437333 166.570667-95.146667 13.525333-23.253333 21.930667-49.152 24.661333-75.818667l137.898667 0c10.325333 96.298667 92.074667 171.605333 191.146667 171.605333 26.922667 0 53.589333-5.674667 77.994667-16.597333l69.077333 118.741333c-78.72 57.045333-103.168 165.034667-53.888 250.24 13.482667 23.082667 31.573333 43.093333 53.077333 58.581333L853.717333 786.432z"></path>
              </svg>
              <span>设置</span>
            </Link>
          </Action>
        </NavigationBar>
        <CalendarScroller date={date} onSelectedDateChanged={actions.updateSelectedDate}/>
      </header>
      <TestCategory />
      {/*{mode === 'normal' ?
        <button className="mode normal" onClick={() => this.setMode('midterm')}>当前为普通测试，切换为中考模式</button>
        :
        <button className="mode midterm" onClick={() => this.setMode('normal')}>当前为中考模式，切换为普通模式</button>
      }*/}
    </div>;
  }
}

export default connect((state: RootState) => {
  return {
    date: state.selectedDate,
    user: state.user,
    mode: state.app.mode,
  }
})(HomePage);

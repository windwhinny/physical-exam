import React = require('react');
import { connect } from 'react-redux';
import NavigationBar, { Title } from '../../components/NavigationBar';
import { State as RootState } from '../../reducers';
import actions from '../../actions';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import Arrow from '../../components/Arrow';
import {
  bindMethod,
} from '../../../lib/utils';
import './index.scss'

type Props = RouteComponentProps<{}> & {
  pinCode: string | null,
  round: number,
}

type State = {
  pinCode: string | null,
  round: number,
}

class SettingPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      pinCode: props.pinCode,
      round: props.round,
    }
    bindMethod(this, ['onSubmit', 'pinCodeOnChange', 'onCancel', 'roundOnChange']);
  }

  onSubmit(event: React.FormEvent<HTMLFormElement>) {
    const { round } = this.state;
    event.preventDefault();
    actions.AppUpdatePinCode(this.state.pinCode as string);
    if (round <= 0 || isNaN(round)) {
      actions.AppUpdateTestRound(1);
    } else {
      actions.AppUpdateTestRound(this.state.round);
    }
    this.onCancel();
  }

  pinCodeOnChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      pinCode: event.currentTarget.value,
    });
  }

  roundOnChange(event: React.ChangeEvent<HTMLInputElement>) {
    let round = Number(event.currentTarget.value);
    this.setState({
      round,
    });
  }

  onCancel() {
    this.props.history.goBack();
  }

  render() {
    const { pinCode } = this.state;

    return <div className="setting-page">
      <NavigationBar onBack={this.onCancel}>
        <Title>设置</Title>
      </NavigationBar>
      <form onSubmit={this.onSubmit}>
        <fieldset>
          <label className="row space-between">
            <p className="field-name">读卡器 PIN 码</p>
            <input name="pinCode" placeholder="请输入 PIN 码" value={pinCode || ''} onChange={this.pinCodeOnChange}/>
          </label>
          <Link className="row space-between" to="/sync">同步数据<Arrow/></Link>
          <Link className="row space-between" to="/settings/test">测试设置<Arrow/></Link>
          {/* <label>
            <p className="field-name">测试轮数</p>
            <input name="round" placeholder="请输入数字" value={round || ''} type="number" onChange={this.roundOnChange}/>
          </label> */}
        </fieldset>
        <div className="actions">
          <button type="submit" className="btn">保存</button>
        </div>
      </form>
    </div>;
  }
}

export default connect((state: RootState) => {
  return {
    pinCode: state.app.pinCode,
    round: state.app.testRound,
  };
})(SettingPage);

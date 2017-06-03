import React = require('react');
import { connect } from 'react-redux';
import NavigationBar, { Title } from '../../components/NavigationBar';
import { State as RootState } from '../../reducers';
import actions from '../../actions';
import { RouteComponentProps } from 'react-router';
import {
  bindMethod,
} from '../../../lib/utils';
import './index.scss'

type Props = RouteComponentProps<{}> & {
  pinCode: string | null,
  ip: string | null,
}

type State = {
  ip: string | null,
  pinCode: string | null,
}

class SettingPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      ip: props.ip,
      pinCode: props.pinCode,
    }
    bindMethod(this, ['onSubmit', 'ipOnChange', 'pinCodeOnChange', 'onCancel']);
  }

  onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!this.isValid()) return;
    actions.AppUpdatePinCode(this.state.pinCode as string);
    actions.loginOrLogout(this.state.ip as string);
    this.onCancel();
  }

  ipOnChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      ip: event.currentTarget.value,
    });
  }

  pinCodeOnChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      pinCode: event.currentTarget.value,
    });
  }

  isValid(): boolean {
    const { ip } = this.state;
    if (ip && !ip.match(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/)) return false;
    return true;
  }

  onCancel() {
    this.props.history.goBack();
  }


  render() {
    const { pinCode, ip } = this.state;

    return <div className="setting-page">
      <NavigationBar onBack={this.onCancel}>
        <Title>设置</Title>
      </NavigationBar>
      <form onSubmit={this.onSubmit}>
        <fieldset>
          <label>
            <p className="field-name">上传服务器 IP 地址</p>
            <input name="ip" placeholder="请输入IP地址" value={ip || ''} onChange={this.ipOnChange}/>
          </label>
          <label>
            <p className="field-name">读卡器 PIN 码</p>
            <input name="pinCode" placeholder="请输入 PIN 码" value={pinCode || ''} onChange={this.pinCodeOnChange}/>
          </label>
        </fieldset>
        <div className="actions">
          <button type="submit" className="btn" disabled={!this.isValid()}>保存</button>
        </div>
      </form>
    </div>;
  }
}

export default connect((state: RootState) => {
  return {
    pinCode: state.app.pinCode,
    ip: state.user ? state.user.ip : null,
  };
})(SettingPage);

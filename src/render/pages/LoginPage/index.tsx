import React = require('react');
import './index.scss';
import actions from '../../actions';
type Props = {

}

export default class LoginPage extends React.Component<Props, void> {
  onLogin() {
    const input = this.refs.input as HTMLInputElement;
    if (!input || !input.value) return;
    if (!input.value.match(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/)) return;
    actions.loginOrLogout(input.value);
  }
  render() {
    return <div className="login-page">
      <h3>IP 地址登陆</h3>
      <input ref="input" placeholder="请输入IP地址"/>
      <button onClick={() => this.onLogin()}>登陆</button>
    </div>;
  }
}

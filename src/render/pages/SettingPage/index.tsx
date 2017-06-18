import React = require('react');
import { connect } from 'react-redux';
import NavigationBar, { Title, Action } from '../../components/NavigationBar';
import { State as RootState } from '../../reducers';
import actions from '../../actions';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import {
  bindMethod,
} from '../../../lib/utils';
import './index.scss'

type Props = RouteComponentProps<{}> & {
  pinCode: string | null,
}

type State = {
  pinCode: string | null,
}

class SettingPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      pinCode: props.pinCode,
    }
    bindMethod(this, ['onSubmit', 'pinCodeOnChange', 'onCancel']);
  }

  onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    actions.AppUpdatePinCode(this.state.pinCode as string);
    this.onCancel();
  }

  pinCodeOnChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      pinCode: event.currentTarget.value,
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
        <Action>
          <Link to="/sync">同步数据</Link>
        </Action>
      </NavigationBar>
      <form onSubmit={this.onSubmit}>
        <fieldset>
          <label>
            <p className="field-name">读卡器 PIN 码</p>
            <input name="pinCode" placeholder="请输入 PIN 码" value={pinCode || ''} onChange={this.pinCodeOnChange}/>
          </label>
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
  };
})(SettingPage);

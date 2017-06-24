import React = require('react');
import NavigationBar, { Title } from '../../components/NavigationBar';
import cx = require('classnames');
import { RouteComponentProps } from 'react-router';
import BlueToothService from '../../services/Bluetooth';
import RecordService from '../../services/Record';
import { connect } from 'react-redux';
import { State as RootState } from '../../store';
import actions from '../../actions';
import Dialog from '../../components/Dialog';
import {
  bindMethod,
} from '../../../lib/utils';
import './index.scss';
type Device = {
  name: string,
  address: string,
}
type Props = RouteComponentProps<{}>& {
  ip: string
}

type State = {
  devices: Device[],
  selectedType: 'http' | 'bluetooth',
  ip: string | null,
  searchingBluetoothDevices: boolean,
  updateProgress: {
    uploading: boolean,
    total: number,
    processed: number,
    showDialog: boolean,
    error: boolean | string,
  },
}

export class SyncPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      devices: [],
      ip: props.ip,
      selectedType: 'http',
      searchingBluetoothDevices: false,
      updateProgress: {
        uploading: false,
        total: 0,
        processed: 0,
        showDialog: false,
        error: false,
      },
    }
    bindMethod(this, [
      'onCancel',
      'closeDialog',
      ]);
  }
  onCancel() {
    this.props.history.goBack();
  }

  componentDidMount() {
    this.setState({
      searchingBluetoothDevices: true,
    });
    BlueToothService('listDevices')((device: Device) => {
      this.setState({
        devices: this.state.devices.concat(device),
        searchingBluetoothDevices: false,
      })
    });
  }

  async sync(address: string, type: 'http' | 'bluetooth') {
    const { ip } = this.props;
    if (!ip) return;
    let { updateProgress } = this.state;
    let processed = 0;
    let uploaded = 0;
    updateProgress = Object.assign({}, updateProgress, {
      uploading: true,
      error: false,
    });
    this.setState({ updateProgress })
    try {
      await RecordService('sync')((t, p, u) => {
        updateProgress = Object.assign({}, updateProgress, {
          total: t,
          processed: p,
        });
        this.setState({ updateProgress })
        processed = p;
        uploaded = u;
      }, address, type);
    } catch (e) {
      updateProgress = Object.assign({}, updateProgress, {
        error: true,
      });
    }
    updateProgress = Object.assign({}, updateProgress, {
      uploading: false,
      showDialog: true,
    });
    if (processed !== uploaded) {
      updateProgress.error = '部分数据上传失败';
      updateProgress.showDialog = true;
    }
    this.setState({ updateProgress });
  }

  renderDeviceList() {
    const { devices } = this.state;
    return <ul className="device-list">
      {devices.map( device => {
        return <li key={device.address} onClick={() => {
          this.sync(device.address, 'bluetooth');
        }}>
          <p>{device.name}</p>
          <span>{device.address}</span>
        </li>
      })}
    </ul>
  }

  isIPValid(ip: string): boolean {
    if (!ip) return false;
    if (ip && !ip.match(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/)) {
      return false;
    };
    return true;
  }

  ipOnChange(event: React.ChangeEvent<HTMLInputElement>) {
    const ip = event.currentTarget.value;
    this.setState({
      ip,
    });
    if (this.isIPValid(ip)) {
      actions.loginOrLogout(ip);
    }
  }

  renderIPInput() {
    const { ip } = this.state;
    return <label>
      <p className="field-name">上传服务器 IP 地址</p>
      <input name="ip" placeholder="请输入IP地址" value={ip || ''} onChange={this.ipOnChange}/>;
    </label>
  }

  renderBottomAction() {
    const { ip } = this.props;
    const {
       updateProgress,
       searchingBluetoothDevices,
    } = this.state;
    if (updateProgress.uploading) {
      return <progress className="sync" max={updateProgress.total} value={updateProgress.processed} />
    } else if (this.state.selectedType === 'http') {
      if (!this.isIPValid(ip)) {
        return <button className="sync" disabled>IP 设置不正确，暂不能上传</button>
      } else {
        return <button className="sync" onClick={() => this.sync(ip, 'http')}>同步数据</button>
      }
    } else if (searchingBluetoothDevices) {
      return <button className="sync" disabled>正在搜索蓝牙设备...</button>
    } else {
      return <button className="sync">请选择蓝牙设备</button>
    }
  }

  closeDialog() {
    let { updateProgress } = this.state;
    updateProgress = Object.assign({}, updateProgress, {
      showDialog: false,
    });
    this.setState({
      updateProgress,
    })
  }

  renderDialog() {
    const { updateProgress } = this.state;
    if (updateProgress.showDialog) {
      const msg = typeof updateProgress.error === 'string' ?
        updateProgress.error
        :
        updateProgress.error ?
          '上传失败'
          :
          '上传成功';
      return <Dialog
          title={msg}
          onConfirm={this.closeDialog}
          onCancel={this.closeDialog}/>;
    }
    return null;
  }

  select(type: 'http' | 'bluetooth') {
    if (this.state.selectedType === type) return;
    this.setState({
      selectedType: type,
    });
  }

  render() {
    const { selectedType } = this.state;
    return <div className="sync-page">
      <NavigationBar onBack={this.onCancel}>
        <Title>同步</Title>
      </NavigationBar>
      <div className="tab">
        <ul>
          <li className={cx(selectedType === 'http' && 'active')} onClick={() => this.select('http')}>网络</li>
          <li className={cx(selectedType === 'bluetooth' && 'active')} onClick={() => this.select('bluetooth')}>蓝牙</li>
        </ul>
      </div>
      <div className="container">
        {selectedType === 'http' ?
          this.renderIPInput() :
          this.renderDeviceList()}
      </div>
      {this.renderBottomAction()}
      {this.renderDialog()}
    </div>
  }
}

export default connect((state: RootState) => {
  return Object.assign({}, {
    ip: state.user ? state.user.ip : null,
  });
})(SyncPage);

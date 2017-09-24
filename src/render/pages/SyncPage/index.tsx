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
import Score from '../../components/Score';
import URL = require('url');
import {
  TestRecord,
  TestName,
} from '../../../constants';
import {
  bindMethod,
} from '../../../lib/utils';
import {
  getDateString,
} from '../../../lib/date';
import './index.scss';
type Device = {
  name: string,
  address: string,
}
type Props = RouteComponentProps<{}>& {
  uploadUrl: string,
  deviceNo: string | null,
}

type State = {
  faildRecords: {
    record: TestRecord,
    message: string,
  }[],
  devices: Device[],
  selectedType: 'http' | 'bluetooth',
  uploadUrl: string | null,
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
      faildRecords: [],
      devices: [],
      uploadUrl: props.uploadUrl,
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
      'uploadUrlOnChange',
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
    let { updateProgress } = this.state;
    let processed = 0;
    let uploaded = 0;
    updateProgress = Object.assign({}, updateProgress, {
      uploading: true,
      error: false,
    });
    this.setState({ updateProgress });
    const faildRecords: {
      record: TestRecord,
      message: string,
    }[] = [];
    try {
      await RecordService('sync')((t, p, u) => {
        updateProgress = Object.assign({}, updateProgress, {
          total: t,
          processed: p,
        });
        this.setState({ updateProgress })
        processed = p;
        uploaded = u;
      },
      (record, message) => {
        faildRecords.push({
          record,
          message,
        });
      },
      address, this.props.deviceNo, type);
    } catch (e) {
      updateProgress = Object.assign({}, updateProgress, {
        error: true,
      });
    }
    updateProgress = Object.assign({}, updateProgress, {
      uploading: false,
      showDialog: true,
    });
    if (faildRecords.length) {
      updateProgress = Object.assign({}, updateProgress, {
        showDialog: false,
      });
      this.setState({
        faildRecords,
        updateProgress,
      });
    } else {
      this.setState({ updateProgress });
    }
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

  isUrlValid(url: string): boolean {
    if (!url) return false;
    const obj = URL.parse(url, true);
    if (!obj.protocol) return false;
    if (!obj.host) return false;
    return true;
  }

  uploadUrlOnChange(event: React.ChangeEvent<HTMLInputElement>) {
    const uploadUrl = event.currentTarget.value;
    this.setState({
      uploadUrl,
    });
    if (this.isUrlValid(uploadUrl)) {
      actions.AppSetUploadUrl(uploadUrl);
    }
  }

  renderIPInput() {
    const { uploadUrl } = this.state;
    return <label>
      <p className="field-name">上传服务器地址</p>
      <input name="ip" placeholder="请输入上传地址" value={uploadUrl || ''} onChange={this.uploadUrlOnChange}/>
    </label>
  }

  renderBottomAction() {
    const { uploadUrl } = this.props;
    const {
       updateProgress,
       searchingBluetoothDevices,
    } = this.state;
    if (updateProgress.uploading) {
      return <div className="progress">
        <span className="prec">上传进度 {updateProgress.total ? Math.round(updateProgress.processed / updateProgress.total * 100) : 0}%</span>
        <progress className="sync" max={updateProgress.total} value={updateProgress.processed} />
      </div>;
    } else if (this.state.selectedType === 'http') {
      if (!this.isUrlValid(uploadUrl)) {
        return <button className="sync" disabled>地址设置不正确，暂不能上传</button>
      } else {
        return <button className="sync" onClick={() => this.sync(uploadUrl, 'http')}>同步数据</button>
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

  renderFaildPage() {
    const { faildRecords } = this.state;
    return <div className="sync-page">
      <NavigationBar onBack={() => {
        this.setState({
          faildRecords: [],
        });
       }}>
        <Title>以下数据上传失败</Title>
      </NavigationBar>
      <div className="faild-list">
        <table>
          <thead>
            <tr>
              <td>项目</td>
              <td>姓名</td>
              <td>学号</td>
              <td>成绩</td>
              <td>测试时间</td>
              <td>失败原因</td>
            </tr>
          </thead>
          <tbody>
            {faildRecords.map((faild, i) => {
              const r = faild.record;
              return <tr key={i}>
                <td>{TestName[r.test.type]}</td>
                <td>{r.student.name}</td>
                <td>{r.student.nu}</td>
                <td><Score data={r.test.score} type={r.test.type}/></td>
                <td>{getDateString(r.date)}</td>
                <td>{faild.message}</td>
              </tr>
            })}
          </tbody>
        </table>
      </div>
    </div>;
  }

  render() {
    const {
      selectedType,
      faildRecords,
    } = this.state;
    if (faildRecords.length) {
      return this.renderFaildPage();
    }
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
    uploadUrl: state.app.uploadUrl,
    deviceNo: state.app.deviceNo,
  });
})(SyncPage);

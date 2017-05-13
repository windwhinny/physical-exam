import React = require('react');
import {
  TestType,
  Gender,
  TestRecord,
} from '../../../../constants';
import actions from '../../../actions';
import {
  bindMethod,
} from '../../../../lib/utils';
import './index.scss';
import {
  TestState,
  TestDevice,
} from '../../../reducers/dailyReportPage';
import Score from '../../../components/Score';
import Dialog from '../../../components/Dialog';

export type Props = {
  type: TestType,
} & TestState;

type State = {
  confirmRemoveIndex: null | number,
};

export default class extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      confirmRemoveIndex: null,
    };
    bindMethod(this, ['renderDevice', 'startTest', 'endTest', 'saveTest']);
  }

  componentDidMount() {
    actions.DRPClearTest();
    actions.DRPSearchDevices(this.props.type);
  }

  confirmRemove(index: number) {
    this.setState({
      confirmRemoveIndex: index,
    });
  }

  saveTest() {
    const {
      deviceList,
      students,
      type,
    } = this.props;
    const records = deviceList.map((d, index) => {
      if (!d.score) return null;
      const student = students[index];
      if (!student) return null;
      return {
        date: new Date(),
        student,
        test: {
          score: d.score.data,
          type,
        }
      }
    }).filter(Boolean) as TestRecord[];
    actions.DRPSaveTestResult(records);
  }

  async startTest() {
    const {
      deviceList,
    } = this.props;
    await actions.DRPStartTest().promise.originPromise;
    const fn = () => {
      const { status } = this.props;
      if (status === 'idle') {
        clearInterval(timmer);
        return;
      }
      deviceList.forEach(device => {
        actions.DRPGetScore(device.deviceNo);
      });
    };

    const timmer = setInterval(fn, 1000);
  }

  async endTest() {
    // 结束测试时，再获取一次成绩
    await Promise.all(
      this.props
          .deviceList
          .map(d => {
            return actions.DRPGetScore(d.deviceNo).promise.originPromise;
          }));
    actions.DRPEndTest();
  }

  renderDevice(device: TestDevice, index: number) {
    const { status, type } = this.props;
    const student = this.props.students[index];
    const renderStatus = () => {
      const { score } = device;
      if (status === 'testing' || score) {
        return <div className="testing">
          {score && <Score data={score.data} type={type}/>}
          {status === 'testing' && <div className="status">测试中</div>}
        </div>;
      } else if (!student) {
        return <div className="status idle">请刷卡或手动添加学生信息</div>;
      } else {
        return <div className="status idle">等待测试</div>;
      }
    };

   return <li className="device" key={device.deviceNo} onClick={() => {
     if (student) this.confirmRemove(index);
    }}>
      <div>
        {student ?
        <div className="student">
          <div className="name">{student.name}</div>
          <div className="gender-and-nu">
            {student.gender === Gender.Male ? '男' : '女'}
            {' | '}
            {student.nu}
          </div>
        </div>
        :
        <div className="device-no">设备：{device.deviceNo}</div>
        }
      </div>
      <div>
        {renderStatus()}
      </div>
    </li>;
  }

  renderDeviceList() {
    const {
      deviceList,
      error
    } = this.props;
    if (!deviceList.length && error) {
      return <div className="error">{error.message}</div>;
    } else if (!deviceList.length) {
      return <div className="error">未搜索到设备，请检查设备链接或切换信道并重试</div>;
    }

    return <ul className="device-list">
      {deviceList.map(this.renderDevice)}
    </ul>
  }

  renderDialog() {
    const {error} = this.props;
    if (this.state.confirmRemoveIndex !== null) {
      return <Dialog type="confirmAndCancel" onConfirm={() => {
        actions.DRPClearTestByIndex(this.state.confirmRemoveIndex as number);
        this.setState({
          confirmRemoveIndex: null,
        });
      }} onCancel={() => {
        this.setState({
          confirmRemoveIndex: null,
        });
      }}>
        <h3>确定清除学生信息以及测试成绩？</h3>
      </Dialog>;
    } else if (error) {
      const msg = error.message || '未知错误';
      <Dialog onConfirm={() => {
        actions.DRPClearError();
      }} onCancel={() => {
        actions.DRPClearError();
      }}>
        <h3>{msg}</h3>
      </Dialog>
    }
    return null;
  }

  renderBottomAction() {
    const {
      status,
      deviceList,
      students,
    } = this.props;
    const renderButton = () => {
      if (!deviceList.length) {
        return null
      } else if (status === 'idle') {
        if (deviceList.find(d => !!d.score) && students.length) {
          return <button onClick={this.saveTest}>保存测试成绩</button>;
        } else if (students.length) {
          return <button onClick={this.startTest}>开始测试</button>
        } else {
          return <button disabled>请刷卡或手动添加学生信息</button>
        }
      } else if (status === 'testing') {
        return <button onClick={this.endTest}>结束测试</button>
      } else if (status === 'pending') {
        return <button disabled>正在执行...</button>
      }
    }
    return <div className="actions">
      {renderButton()}
    </div>;
  }

  render() {
    const {
      pending,
      students,
    } = this.props;

    if (pending && !students.length) {
      return <div className="test-page">
        <p className="searching">正在搜索设备...</p>
      </div>;
    }

    return <div className="test-page">
      {this.renderDeviceList()}
      {this.renderBottomAction()}
      {this.renderDialog()}
    </div>;
  }
}

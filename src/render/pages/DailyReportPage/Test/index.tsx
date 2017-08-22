import React = require('react');
import {
  TestType,
  Gender,
  TestRecord,
  Score,
  Student,
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
import ScoreComponent from '../../../components/Score';
import Dialog from '../../../components/Dialog';
import SignBoard from './SignBoard';
import CardReader from '../../../services/CardReader';
import play from '../../../audio';
import Timmer from './Timmer';
export type Props = {
  type: TestType,
  ip: string | null,
  mode: string,
  pinCode: string | null,
  maxRound: number,
} & TestState;

type State = {
  confirmRemoveIndex: null | number,
};

export default class extends React.Component<Props, State> {
  readingCard = false;
  constructor(props: Props) {
    super(props);
    this.state = {
      confirmRemoveIndex: null,
    };
    bindMethod(this, [
      'renderDevice',
      'prepareTest',
      'startTest',
      'endTest',
      'saveTest',
      'onTimmerUpdate',
      'prepareNextRound']);
  }

  componentWillUnmount( ) {
    if (!this.readingCard) return;
    this.readingCard = false;
    CardReader('stopRead')();
  }

  componentDidMount() {
    actions.DRPClearTest();
    actions.DRPSearchDevices(this.props.type);
  }

  componentWillReceiveProps(props: Props) {
    switch (props.status) {
      case 'idle': {
        if (
          props.round === 0
          && props.deviceList.length
          && props.students.length !== props.deviceList.length
        ) {
          play(`./audios/inputStudentNo.mp3`);
        }
        if (this.readingCard) break;
        this.readingCard = true;
        if (props.pinCode) {
          CardReader('read')(props.pinCode, student => {
            actions.DRPAddStudent(student)
          }, err => {
            console.error(err);
          });
        }
        break;
      }
      default: {
        if (!this.readingCard) break;
        this.readingCard = false;
        CardReader('stopRead')();
        break;
      }
    }
  }

  confirmRemove(index: number) {
    this.setState({
      confirmRemoveIndex: index,
    });
  }

  genRecords() {
    const {
      deviceList,
      students,
      type,
      ip,
    } = this.props;
    let signs: {[k: string]: string} | null = null;
    if (this.refs.signBoard) {
      const signBoard = this.refs.signBoard as SignBoard;
      signs = signBoard.getSigns();
    }
    const records = deviceList.map((d, index) => {
      if (!d.score) return null;
      if (d.score.data === 'error') return null;
      const student = students[index];
      if (!student) return null;
      return {
        date: new Date(),
        student,
        test: {
          score: d.score.data,
          type,
        },
        user: { ip },
        sign: signs ? signs[student.nu] : '',
      }
    }).filter(Boolean) as TestRecord[];
    return records;
  }

  saveTest() {
    actions.DRPSaveTestResult(this.genRecords());
  }

  async prepareNextRound() {
    const { deviceList } = this.props;
    const temp = deviceList.map(d => {
      if (!d.score) return null;
      return {
        deviceNo: d.deviceNo,
        score: d.score,
      };
    }).filter(Boolean) as {
      deviceNo: string,
      score: Score,
    }[];
    actions.DRPSaveTempScore(temp);
    this.prepareTest();
  }

  onTimmerUpdate(d: Date) {
    const { status, type } = this.props;
    if (status !== 'testing') return;
    if (![TestType.RopeSkipping, TestType.Situps].includes(type)) return;
    const seconds = d.getMinutes() * 60 + d.getSeconds() + (d.getMilliseconds() / 1000);
    const left = 60 - seconds;
    if (left < 11 && left > 0) {
      play(`./audios/${Math.floor(left)}.mp3`);
    } else if (left <= 0) {
      this.endTest();
    }
  }

  prepareTest() {
    actions.DRPPrepareTest();
    play('./audios/prepare.mp3');
  }

  async startTest() {
    const {
      deviceList,
      type,
      round,
      maxRound,
    } = this.props;
    debugger;
    if (maxRound > 1) {
      if (round < 4 ) {
        await play(`./audios/round${round + 1}Test.mp3`);
      } else {
        await play('./audios/begin.mp3');
      }
    } else if ([
      TestType.Running1000,
      TestType.Running800,
      TestType.Running50,
      TestType.RunningBackAndForth,
    ].includes(this.props.type)) {
      await play('./audios/prepare_run.mp3');
    } else if ([
      TestType.Situps,
      TestType.PullUp
    ].includes(this.props.type)) {
      await play('./audios/prepareTest.mp3');
      play('./audios/du.mp3');
    } else if (TestType.RopeSkipping === this.props.type) {
      await play('./audios/inPosition.mp3');
      await play('./audios/prepareTest.mp3');
      play('./audios/du.mp3');
    } else {
      await play('./audios/begin.mp3');
    }
    await actions.DRPStartTest().promise.originPromise;
    const fn = () => {
      const { status } = this.props;
      if (status === 'idle') {
        clearInterval(timmer);
        return;
      }
      deviceList.forEach(device => {
        actions.DRPGetScore(type, device.deviceNo);
      });
    };

    const timmer = setInterval(fn, 1000);
  }

  async endTest() {
    const { type, round, maxRound } = this.props;
    // 结束测试时，再获取一次成绩
    await Promise.all(
      this.props
          .deviceList
          .map(d => {
            return actions.DRPGetScore(type, d.deviceNo).promise.originPromise;
          }));
    requestAnimationFrame(() => {
      actions.DRPEndTest(type, maxRound);
      if (round === maxRound) {
        play('./audios/endTest.mp3').then(() => {
          play('./audios/saveRecord.mp3');
        });
      }
    });
  }

  renderDevice(device: TestDevice, index: number) {
    const { status, type } = this.props;
    const student = this.props.students[index];
    const renderStatus = () => {
      const { score } = device;
      if (status === 'testing' || score) {
        return <div className="testing">
          {score && <ScoreComponent data={score.data} type={type} final={score.final}/>}
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
      type,
      round,
      mode,
      maxRound,
    } = this.props;
    const renderButton = () => {
      if (!deviceList.length) {
        return null
      } else if (status === 'idle') {
        if (round > 0 && round < maxRound) {
          return <button onClick={this.prepareNextRound}>准备第 {round + 1} 轮测试</button>;
        } else if (deviceList.find(d => !!d.score) && students.length) {
          // return <button onClick={this.saveTest}>保存测试成绩</button>;
          if (mode === 'normal') {
            return <button onClick={this.saveTest}>保存测试成绩</button>;
          } else {
            return [
              <SignBoard students={students.filter(Boolean) as Student[]} ref="signBoard" key={1}/>,
              <button onClick={this.saveTest} key={2}>保存测试成绩</button>
            ];
          }
        } else if (students.length) {
          return <button onClick={this.prepareTest}>准备测试</button>;
        } else {
          return <button disabled>请刷卡或手动添加学生信息</button>;
        }
      } else if (status === 'prepare') {
        return <button onClick={this.startTest}>开始测试</button>;
      } else if (status === 'testing') {
        const timmer = [
          TestType.Situps,
          TestType.RopeSkipping,
          TestType.Running1000,
          TestType.Running800,
          TestType.Running50,
        ].includes(type) ? <Timmer onUpdate={this.onTimmerUpdate}/> : null;
        return <button onClick={this.endTest}>结束测试 {timmer}</button>;
      } else if (status === 'pending') {
      return <button disabled>正在执行...</button>;
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

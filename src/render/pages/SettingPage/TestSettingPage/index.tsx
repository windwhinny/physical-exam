import React = require('react');
import { connect } from 'react-redux';
import NavigationBar, { Title } from '../../../components/NavigationBar';
import { State as RootState } from '../../../reducers';
import { RouteComponentProps } from 'react-router';
import cx = require('classnames');
import {
  bindMethod,
} from '../../../../lib/utils';
import './index.scss'
import {
  TestName,
  TestType,
  testSettings,
} from '../../../../constants';
import Counter from '../../../components/Counter';
import TimeCounter from '../../../components/TimeCounter';
type Props = RouteComponentProps<{}> & {
  pinCode: string | null,
  round: number,
}

const str = localStorage.getItem('test-settings');
if (str) {
  try {
    Object.assign(testSettings, JSON.parse(str));
  } catch (e) {
    saveValuesToStorage();
  }
} else {
  // 设置默认值
  saveValuesToStorage();
}

function saveValuesToStorage() {
  localStorage.setItem('test-settings', JSON.stringify(testSettings));
}

type State = {
  tabIndex: number,
  round: number,
  values: Map<TestType, number>,
}

class TestSettingPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      tabIndex: 1,
      round: props.round,
      values: new Map(),
    };
    bindMethod(this, ['onSubmit', 'onCancel']);

    Object.keys(testSettings).forEach((k) => {
      this.state.values.set(Number(k), testSettings[Number(k) as TestType]);
    });
  }

  onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { values } = this.state;

    for (const [k, v] of values.entries()) {
      testSettings[k] = v;
    }
    saveValuesToStorage();
    this.onCancel();
  }

  onCancel() {
    this.props.history.goBack();
  }

  activeTab(index: number) {
    this.setState({
      tabIndex: index,
    })
  }

  getValue(type: TestType): number {
    const { values } = this.state;
    return values.get(type) || 0;
  }

  onChange(type: TestType, value: number) {
    const { values } = this.state;
    values.set(type, value);
    this.forceUpdate();
  }

  renderCounter(type: TestType) {
    const value = this.getValue(type);
    if ([
      TestType.Situps,
      TestType.RopeSkipping,
    ].includes(type)) {
      return <TimeCounter value={value} onChange={(v) => this.onChange(type, v)}/>
    } else if ([
      TestType.Running1000,
      TestType.Running800,
    ].includes(type)) {
      return <Counter value={value} min={1} max={99} unit="圈" onChange={(v) => this.onChange(type, v)}/>
    } else if ([
      TestType.StandingLongJump,
      TestType.VitalCapacity,
      TestType.SitAndReach,
    ].includes(type)) {
      return <Counter value={value} min={1} max={99} unit="次" onChange={(v) => this.onChange(type, v)}/>
    }
  }

  renderController(type: TestType ) {
    return <div className="controller row" key={type}>
      <span className="test-name">{TestName[type]}</span>
      {this.renderCounter(type)}
    </div>;
  }

  renderControllers() {
    const {tabIndex} = this.state;
    switch (tabIndex) {
    case 1:
      return [
        TestType.Running1000,
        TestType.Running800,
      ].map(t => this.renderController(t));
    case 2:
      return [
        TestType.Situps,
        TestType.RopeSkipping,
      ].map(t => this.renderController(t));
    case 3:
      return [
        TestType.StandingLongJump,
        TestType.VitalCapacity,
        TestType.SitAndReach,
      ].map(t => this.renderController(t));
    }
  }

  render() {
    const { tabIndex } = this.state;
    return <div className="test-setting-page">
      <NavigationBar onBack={this.onCancel}>
        <Title>测试设置</Title>
      </NavigationBar>
      <form onSubmit={this.onSubmit}>
        <fieldset>
          <ul className="tabs">
            <li className={cx(tabIndex === 1 && 'active')} onClick={() => this.activeTab(1)}>圈数</li>
            <li className={cx(tabIndex === 2 && 'active')} onClick={() => this.activeTab(2)}>时间</li>
            <li className={cx(tabIndex === 3 && 'active')} onClick={() => this.activeTab(3)}>次数</li>
          </ul>
          <div className="controllers">
            {this.renderControllers()}
          </div>
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
})(TestSettingPage);

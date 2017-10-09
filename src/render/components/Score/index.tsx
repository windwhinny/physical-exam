import React = require('react');
import './index.scss';
import {
  TestType,
  TestUnitTemp,
} from '../../../constants'
import play from '../../audio';
import cx = require('classnames');

type Props = {
  data: string,
  type: TestType,
  final?: boolean,
}

export default class Score extends React.Component<Props, void> {
  componentWillReceiveProps(newProps: Props) {
    if (
         newProps.final === true
      && this.props.final === false
      && [
        TestType.Running1000,
        TestType.Running800,
        TestType.Running50,
        TestType.RunningBackAndForth,
      ].includes(newProps.type)
    ) {
      play('./audios/di.mp3');
    }
  }

  get isError() {
    const { data } = this.props;
    if (data === 'error') return true;
    return false;
  }

  getScoreDesc(): string {
    const { data, type, final } = this.props;
    if (this.isError) return '犯规';
    let temp = TestUnitTemp[type];
    if (!temp) return data;
    if (final === false) {
      if (type === TestType.Running50) {
        return '测试中';
      }
      if ([
        TestType.Running1000,
        TestType.Running800,
        TestType.RunningBackAndForth,
      ].includes(type)) {
        temp = '$0 圈';
      }
    }
    return data.split(',').reduce((str, v, i) => {
      return str.replace('$' + i, v);
    }, temp);
  }

  render() {
    return <div className="score-component">
      <div className={cx('value', this.isError && 'error')}>{this.getScoreDesc()}</div>
    </div>;
  }
}

import React = require('react');
import './index.scss';
import {
  TestType,
  TestUnitTemp,
} from '../../../constants'

type Props = {
  data: string,
  type: TestType,
}

export default class Score extends React.Component<Props, void> {
  getScoreDesc(): string {
    const { data, type } = this.props;
    const temp = TestUnitTemp[type];
    if (!temp) return data;
    return data.split(',').reduce((str, v, i) => {
      return str.replace('$' + i, v);
    }, temp);
  }

  render() {
    return <div className="score-component">
      <div className="value">{this.getScoreDesc()}</div>
    </div>;
  }
}

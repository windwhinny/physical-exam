import React = require('react');
import {
  TestRecord,
  TestUnitTemp,
} from '../../../constants';

type Props = {
  record: TestRecord,
}

export default class TestResultItem extends React.Component<Props, void> {
  getScoreDesc(record: TestRecord): string {
    const score = record.test.score;
    const temp = TestUnitTemp[record.test.type];
    if (!temp) return score;
    return score.split(',').reduce((str, v, i) => {
      return str.replace('$' + i, v);
    }, temp);
  }

  render() {
    const { record } = this.props;
    return <div className="test-result-item">
      <div className="student">
        <div className="name">{record.student.name}</div>
        <div className="code">{record.student.nu}</div>
      </div>
      <div className="result">
        <div className="score">{this.getScoreDesc(record)}</div>
      </div>
    </div>;
  }
}

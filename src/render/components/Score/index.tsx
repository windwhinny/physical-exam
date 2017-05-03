import React = require('react');

import {
  TestRecord,
  TestUnitTemp,
} from '../../../constants'

type Props = {
  record: TestRecord,
}

export default class Score extends React.Component<Props, void> {
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
    return <div className="score">
      <div className="value">{this.getScoreDesc(record)}</div>
    </div>;
  }
}

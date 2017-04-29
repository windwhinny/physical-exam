import React = require('react');
import {
  TestRecord
} from '../../../constants';

type Props = {
  record: TestRecord,
}

export default class TestResultItem extends React.Component<Props, void> {
  render() {
    const { record } = this.props;
    return <div className="test-result-item">
      <div className="student">
        <div className="name">{record.student.name}</div>
        <div className="code">{record.student.code}</div>
      </div>
      <div className="result">
        <div className="value">{record.test.value}</div>
      </div>
    </div>;
  }
}

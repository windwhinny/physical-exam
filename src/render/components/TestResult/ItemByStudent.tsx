import React = require('react');
import Score from '../Score';
import {
  TestRecord,
} from '../../../constants';

type Props = {
  record: TestRecord,
}

export default class TestResultItemByStudent extends React.PureComponent<Props, void> {
  render() {
    const { record } = this.props;
    return <div className="test-result-item">
      <Score data={record.test.score} type={record.test.type}/>
      <div className="date">
        {new Date(record.date).toLocaleDateString()}
      </div>
    </div>;
  }
}

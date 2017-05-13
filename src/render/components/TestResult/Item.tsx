import React = require('react');
import Score from '../Score';
import {
  TestRecord,
} from '../../../constants';

type Props = {
  record: TestRecord,
}

export default class TestResultItem extends React.PureComponent<Props, void> {
  render() {
    const { record } = this.props;
    return <div className="test-result-item" key={record.id}>
      <div className="student">
        <div className="name">{record.student.name}</div>
        <div className="code">{record.student.nu}</div>
      </div>
      <Score record={record}/>
    </div>;
  }
}

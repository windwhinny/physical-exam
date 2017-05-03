import React = require('react');
import {
  TestRecord,
  TestType,
} from '../../../constants';
import TestResultItem from './Item';
import TestResultItemByStudent from './ItemByStudent';
import {
  bindMethod,
} from '../../../lib/utils';
require('./index.scss');

type Props = {
  mode?: 'student',
  records: TestRecord[],
  type: TestType,
  onScrollToBottom?: () => void,
}

export default class TestRsult extends React.PureComponent<Props, void> {
  constructor(props: Props) {
    super(props);

    bindMethod(this, ['onScroll'])
  }

  onScroll() {
    const container = this.refs.container as HTMLDivElement;
    const height = container.scrollHeight;
    const top = container.scrollTop;
    const clientHeight = container.clientHeight;
    if (height - clientHeight - top < 100) {
      const { onScrollToBottom } = this.props;
      if (onScrollToBottom) {
        onScrollToBottom();
      }
    }
  }

  render() {
    const { records, mode } = this.props;
    return <div className="test-result" onScroll={this.onScroll} ref="container">
      {records.length ?
        records.map(r => {
          if (mode === 'student') {
            return <TestResultItemByStudent key={r.id} record={r}/>
          } else {
            return <TestResultItem key={r.id} record={r}/>
          }
        }) :
        <div className="empty">暂无相关测试数据</div>
      }
    </div>;
  }
}

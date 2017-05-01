import React = require('react');
import {
  TestRecord,
  TestType,
  Pagination,
} from '../../../constants';
import TestResultItem from './Item';
import {
  bindMethod,
} from '../../../lib/utils';
import actions from '../../actions';
require('./index.scss');

type Props = {
  date: Date,
  records: TestRecord[],
  type: TestType,
  pagination: Pagination,
}

export default class TestRsult extends React.PureComponent<Props, void> {
  constructor(props: Props) {
    super(props);

    bindMethod(this, ['onScroll'])
  }

  componentWillReceiveProps(newProps: Props) {
    if (newProps.date.getTime() !== this.props.date.getTime()) {
      actions.DRPClear();
      this.fetch(newProps.date);
    }
  }

  componentDidMount() {
    this.fetch(this.props.date);
  }

  fetch(date: Date) {
    const { type, pagination } = this.props;
    actions.DRPloadRecords(date, type, pagination)
  }

  onScroll() {
    const container = this.refs.container as HTMLDivElement;
    const height = container.scrollHeight;
    const top = container.scrollTop;
    const clientHeight = container.clientHeight;
    if (height - clientHeight - top < 100) {
      this.fetch(this.props.date);
    }
  }

  render() {
    const { records } = this.props;
    return <div className="test-result" onScroll={this.onScroll} ref="container">
      {records.length ?
        records.map(r => <TestResultItem key={r.id} record={r}/>) :
        <div className="empty">暂无相关测试数据</div>
      }
    </div>;
  }
}

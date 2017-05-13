import React = require('react');
import TestResult from '../../../components/TestResult';
import {
  TestRecord,
  Pagination,
  TestType,
} from '../../../../constants';
import actions from '../../../actions';
import {
  bindMethod,
} from '../../../../lib/utils';
type Props = {
  type: TestType,
  records: TestRecord[],
  pending: boolean,
  pagination: Pagination,
  date: Date,
}

export default class extends React.Component<Props, void> {
  constructor(props: Props) {
    super(props);
    bindMethod(this, [
      'onScrollToBottom',
      ]);
  }

  componentWillReceiveProps(newProps: Props) {
    if (newProps.date.getTime() !== this.props.date.getTime()) {
      actions.DRPClear();
      const { pagination } = this.props;
      this.fetch(newProps.date, Object.assign({}, pagination, {
        page: 1,
      }));
    }
  }

  componentDidMount() {
    this.fetch(this.props.date, Object.assign({}, this.props.pagination, {
      page: 1,
    }));
  }

  nextPage() {
    return Object.assign({}, this.props.pagination, {
      page: this.props.pagination.page + 1,
    });
  }

  fetch(date: Date, pagination: Pagination) {
    const { type } = this.props;
    actions.DRPloadRecords(date, type, pagination)
  }

  onScrollToBottom() {
    if (this.props.pending) return;
    if (this.props.pagination.done) return;
    this.fetch(this.props.date, this.nextPage());
  }
  render() {
    const { type, records } = this.props;
    return <TestResult type={type} records={records} onScrollToBottom={this.onScrollToBottom}/>;
  }
}

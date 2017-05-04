import React = require('react');
import { connect } from 'react-redux';
import { State as RootState } from '../../store';
import NavigationBar, { Title } from '../../components/NavigationBar';
import { RouteComponentProps } from 'react-router';
import TestResult from '../../components/TestResult';
import url = require('url');
import actions from '../../actions';
import TestCategoryTab from '../../components/TestCategory/Tab';
import {
  bindMethod,
} from '../../../lib/utils';
import {
  TestRecord,
  TestType,
  Pagination,
} from '../../../constants';
require('./index.scss');
type Props = RouteComponentProps<{}>& {
  records: TestRecord[],
  pending: boolean,
  error: Error | null,
  type: TestType,
  pagination: Pagination,
}

class StudentPage extends React.Component<Props, void> {
  constructor(props: Props) {
    super(props);
    bindMethod(this, ['onScrollToBottom', 'onSelectType']);
  }

  componentDidMount() {
    this.fetch(this.props.type, Object.assign({}, this.props.pagination, {
      page: 1,
      done: false,
    }));
  }

  fetch(type: TestType, pagination: Pagination) {
    const { pending } = this.props;
    if (pending) return;
    actions.getStudentRecords(
      this.getStudent().no,
      type,
      pagination,
    )
  }

  onScrollToBottom() {
    if (this.props.pagination.done) return;
    if (this.props.pending) return;
    this.fetch(this.props.type, Object.assign({}, this.props.pagination, {
      page: this.props.pagination.page + 1,
    }));
  }

  getStudent(): {name: string, no: string} {
    const { location } = this.props;
    const path = url.parse(location.search, true);
    return path.query;
  }

  onSelectType(type: TestType) {
    actions.studentPageSwitchItem(type)
    this.fetch(type, {
      page: 1,
      limit: 10,
      done: false,
    });
  }

  render() {
    const { records, type } = this.props;
    return <div className="student-page">
      <NavigationBar mode="fusion" onBack={() => this.props.history.goBack()}>
        <Title>
          <h3>{this.getStudent().name}</h3>
        </Title>
      </NavigationBar>
      <TestCategoryTab onSelect={this.onSelectType} active={type}></TestCategoryTab>
      <TestResult mode="student" records={records} type={type} onScrollToBottom={this.onScrollToBottom}/>
    </div>;
  }
}

export default connect((state: RootState) => {
  const page = state.studentPage;
  return page;
})(StudentPage);

import React = require('react');
import {
  TestRecord,
} from '../../../constants';
import TestResultItem from './Item';
import {
  bindMethod,
} from '../../../lib/utils';
type Props = {
  date: Date
}

type State = {
  records: TestRecord[],
  fetching: boolean,
  pagination: {
    page: number,
    isEnd: boolean,
  },
}

export default class TestRsult extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      records: [],
      fetching: false,
      pagination: {
        page: 0,
        isEnd: false,
      }
    }

    bindMethod(this, ['onScroll'])
  }

  componentDidMount() {
    this.fetch();
  }

  fetch() {
    if (this.state.fetching) return;

    this.setState({
      fetching: true,
    });
  }

  onScroll() {
    const container = this.refs.container as HTMLDivElement;
    const height = container.scrollHeight;
    const top = container.scrollTop;
    const clientHeight = container.clientHeight;
    if (height - clientHeight - top < 100) {
      this.fetch();
    }
  }

  render() {
    const { records } = this.state;
    return <div className="test-result" onScroll={this.onScroll} ref="container">
      {records.map(r => <TestResultItem key={r.id} record={r}/>)}
    </div>;
  }
}

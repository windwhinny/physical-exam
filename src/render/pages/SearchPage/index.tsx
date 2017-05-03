import React = require('react');
import NavigationBar, { Title, Action } from '../../components/NavigationBar';
import actions from '../../actions';
import { State as RootState } from '../../store';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { RouteComponentProps } from 'react-router';
import {
  bindMethod,
  throttle,
} from '../../../lib/utils';
require('./index.scss');

type Props =  RouteComponentProps<{}> & {
  students: {name: string, no: string}[],
  pending: boolean,
  error: Error | null,
  keyword: string,
}

class SearchPage extends React.Component<Props, void> {
  searchAction: (k: string) => void;
  constructor(props: Props) {
    super(props);
    this.searchAction = throttle(actions.searchStudent, 300);
    bindMethod(this, ['search', 'onCancel']);
  }

  onCancel() {
    this.props.history.goBack();
  }

  componentDidMount() {
    const input = this.refs.input as HTMLInputElement;
    if (!input) return;
    input.focus();
  }

  search(e: React.ChangeEvent<HTMLInputElement>) {
    const keyword = e.target.value;
    actions.setSearchKeyword(keyword);
    if (keyword) {
      this.searchAction(keyword);
    } else {
      actions.clearSearchResult();
    }
  }

  render() {
    const { students, keyword, pending, error} = this.props;
    return <div className="search-page">
      <header>
        <NavigationBar mode="fusion">
          <Title>
            <input placeholder="姓名/学号" onChange={this.search} ref="input" value={keyword}/>
          </Title>
          <Action>
            <div className="cancel" onClick={this.onCancel}>取消</div>
          </Action>
        </NavigationBar>
      </header>
      { keyword && !pending && !students.length && !error ?
      <div className="empty">没有相关搜索结果</div>
        :
      <ul>
        {students.map(s => {
          return <li key={s.no}>
            <div className="student">
              <div className="name">{s.name}</div>
              <div className="no">{s.no}</div>
            </div>
            <Link to={`/student?no=${s.no}&name=${s.name}`}>查看全部测试结果</Link>
          </li>;
        })}
      </ul>
      }
    </div>;
  }

}

export default connect((state: RootState) => {
  const page = state.searchPage;
  return page;
})(SearchPage);

import React = require('react');
import NavigationBar, { Title, Action } from '../../components/NavigationBar';
import SearchIcon from '../../components/SearchIcon';
import actions from '../../actions';
import { State as RootState } from '../../store';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { RouteComponentProps } from 'react-router';
import {
  bindMethod,
  throttle,
} from '../../../lib/utils';
import CardReader from '../../services/CardReader';
require('./index.scss');

type Props =  RouteComponentProps<{}> & {
  students: {name: string, no: string}[],
  pending: boolean,
  error: Error | null,
  keyword: string,
  pinCode: string | null,
}

class SearchPage extends React.Component<Props, void> {
  searchAction: (k: string) => void;
  constructor(props: Props) {
    super(props);
    bindMethod(this, ['search', 'onCancel', 'onSearch']);
    this.doSearch = throttle(this.doSearch, 300);
  }

  onCancel() {
    this.props.history.goBack();
  }

  componentDidMount() {
    const { pinCode, keyword } = this.props;
    const input = this.refs.input as HTMLInputElement;
    if (!input) return;
    input.focus();
    if (pinCode) {
      CardReader('read')(pinCode, student => {
        student.nu
        if (keyword === student.nu) return;
        this.search(student.nu);
      }, err => {
        console.error(err);
      });
    }
  }

  componentWillUnmount() {
    CardReader('stopRead')();
  }

  doSearch(keyword: string) {
    if (keyword) {
      actions.searchStudent(keyword);
    } else {
      actions.clearSearchResult();
    }
  }

  search(keyword: string) {
    actions.setSearchKeyword(keyword);
    this.doSearch(keyword);
  }

  onSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const keyword = e.target.value;
    this.search(keyword);
  }

  render() {
    const { students, keyword, pending, error} = this.props;
    return <div className="search-page">
      <header>
        <NavigationBar mode="fusion">
          <Title>
            <SearchIcon />
            <input placeholder="姓名/学号" onChange={this.onSearch} ref="input" value={keyword}/>
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
            <Link to={`/student?no=${s.no}&name=${s.name}`}>
              <div className="student">
                <div className="name">{s.name}</div>
                <div className="no">{s.no}</div>
              </div>
            <span>查看全部测试结果</span>
           </Link>
          </li>;
        })}
      </ul>
      }
    </div>;
  }

}

export default connect((state: RootState) => {
  const page = state.searchPage;
  return Object.assign({}, page, {
    pinCode: state.app.pinCode,
  });
})(SearchPage);

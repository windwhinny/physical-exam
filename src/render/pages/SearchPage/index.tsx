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
const Icon  = () =>
<svg  x="0px" y="0px" viewBox="0 0 450 327.54">
  <circle fill="#4b9eff" cx="225" cy="163.77" r="25"/>
  <path fill="#4b9eff" d="M50,163.77c0-50.12,21.19-95.38,55.07-127.32L70.73,0c-1.63,1.53-3.24,3.08-4.83,4.67 C23.4,47.17,0,103.67,0,163.77s23.4,116.6,65.9,159.1c1.59,1.59,3.2,3.14,4.83,4.67l34.34-36.45C71.19,259.15,50,213.89,50,163.77z "/>
  <path fill="#4b9eff" d="M384.1,4.67c-1.59-1.59-3.2-3.14-4.82-4.67l-34.34,36.45C378.81,68.39,400,113.65,400,163.77 s-21.19,95.38-55.07,127.32l34.34,36.45c1.63-1.53,3.24-3.08,4.83-4.67c42.5-42.5,65.9-99,65.9-159.1S426.6,47.17,384.1,4.67z"/>
  <path fill="#4b9eff" d="M150,163.77c0-21.48,9.09-40.87,23.61-54.55l-34.28-36.39C115.13,95.64,100,127.97,100,163.77 c0,35.8,15.13,68.13,39.33,90.94l34.28-36.39C159.09,204.64,150,185.25,150,163.77z"/>
  <path fill="#4b9eff" d="M310.67,72.83l-34.28,36.39C290.91,122.9,300,142.29,300,163.77c0,21.48-9.09,40.87-23.61,54.55l34.28,36.39 c24.2-22.81,39.33-55.14,39.33-90.94C350,127.97,334.87,95.64,310.67,72.83z"/>
</svg>

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

  renderResult() {
    const { students, keyword, pending, error} = this.props;
    if (keyword && !pending && !students.length && !error) {
      return <div className="tip">没有相关搜索结果</div>
    }

    if (error) {
      return <div className="tip">查询失败: {error.message}</div>
    }

    if (students.length) {
      return <ul>
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

    return <div className="tip">
      <Icon/>
      <span>提示：可直接刷学生卡查询成绩</span>
    </div>
  }

  render() {
    const { keyword } = this.props;
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
      {this.renderResult()}
    </div>;
  }

}

export default connect((state: RootState) => {
  const page = state.searchPage;
  return Object.assign({}, page, {
    pinCode: state.app.pinCode,
  });
})(SearchPage);

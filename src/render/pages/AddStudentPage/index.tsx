import React = require('react');
import cx = require('classnames');
import {
  bindMethod,
} from '../../../lib/utils';
import NavigationBar, { Title } from '../../components/NavigationBar';
import { RouteComponentProps } from 'react-router';
import actions from '../../actions';
import {
  Gender,
} from '../../../constants';

require('./index.scss');
type Props = RouteComponentProps<{
  item: number,
}>;

type State = {
  name: string,
  nu: string,
  gender: Gender,
}

export default class AddStudentPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      name: '',
      nu: '',
      gender: Gender.Male,
    };
    bindMethod(this, ['onSubmit', 'onNameChange', 'onNoChange'])
  }

  onNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      name: e.target.value,
    });
  }

  onNoChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      nu: e.target.value,
    });
  }

  onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    actions.DRPAddStudent({
      name: this.state.name,
      nu: this.state.nu,
      gender: this.state.gender,
    });
    this.props.history.goBack();
  }

  changeGender(gender: Gender) {
    this.setState({
      gender,
    });
  }

  isDisabled(): boolean {
    const { name, nu } = this.state;
    if (!name || !nu) return true;
    if (name.length < 2) return true;
    if (nu.length !== 19) return true;
    if (!nu.match(/^\d+$/)) return true;
    return false;
  }

  render() {
    const { name, nu, gender } = this.state;
    return <div className="add-student-page">
      <NavigationBar onBack={() => this.props.history.goBack()}>
        <Title>添加学生信息</Title>
      </NavigationBar>
      <form onSubmit={this.onSubmit}>
        <fieldset>
        <input type="name" placeholder="学生姓名" required value={name} onChange={this.onNameChange}/>
        <input type="nu" placeholder="学籍号（19位）" minLength={19} required value={nu} onChange={this.onNoChange}/>
          <div className="gender">
            <div className={cx('male', gender === Gender.Male && 'active')}
              onClick={() => this.changeGender(Gender.Male)}>
              男
            </div>
            <div className={cx('female', gender === Gender.Female && 'active')}
              onClick={() => this.changeGender(Gender.Female)}>
              女
            </div>
          </div>
        </fieldset>
        <button type="submit" disabled={this.isDisabled()}>确认添加</button>
      </form>
    </div>;
  }
}

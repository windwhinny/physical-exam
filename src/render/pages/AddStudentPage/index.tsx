import React = require('react');
import {
  bindMethod,
} from '../../../lib/utils';
import NavigationBar, { Title } from '../../components/NavigationBar';
require('./index.scss');
type Props = {

}

type State = {
  name: string,
  no: string,
}

export default class AddStudentPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      name: '',
      no: '',
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
      no: e.target.value,
    });
  }

  onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  isDisabled(): boolean {
    const { name, no } = this.state;
    if (!name || !no) return true;
    if (name.length < 2) return true;
    if (no.length !== 19) return true;
    if (!no.match(/^\d+$/)) return true;
    return false;
  }

  render() {
    const { name, no } = this.state;
    return <div className="add-student-page">
      <NavigationBar>
        <Title>添加学生信息</Title>
      </NavigationBar>
      <form onSubmit={this.onSubmit}>
        <fieldset>
        <input type="name" placeholder="学生姓名" required value={name} onChange={this.onNameChange}/>
        <input type="no" placeholder="学籍号（19位）" minLength={19} required value={no} onChange={this.onNoChange}/>
        </fieldset>
        <button type="submit" disabled={this.isDisabled()}>确认添加</button>
      </form>
    </div>;
  }
}

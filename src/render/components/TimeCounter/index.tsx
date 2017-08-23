import React = require('react');
import Counter from '../Counter';
import {
  bindMethod,
} from '../../../lib/utils';
import './index.scss';
type Props = {
  value: number,
  onChange: (value: number) => void;
}

export default class TimeCounter extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);
    this.state = {}

    bindMethod(this, ['onMinChange', 'onSecChange']);
  }

  formatter(value: number) {
    return String(100 + value).slice(1);
  }

  onMinChange(newValue: number) {
    const { value, onChange } = this.props;
    const sec = value % 60;
    onChange(newValue * 60 + sec);
  }

  onSecChange(newValue: number) {
    const { value, onChange } = this.props;
    const min = Math.floor(value / 60);
    onChange(min * 60 + newValue);
  }

  render() {
    const { value } = this.props;
    const min = Math.floor(value / 60);
    const sec = value % 60;

    return <div className="time-counter">
      <Counter formater={this.formatter} onChange={this.onMinChange} value={min} unit="分"/>
      <Counter formater={this.formatter} onChange={this.onSecChange} value={sec} unit="秒"/>
    </div>
  }
}

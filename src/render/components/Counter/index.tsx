import React = require('react');
import cx = require('classnames');
import {
  bindMethod,
} from '../../../lib/utils';
import {
  isNumber,
} from '../../../lib/types';
import './index.scss';
type Props = {
  step?: number,
  max?: number,
  min?: number,
  value: number,
  unit?: string,
  formater?: (value: number) => number | string,
  onChange: (value: number) => void,
}

export default class Counter extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);
    bindMethod(this, ['onMinues', 'onPlus']);
  }

  onMinues() {
    const { onChange, min } = this.props;
    let {step, value} = this.props;
    step = step || 1;
    value -= step;

    if (isNumber(min) && value < min) return;
    onChange(value);
  }

  onPlus() {
    const { onChange, max } = this.props;
    let {step, value} = this.props;
    step = step || 1;
    value += step;

    if (isNumber(max) && value > max) return;
    onChange(value);
  }

  render() {
    const { value, formater, min, max, unit } = this.props;
    return <div className="counter">
      <span className={cx('minues', isNumber(min) && value <= min && 'disabled')} onClick={this.onMinues}></span>
      <span className="value">{formater ? formater(value) : value}{unit}</span>
      <span className={cx('plus', isNumber(max) && value >= max && 'disabled')} onClick={this.onPlus}></span>
    </div>;
  }
}

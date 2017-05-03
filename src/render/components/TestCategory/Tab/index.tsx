import React = require('react');
import {
  TestName,
  TestType,
} from '../../../../constants';
import cx = require('classnames');
require('./index.scss');
type Props = {
  onSelect: (t: TestType) => void;
  active: TestType,
}
export default class TestCategory extends React.Component<Props, {}> {
  render() {
    const { active } = this.props;
    return <div className="test-category-tab">
      {Object.keys(TestName).map((k) => {
        const name = TestName[Number(k)];
        return <span
          className={cx('name', active === Number(k) && 'active')}
          key={k}
          onClick={() => {
            this.props.onSelect(Number(k) as TestType);
          }}>{name}</span>
      })}
    </div>;
  }
}

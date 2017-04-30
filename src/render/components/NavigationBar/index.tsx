import React = require('react');
import cx = require('classnames');
import {
  isTypeofComponent,
} from '../../utils';
require('./index.scss');
export const Title = (props: React.Props<void>) => <div className="title">{props.children}</div>;
export const Action = (props: React.Props<void>) => <div className="action">{props.children}</div>;

type Props = {
  onBack?: () => void,
  mode?: 'fusion'
}

export default class NavigationBar extends React.PureComponent<Props, void> {
  render() {
    let { children, mode } = this.props;
    if (Array.isArray(children)) {
      children = children.filter(child => {
        return isTypeofComponent(child, Title) || isTypeofComponent(child, Action);
      });
    } else if (
      !isTypeofComponent(children, Title) &&
      !isTypeofComponent(children, Action)
    ) {
     children = null;
    }

    return <div className={cx('navigation-bar', mode)}>
      <div className="arrow" onClick={this.props.onBack}>{'<'}</div>
      {children}
    </div>;
  }
}

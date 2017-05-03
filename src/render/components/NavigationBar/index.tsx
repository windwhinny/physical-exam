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
    let haveAction = false;
    if (Array.isArray(children)) {
      children = children.filter(child => {
        const isAction = isTypeofComponent(child, Action);
        if (isAction) haveAction = true;
        return isTypeofComponent(child, Title) || isAction;
      });
    } else if (
      !isTypeofComponent(children, Title) &&
      !isTypeofComponent(children, Action)
    ) {
     children = null;
    } else if (isTypeofComponent(children, Action)) {
      haveAction = true;
    }

    return <div className={cx('navigation-bar', mode)}>
      <div className="arrow" onClick={this.props.onBack}><span className="arrow-inner"></span></div>
      {children}
      {haveAction ? null : <Action></Action>}
    </div>;
  }
}

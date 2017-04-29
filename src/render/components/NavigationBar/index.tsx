import React = require('react');
import {
  isTypeofComponent,
} from '../../utils';

export const Title = (props: React.Props<void>) => <div className="title">{props.children}</div>;
export const Action = (props: React.Props<void>) => <div className="action">{props.children}</div>;

type Props = {
  onBack?: () => void,
}

export default class NavigationBar extends React.PureComponent<Props, void> {
  render() {
    let { children } = this.props;
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

    return <div className="navagation-bar">
      <div className="arrow" onClick={this.props.onBack}>{'<'}</div>
      {children}
    </div>;
  }
}

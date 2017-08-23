import React = require('react');
import './index.scss';

type Props = {
  onClick?: () => void,
}

export default (props: Props) => <div className="arrow" onClick={props.onClick}><span className="arrow-inner"></span></div>

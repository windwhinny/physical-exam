import React = require('react');
require('./index.scss');
type Props = {
  title?: string,
  onCancel: () => void,
  onConfirm: () => void,
  confirmText?: string,
}

export default class Dialog extends React.Component<Props, void> {
  render() {
    const {
      children,
      title,
      confirmText,
      onConfirm,
      onCancel,
    } = this.props;

    return <div className="dialog">
      <div className="dialog-mask"></div>
      <div className="dialog-container">
        <div className="dialog-header">
          <h3>{title}</h3>
          <span className="close-btn" onClick={onCancel}></span>
        </div>
        <div className="dialog-content">
          {children}
        </div>
        <div className="btn-group">
          <button onClick={onConfirm}>{confirmText || '确认'}</button>
        </div>
      </div>
    </div>;
  }
}

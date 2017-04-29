import React = require('react');
import ReactDOM = require('react-dom');
import { AppContainer } from 'react-hot-loader';

function render() {
  const App = require('./App').default;
  ReactDOM.render(
    <AppContainer>
      <App/>
    </AppContainer>,
    document.getElementById('app'),
  );
}

// tslint:disable-next-line:no-any
if ((module as any).hot) {
  // tslint:disable-next-line:no-any
  (module as any).hot.accept('./App', () => render())
}

render();

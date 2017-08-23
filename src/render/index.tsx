import React = require('react');
import ReactDOM = require('react-dom');
import { AppContainer } from 'react-hot-loader';
import { Provider } from 'react-redux';
import store from './store';
import electron = require('electron')
import { throttle } from './../lib/utils';
import './audio';
function render() {
  const App = require('./App').default;
  ReactDOM.render(
    <AppContainer>
      <Provider store={store}>
        <App/>
      </Provider>
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

document.title = '体育测试';

document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.code === 'F12') {
    electron.ipcRenderer.send('openDevTool');
  }
});

function setRem() {
  const rem = document.documentElement.clientWidth * 75 / 1280;
  document.documentElement.style.fontSize = `${rem}px`;
}

setRem();
window.addEventListener('resize', throttle(() => {
  setRem();
}, 300));

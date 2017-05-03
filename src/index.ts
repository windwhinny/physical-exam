import electron = require('electron');
import URL = require('url');
import path = require('path');
import './services/Record';
import installExtension, { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer';

const app = electron.app;


function createWindow() {
  const mainWindow = new electron.BrowserWindow({
    width: 760,
    height: 1024,
  });
  const url = URL.format({
    protocol: 'file:',
    pathname: path.join(__dirname, './index.html'),
  });
  mainWindow.loadURL(url);
  installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err));
  installExtension(REDUX_DEVTOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err));
}

app.on('ready', () => {
  createWindow()
});
app.on('all-window-closed', () => app.quit());
app.on('active', () => createWindow());

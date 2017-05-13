import electron = require('electron');
import path = require('path');
import URL = require('url');
import './services/Record';
import './services/Devices';

const app = electron.app;
const isDev = process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath);
function createWindow(url: string) {
  const mainWindow = new electron.BrowserWindow({
    width: 760,
    height: 1024,
  });
  mainWindow.loadURL(url);
  if (isDev) {
    const installExtension = require('electron-devtools-installer');
    const { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } = installExtension;
    installExtension.default(REACT_DEVELOPER_TOOLS)
      .then((name: string) => console.log(`Added Extension:  ${name}`))
      .catch((err: Error) => console.log('An error occurred: ', err));
    installExtension.default(REDUX_DEVTOOLS)
      .then((name: string) => console.log(`Added Extension:  ${name}`))
      .catch((err: Error) => console.log('An error occurred: ', err));
  }
}

app.on('ready', () => {
  if (isDev) {
    createWindow(URL.format({
      protocol: 'http:',
      host: 'localhost:8080',
    }));
  } else {
    createWindow(URL.format({
      protocol: 'file:',
      pathname: path.join(__dirname, 'index.html'),
    }))
  }
});
app.on('all-window-closed', () => {
  console.log('QUIT');
  app.quit()
});

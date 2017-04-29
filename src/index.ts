import electron = require('electron');
import URL = require('url');
import path = require('path');
const app = electron.app;

function createWindow() {
  const mainWindow = new electron.BrowserWindow({
    width: 760,
    height: 1024,
  });

  mainWindow.loadURL(URL.format({
    pathname: path.join(__dirname, './index.html'),
    protocol: 'file:',
    slashes: true,
  }));
}

app.on('ready', () => createWindow());
app.on('all-window-closed', () => app.quit());
app.on('active', () => createWindow())
import electron = require('electron');
import path = require('path');
import URL = require('url');
import { destory as RecordDestory } from './services/Record';
import { destory as DevicesDestory} from './services/Devices';
import { destory as CardReaderDestory } from './services/CardReader';

const app = electron.app;

const isDev = process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath);
function createWindow(url: string) {
  const display = electron.screen.getAllDisplays()[0];
  let options: {
    height?: number,
    width?: number,
    fullscreen?: boolean,
    maxWidth?: number,
    title?: string,
    zoomToPageWidth?: boolean,
  } = {
    width: display.workAreaSize.width > 1280 ? 1280 : display.workAreaSize.width,
    height: display.workAreaSize.height > 800 ? 800 : display.workAreaSize.height,
  };
  const mainWindow = new electron.BrowserWindow(options);
  mainWindow.loadURL(url);
  mainWindow.on('closed', async () => {
    await Promise.all<void>([
      RecordDestory(),
      DevicesDestory(),
      CardReaderDestory(),
    ]);
    app.quit();
    process.exit(0);
  });
  electron.ipcMain.on('openDevTool', () => {
    mainWindow.webContents.openDevTools();
  });
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

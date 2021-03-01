import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import initListeners from './listeners/listeners';
import * as appConst from './types/textConstants';

declare const ENVIRONMENT: string;

const IS_DEV = ENVIRONMENT === 'development';
const DEV_SERVER_URL = 'http://localhost:9000';

const appPath =
  process.env.NODE_ENV === 'production'
    ? `${process.resourcesPath}/app/dist`
    : __dirname;

const HTML_FILE_PATH = `file:///${appPath}/index.html`;

let win: BrowserWindow | null = null;
let canCloseNow = false;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      webSecurity: false,
    },
  });
  win.maximize();
  if (IS_DEV) {
    win.loadURL(DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadURL(HTML_FILE_PATH);
  }

  win.on('closed', () => {
    win = null;
  });

  win.on('close', (event) => {
    if (!canCloseNow) {
      event.preventDefault();
      win?.webContents.send(appConst.APP_CLOSING);
    }
  });
}

ipcMain.on(appConst.APP_CLOSING_PERMISSION_GRANTED, () => {
  canCloseNow = true;
  app.quit();
});

app.on('ready', () => {
  createWindow();
  initListeners(win);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

import { app, BrowserWindow, dialog, ipcMain, Menu, shell } from 'electron';
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

const isMac = process.platform === 'darwin';

const template = [
  // { role: 'appMenu' }
  ...(isMac ? [{
    label: app.name,
    submenu: [
      // { role: 'about' },
      // { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : []),
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [
      {
        label: 'Open',
        click: async () => {
        }
      },
      {
        label: 'Save',
        click: async () => {
        }
      },
      {
        label: 'Close',
        click: async () => {
        }
      },
      { type: 'separator' },
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  },
  // { role: 'editMenu' }
  // {
  //   label: 'Edit',
  //   submenu: [
  //     { role: 'undo' },
  //     { role: 'redo' },
  //     { type: 'separator' },
  //     { role: 'cut' },
  //     { role: 'copy' },
  //     { role: 'paste' },
  //     ...(isMac ? [
  //       { role: 'pasteAndMatchStyle' },
  //       { role: 'delete' },
  //       { role: 'selectAll' },
  //       { type: 'separator' },
  //       {
  //         label: 'Speech',
  //         submenu: [
  //           { role: 'startSpeaking' },
  //           { role: 'stopSpeaking' }
  //         ]
  //       }
  //     ] : [
  //       { role: 'delete' },
  //       { type: 'separator' },
  //       { role: 'selectAll' }
  //     ])
  //   ]
  // },
  // { role: 'viewMenu' }
  // {
  //   label: 'View',
  //   submenu: [
  //     { role: 'reload' },
  //     { role: 'forceReload' },
  //     { role: 'toggleDevTools' },
  //     { type: 'separator' },
  //     { role: 'resetZoom' },
  //     { role: 'zoomIn' },
  //     { role: 'zoomOut' },
  //     { type: 'separator' },
  //     { role: 'togglefullscreen' }
  //   ]
  // },
  // { role: 'windowMenu' }
  // {
  //   label: 'Window',
  //   submenu: [
  //     { role: 'minimize' },
  //     { role: 'zoom' },
  //     ...(isMac ? [
  //       { type: 'separator' },
  //       { role: 'front' },
  //       { type: 'separator' },
  //       { role: 'window' }
  //     ] : [
  //       { role: 'close' }
  //     ])
  //   ]
  // },
  {
    role: 'help',
    submenu: [
      {
        label: 'Support',
        click: async () => {
          await shell.openExternal('https://electronjs.org')
        }
      }
    ]
  }
]

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

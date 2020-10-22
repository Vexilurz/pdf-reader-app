import { ipcMain, BrowserWindow, dialog } from 'electron';
import fs from 'fs';
import * as appConst from '../types/textConstants';

// https://www.electronjs.org/docs/api/dialog

const openFileDialog = (win: BrowserWindow) => (event, arg) => {
  dialog
    .showOpenDialog({
      properties: ['openFile'],
    })
    .then((response) => {
      if (!response.canceled) {
        const path = response.filePaths[0];
        win.webContents.send(appConst.OPEN_FILE_DIALOG_RESPONSE, {
          path,
          content: JSON.parse(fs.readFileSync(path)), // todo: move to manager
        });
      }
    });
};

const newFileDialog = (win: BrowserWindow) => (event, arg) => {
  dialog
    .showSaveDialog({
      properties: [],
    })
    .then((response) => {
      if (!response.canceled) {
        win.webContents.send(appConst.NEW_FILE_DIALOG_RESPONSE, {
          path: response.filePath,
          content: null,
        });
      }
    });
};

export default (win: BrowserWindow): void => {
  const listeners = [
    { name: appConst.SHOW_OPEN_FILE_DIALOG, callback: openFileDialog(win) },
    { name: appConst.SHOW_NEW_FILE_DIALOG, callback: newFileDialog(win) },
  ];

  listeners.forEach((listener) => {
    ipcMain.on(listener.name, listener.callback);
  });
};

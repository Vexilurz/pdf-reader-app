import { ipcMain, BrowserWindow, dialog } from 'electron';
import fs from 'fs';

// https://www.electronjs.org/docs/api/dialog

const openFileDialog = (win: BrowserWindow) => (event, arg) => {
  dialog
    .showOpenDialog({
      properties: ['openFile'],
    })
    .then((response) => {
      if (!response.canceled) {
        const path = response.filePaths[0];
        win.webContents.send('open-file-dialog-response', {
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
        win.webContents.send('new-file-dialog-response', {
          path: response.filePath,
          content: null,
        });
      }
    });
};

export default (win: BrowserWindow): void => {
  const listeners = [
    { name: 'show-open-file-dialog', callback: openFileDialog(win) },
    { name: 'show-new-file-dialog', callback: newFileDialog(win) },
  ];

  listeners.forEach((listener) => {
    ipcMain.on(listener.name, listener.callback);
  });
};

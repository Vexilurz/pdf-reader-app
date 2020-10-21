import { ipcMain, BrowserWindow, dialog } from 'electron';

// https://www.electronjs.org/docs/api/dialog

const openFileDialog = (win: BrowserWindow) => (event, arg) => {
  dialog
    .showOpenDialog({
      properties: ['openFile'],
    })
    .then((response) => {
      if (!response.canceled) {
        win.webContents.send('open-file-dialog-response', {
          path: response.filePaths[0],
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

import { ipcMain, dialog } from 'electron';
import { promises as fs } from 'fs';
import * as appConst from '../types/textConstants';

// https://www.electronjs.org/docs/api/dialog

const openFileDialog = async (event, arg: string) => {
  let path = null;
  if (arg) path = arg;
  else {
    const response = await dialog.showOpenDialog({ properties: ['openFile'] });
    if (!response.canceled) {
      path = response.filePaths[0];
    }
  }
  if (path) {
    const content = await fs.readFile(path);
    event.reply(appConst.OPEN_FILE_DIALOG_RESPONSE, {
      path,
      content: JSON.parse(content),
    });
  }
};

const newFileDialog = async (event, arg) => {
  const response = await dialog.showSaveDialog({ properties: [] });
  if (!response.canceled) {
    event.reply(appConst.NEW_FILE_DIALOG_RESPONSE, {
      path: response.filePath,
      content: null,
    });
  }
};

export default (): void => {
  const listeners = [
    { name: appConst.SHOW_OPEN_FILE_DIALOG, callback: openFileDialog },
    { name: appConst.SHOW_NEW_FILE_DIALOG, callback: newFileDialog },
  ];

  listeners.forEach(async (listener) => {
    ipcMain.on(listener.name, listener.callback);
  });
};

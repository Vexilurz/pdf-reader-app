import { ipcMain, dialog } from 'electron';
import { promises as fs } from 'fs';
import * as appConst from '../types/textConstants';
import { IProjectFileWithPath } from '../types/projectFile';

// https://www.electronjs.org/docs/api/dialog

const openFile = async (event, path: string) => {
  let ourPath = null;
  if (path) ourPath = path;
  else {
    const response = await dialog.showOpenDialog({ properties: ['openFile'] });
    if (!response.canceled) {
      ourPath = response.filePaths[0];
    }
  }
  if (ourPath) {
    const content = await fs.readFile(ourPath);
    event.reply(appConst.OPEN_FILE_DIALOG_RESPONSE, {
      path: ourPath,
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

const saveCurrentProject = async (event, currentProject) => {
  const res = await fs.writeFile(currentProject.path, currentProject.content);
  // todo: listen to this event in renderer to display success message
  event.reply(appConst.SAVE_CURRENT_PROJECT_DONE, res);
};

export default (): void => {
  const listeners = [
    { name: appConst.OPEN_FILE, callback: openFile },
    { name: appConst.SHOW_NEW_FILE_DIALOG, callback: newFileDialog },
    { name: appConst.SAVE_CURRENT_PROJECT, callback: saveCurrentProject },
  ];

  listeners.forEach(async (listener) => {
    ipcMain.on(listener.name, listener.callback);
  });
};

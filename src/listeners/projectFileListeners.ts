import { ipcMain } from 'electron';
import { promises as fs } from 'fs';
import * as appConst from '../types/textConstants';

const saveCurrentProject = async (event, currentProject) => {
  const res = await fs.writeFile(currentProject.path, currentProject.content);
  event.reply(appConst.SAVE_CURRENT_PROJECT_DONE, res);
};

export default (): void => {
  const listeners = [
    { name: appConst.SAVE_CURRENT_PROJECT, callback: saveCurrentProject },
  ];

  listeners.forEach(async (listener) => {
    ipcMain.on(listener.name, listener.callback);
  });
};

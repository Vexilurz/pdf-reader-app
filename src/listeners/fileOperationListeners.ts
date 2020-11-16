import { ipcMain, dialog } from 'electron';
import { promises as fs } from 'fs';
import * as fssync from 'fs';
import * as appConst from '../types/textConstants';
import { v4 as uuidv4 } from 'uuid';
import { deletePathFromFilename, getPathWithoutFilename } from '../utils/commonUtils';
import { IProjectFile } from '../types/projectFile';
import { IEvent } from '../types/event';
import { zipDirectory, unzipFile } from '../utils/zip';

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
    const newID = uuidv4();
    const destPath = `${appConst.OPENED_PROJECTS_PATH}${newID}/`;
    try {
      await unzipFile(ourPath, destPath);
      const content = await fs.readFile(`${destPath}${appConst.PROJECT_FILE_NAME}`);
      event.reply(appConst.OPEN_FILE_DIALOG_RESPONSE, {
        id: newID,
        path: ourPath,
        content: JSON.parse(content),
      });
    } catch (e) {
      console.error(e);
    }
  }
};

const newFileDialog = async (event, arg) => {
  const response = await dialog.showSaveDialog({ properties: [] });
  if (!response.canceled) {
    event.reply(appConst.NEW_FILE_DIALOG_RESPONSE, {
      // id: uuidv4(),
      path: response.filePath,
      // content: null,
    });
  }
};

const saveCurrentProject = async (event, currentProject) => {
  const path = `${appConst.OPENED_PROJECTS_PATH}${currentProject.id}/`;
  await fs.mkdir(path, { recursive: true });
  const content: IProjectFile = JSON.parse(currentProject.content);
  const newEvents: IEvent[] = await Promise.all(
    content.events.map(async (item) => {
      await fs.mkdir(`${path}${item.id}/`, { recursive: true });
      const files = await Promise.all(
        item.files.map(async (file) => {
          const fileName = deletePathFromFilename(file.path);
          // todo: check for file exists. file may be already without path and have relative position.
          if (getPathWithoutFilename(file.path) === '') {

          } else {
            await fs.copyFile(file.path, `${path}${item.id}/${fileName}`);
          }
          return { path: fileName, bookmarks: file.bookmarks };
        })
      );
      return { ...item, files };
    })
  );
  content.events = newEvents;

  const res = await fs.writeFile(`${path}${appConst.PROJECT_FILE_NAME}`, JSON.stringify(content));

  // await zipDirectory(path, currentProject.path);

  // await unzipFile(currentProject.path, '.tmp/');

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

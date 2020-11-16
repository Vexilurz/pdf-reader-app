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
  const existingEventsOnDisc = await fs.readdir(`${path}`);
  const newEvents: IEvent[] = await Promise.all(
    content.events.map(async (item) => {
      await fs.mkdir(`${path}${item.id}/`, { recursive: true });
      const existEventInd = existingEventsOnDisc.findIndex((ev) => ev === item.id);
      if (existEventInd > -1) existingEventsOnDisc[existEventInd] = '';
      const existingPdfsOnDisc = await fs.readdir(`${path}${item.id}/`);
      const files = await Promise.all(
        item.files.map(async (file) => {
          const fileName = deletePathFromFilename(file.path);
          const pdfInd = existingPdfsOnDisc.findIndex((pdf) => pdf === fileName);
          if (pdfInd > -1) existingPdfsOnDisc[pdfInd] = '';
          // todo: check for file exists. file may be already without path and have relative position.
          if (getPathWithoutFilename(file.path) === '') {

          } else {
            await fs.copyFile(file.path, `${path}${item.id}/${fileName}`);
          }
          return { path: fileName, bookmarks: file.bookmarks };
        })
      );
      existingPdfsOnDisc.forEach((pdf) => {
        if (pdf !== '') fssync.unlinkSync(`${path}${item.id}/${pdf}`);
      });
      return { ...item, files };
    })
  );
  content.events = newEvents;

  existingEventsOnDisc.forEach((ev) => {
    if (ev !== '') fssync.rmdirSync(`${path}${ev}`, { recursive: true });
  });

  const res = await fs.writeFile(`${path}${appConst.PROJECT_FILE_NAME}`, JSON.stringify(content));

  await fs.unlink(currentProject.path);
  await zipDirectory(path, currentProject.path);

  // todo: listen to this event in renderer to display success message
  event.reply(appConst.SAVE_CURRENT_PROJECT_DONE, res);
};

const deleteFolder = async (event, projectID) => {
  const path = `${appConst.OPENED_PROJECTS_PATH}${projectID}/`;
  await fs.rmdir(path, { recursive: true });
};

const clearCache = async (event) => {
  const path = `${appConst.OPENED_PROJECTS_PATH}`;
  await fs.rmdir(path, { recursive: true });
  await fs.mkdir(path, { recursive: true });
};

export default (): void => {
  const listeners = [
    { name: appConst.OPEN_FILE, callback: openFile },
    { name: appConst.SHOW_NEW_FILE_DIALOG, callback: newFileDialog },
    { name: appConst.SAVE_CURRENT_PROJECT, callback: saveCurrentProject },
    { name: appConst.DELETE_FOLDER, callback: deleteFolder },
    { name: appConst.CLEAR_CACHE, callback: clearCache },
  ];

  listeners.forEach(async (listener) => {
    ipcMain.on(listener.name, listener.callback);
  });
};

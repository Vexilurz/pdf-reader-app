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
  fssync.mkdirSync(path, { recursive: true });
  const content: IProjectFile = JSON.parse(currentProject.content);
  const existingEventsOnDisc = fssync.readdirSync(`${path}`);
  const newEvents: IEvent[] = content.events.map((item) => {
    fssync.mkdirSync(`${path}${item.id}/`, { recursive: true });
    // We want delete all deleted events. So we mark existing events ('').
    const existEventInd = existingEventsOnDisc.findIndex((ev) => ev === item.id);
    if (existEventInd > -1) existingEventsOnDisc[existEventInd] = '';
    const existingPdfsOnDisc = fssync.readdirSync(`${path}${item.id}/`);
    const files = item.files.map((file) => {
      const fileName = deletePathFromFilename(file.path);
      // todo: check for file exists. file may be already without path and have relative position.
      let newFileName = fileName;
      if (getPathWithoutFilename(file.path) === '') {
        // file already have place in the openedProjects folder.
      } else {
        let i = 1;
        try {
          while (fssync.existsSync(`${path}${item.id}/${newFileName}`)) {
            newFileName = `(${i})${fileName}`;
            i += 1;
          }
          fssync.copyFileSync(file.path, `${path}${item.id}/${newFileName}`);
          console.log('copied', `${path}${item.id}/${newFileName}`);
        } catch (e) {
          console.error(e);
        }
      }
      // We want delete all deleted PDFs. So we mark existing pdfs.
      const pdfInd = existingPdfsOnDisc.findIndex((pdf) => pdf === newFileName);
      if (pdfInd > -1) existingPdfsOnDisc[pdfInd] = '';
      return { path: newFileName, bookmarks: file.bookmarks };
    });
    // ... and delete remaining pdfs.
    existingPdfsOnDisc.forEach((pdf) => {
      if (pdf !== '') fssync.unlinkSync(`${path}${item.id}/${pdf}`);
    });
    return { ...item, files };
  });
  content.events = newEvents;

  // Delete deleted (remaining) events:
  existingEventsOnDisc.forEach((ev) => {
    if (ev !== '') fssync.rmdirSync(`${path}${ev}`, { recursive: true });
  });

  const res = fssync.writeFileSync(`${path}${appConst.PROJECT_FILE_NAME}`, JSON.stringify(content));

  if (fssync.existsSync(currentProject.path))
    fssync.unlinkSync(currentProject.path);

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

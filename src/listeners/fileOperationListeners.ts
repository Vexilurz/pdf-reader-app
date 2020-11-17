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
    const destPath = `${appConst.CACHE_PATH}${newID}/`;
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

const saveFileDialog = async (event, arg) => {
  const response = await dialog.showSaveDialog({
    filters: [
      { name: 'ZIP files', extensions: ['zip'] },
      { name: 'All files', extensions: ['*'] },
    ],
  });
  if (!response.canceled) {
    event.reply(appConst.NEW_FILE_DIALOG_RESPONSE, {
      path: response.filePath,
    });
  }
};

const saveCurrentProject = async (event, currentProject) => {
  const path = `${appConst.CACHE_PATH}${currentProject.id}/`;
  // fssync.mkdirSync(path, { recursive: true });
  const res = fssync.writeFileSync(`${path}${appConst.PROJECT_FILE_NAME}`, currentProject.content);

  if (fssync.existsSync(currentProject.path))
    fssync.unlinkSync(currentProject.path);

  await zipDirectory(path, currentProject.path);

  // todo: listen to this event in renderer to display success message
  event.reply(appConst.SAVE_CURRENT_PROJECT_DONE, res);
};

const deleteFolderFromCache = async (event, folder: string) => {
  const path = `${appConst.CACHE_PATH}${folder}/`;
  await fs.rmdir(path, { recursive: true });
};

const createFolderInCache = async (event, folder: string) => {
  const path = `${appConst.CACHE_PATH}${folder}/`;
  await fs.mkdir(path, { recursive: true });
};

const clearCache = async (event) => {
  const path = `${appConst.CACHE_PATH}`;
  fssync.rmdirSync(path, { recursive: true });
  await fs.mkdir(path, { recursive: true });
};

const updateEventInCache = async (e, payload) => {
  const { projectID } = payload;
  const event: IEvent = JSON.parse(payload.event);
  const path = `${appConst.CACHE_PATH}${projectID}/${event.id}/`;
  fssync.mkdirSync(path, { recursive: true });
  const existingPdfsOnDisk = fssync.readdirSync(path);

  event.files = event.files.map((file) => {
    const fileName = deletePathFromFilename(file.path);
    let newFileName = fileName;
    if (getPathWithoutFilename(file.path) === '') {
      // file already have place in the cache folder.
    } else {
      let i = 1;
      try {
        while (fssync.existsSync(`${path}${newFileName}`)) {
          newFileName = `(${i})${fileName}`;
          i += 1;
        }
        fssync.copyFileSync(file.path, `${path}${newFileName}`);
      } catch (err) {
        console.error(err);
      }
    }
    // We want delete all deleted PDFs. So we remove existing pdfs from array...
    const pdfInd = existingPdfsOnDisk.findIndex((pdf) => pdf === newFileName);
    if (pdfInd > -1) existingPdfsOnDisk.splice(pdfInd, 1);
    return { ...file, path: newFileName };
  });
  // ...and delete remaining pdfs.
  existingPdfsOnDisk.forEach((pdf) => {
    fssync.unlinkSync(`${path}${pdf}`);
  });

  e.reply(appConst.UPDATE_EVENT_IN_CACHE_COMPLETE, JSON.stringify(event));
};

export default (): void => {
  const listeners = [
    { name: appConst.OPEN_FILE, callback: openFile },
    { name: appConst.SHOW_SAVE_FILE_DIALOG, callback: saveFileDialog },
    { name: appConst.SAVE_CURRENT_PROJECT, callback: saveCurrentProject },
    { name: appConst.DELETE_FOLDER_FROM_CACHE, callback: deleteFolderFromCache },
    { name: appConst.CREATE_FOLDER_IN_CACHE, callback: createFolderInCache },
    { name: appConst.CLEAR_CACHE, callback: clearCache },
    { name: appConst.UPDATE_EVENT_IN_CACHE, callback: updateEventInCache },
  ];

  listeners.forEach(async (listener) => {
    ipcMain.on(listener.name, listener.callback);
  });
};

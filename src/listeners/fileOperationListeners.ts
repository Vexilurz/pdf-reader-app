import { ipcMain, dialog } from 'electron';
import { promises as fs } from 'fs';
import * as fssync from 'fs';
import * as pathLib from 'path';
import * as appConst from '../types/textConstants';
import { v4 as uuidv4 } from 'uuid';
import { IProjectFile } from '../types/projectFile';
import { IEvent } from '../types/event';
import { zipDirectory, unzipFile } from '../utils/zip';
import chmodr from '../utils/chmodr';

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
    const destPath = pathLib.join(appConst.CACHE_PATH, newID);
    try {
      await unzipFile(ourPath, destPath);
      const contentFileName = pathLib.join(destPath, appConst.PROJECT_FILE_NAME);
      const content = await fs.readFile(contentFileName);
      chmodr.sync(destPath, 0o444);
      fssync.chmodSync(contentFileName, 0o777);
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

const canWrite = (path, callback) => {
  fssync.access(path, fssync.W_OK, (err) => {
    callback(null, !err);
  });
};

const canWritePromise = function (path) {
  return new Promise((resolve, reject) => {
    fssync.access(path, fssync.W_OK, (err) => {
      if (err) {
        dialog.showMessageBox({
          message: `Can't save project to "${path}"!`,
          title: 'Information',
          type: 'error',
          buttons: ['Ok'],
        });
      }
      resolve(!err);
    });
  });
};

const saveFileDialog = async (event, arg) => {
  let isWritable = false;
  while (!isWritable) {
    const response = await dialog.showSaveDialog({
      filters: [
        { name: 'ZIP files', extensions: ['zip'] },
        { name: 'All files', extensions: ['*'] },
      ],
    });
    if (!response.canceled) {
      isWritable = await canWritePromise(pathLib.dirname(response.filePath));

      if (isWritable)
        event.reply(appConst.NEW_FILE_DIALOG_RESPONSE, {
          path: response.filePath,
        });
      else {
        // TODO: show message about write permissions
        console.log(`can't write file!`)
      }
    } else {
      // TODO: like a crunch. 
      isWritable = true
    }
  }
};

const saveCurrentProject = async (event, currentProject) => {
  const path = pathLib.join(appConst.CACHE_PATH, currentProject.id);
  // fssync.mkdirSync(path, { recursive: true });
  const res = fssync.writeFileSync(pathLib.join(path, appConst.PROJECT_FILE_NAME), currentProject.content);

  const isWritable = await canWritePromise(pathLib.dirname(currentProject.path));

  if (isWritable) {
    if (fssync.existsSync(currentProject.path))
      fssync.unlinkSync(currentProject.path);

    await zipDirectory(path, currentProject.path);

    // todo: listen to this event in renderer to display success message
    event.reply(appConst.SAVE_CURRENT_PROJECT_DONE, res);
    dialog.showMessageBox({
      message: `Project saved.`,
      title: 'Information',
      type: 'info',
      buttons: ['Ok'],
    });
  }
};

const deleteFolderFromCache = async (event, folder: string) => {
  const path = pathLib.join(appConst.CACHE_PATH, folder);
  chmodr.sync(path, 0o777);
  await fs.rmdir(path + pathLib.sep, { recursive: true });
};

const createFolderInCache = async (event, folder: string) => {
  const path = pathLib.join(appConst.CACHE_PATH, folder);
  await fs.mkdir(path, { recursive: true });
};

const clearCache = async (event) => {
  const path = appConst.CACHE_PATH;
  fssync.rmdirSync(path + pathLib.sep, { recursive: true });
  await fs.mkdir(path, { recursive: true });
};

const updateEventInCache = async (e, payload) => {
  const { projectID } = payload;
  const event: IEvent = JSON.parse(payload.event);
  const path = pathLib.join(appConst.CACHE_PATH, projectID, event.id);
  fssync.mkdirSync(path, { recursive: true });

  // delete deleted files:
  const existingFilesOnDisk = fssync.readdirSync(path);
  event.files.forEach((file) => {
    if (pathLib.dirname(file.path) === '.') {
      const pdfInd = existingFilesOnDisk.findIndex((ef) => ef === pathLib.basename(file.path));
      if (pdfInd > -1) existingFilesOnDisk.splice(pdfInd, 1);
    }
  });
  existingFilesOnDisk.forEach((pdf) => {
    const pathToPdf = pathLib.join(path, pdf);
    fssync.chmodSync(pathToPdf, 0o777);
    fssync.unlinkSync(pathToPdf);
  });

  // copy new files and change file paths
  event.files = event.files.map((file) => {
    const fileName = pathLib.basename(file.path);
    let newFileName = fileName;
    if (pathLib.dirname(file.path) === '.') {
      // file already have place in the cache folder, and we dont need to copy them.
    } else {
      let i = 1;
      try {
        while (fssync.existsSync(pathLib.join(path, newFileName))) {
          newFileName = `(${i})${fileName}`;
          i += 1;
        }
        fssync.copyFileSync(file.path, pathLib.join(path, newFileName));
      } catch (err) {
        console.error(err);
      }
    }
    return { ...file, path: newFileName };
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

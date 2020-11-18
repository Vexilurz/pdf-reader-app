import { ipcMain } from 'electron';
import { promises as fs } from 'fs';
import * as fssync from 'fs';
import * as appConst from '../types/textConstants';

const checkForRecentFileExists = () => {
  if (!fssync.existsSync(appConst.RECENT_PROJECTS_FILENAME))
    fssync.writeFileSync(appConst.RECENT_PROJECTS_FILENAME, JSON.stringify([]));
};

const addToRecentProjects = async (event, project) => {
  checkForRecentFileExists();
  const content = await fs.readFile(appConst.RECENT_PROJECTS_FILENAME);
  let recent = JSON.parse(content);

  const index = recent.findIndex((item) => item.path === project.path);
  if (index === -1)
    recent.push({ path: project.path, name: project.content.name });
  else
    recent[index] = { path: project.path, name: project.content.name };

  while (recent.length > 10) {
    recent.splice(0, 1);
  }

  const res = await fs.writeFile(
    appConst.RECENT_PROJECTS_FILENAME,
    JSON.stringify(recent)
  );
  // todo: listen to this event for some reason
  event.reply(appConst.ADD_TO_RECENT_PROJECTS_DONE, res);
};

const deleteFromRecentProjects = async (event, project) => {
  checkForRecentFileExists();
  const content = await fs.readFile(appConst.RECENT_PROJECTS_FILENAME);
  let recent = JSON.parse(content);

  const index = recent.findIndex((item) => item.path === project.path);
  if (index > -1) recent.splice(index, 1);

  const res = await fs.writeFile(
    appConst.RECENT_PROJECTS_FILENAME,
    JSON.stringify(recent)
  );
  event.reply(appConst.GET_RECENT_PROJECTS_RESPONSE, recent);
};

const getRecentProjects = async (event) => {
  checkForRecentFileExists();
  const recent = await fs.readFile(appConst.RECENT_PROJECTS_FILENAME);
  event.reply(appConst.GET_RECENT_PROJECTS_RESPONSE, JSON.parse(recent));
};

export default (): void => {
  const listeners = [
    { name: appConst.ADD_TO_RECENT_PROJECTS, callback: addToRecentProjects },
    { name: appConst.DELETE_FROM_RECENT_PROJECTS, callback: deleteFromRecentProjects },
    { name: appConst.GET_RECENT_PROJECTS, callback: getRecentProjects },
  ];

  listeners.forEach(async (listener) => {
    ipcMain.on(listener.name, listener.callback);
  });
};

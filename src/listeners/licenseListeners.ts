import axios from 'axios';
import { ipcMain } from 'electron';
import { promises as fs } from 'fs';
import * as fssync from 'fs';
import * as pathLib from 'path';
import * as appConst from '../types/textConstants';
import { getNewExpiringDate } from '../utils/dateUtils';

const activateLicense = async (event, payload) => {
  const key = payload;
  const body = {
    product_permalink: 'Xtpqg',
    license_key: key,
  };
  axios({
    method: 'post',
    url: 'https://api.gumroad.com/v2/licenses/verify',
    data: body,
  })
    .then((response) => {
      const { data } = response;
      event.reply(appConst.ACTIVATE_LICENSE_RESPONSE, data);
    })
    .catch((error) => {
      const { response } = error;
      const { data } = response;
      event.reply(appConst.ACTIVATE_LICENSE_RESPONSE, data);
    });
};

const saveLicenseInformation = async (event, payload) => {
  const licenseKey = payload;
  const dataToSave = {
    licenseKey,
    expiringDate: getNewExpiringDate(),
  };
  const path = pathLib.join(appConst.APP_FOLDER, appConst.LICENSE_FILE_NAME);
  const contentToSave = JSON.stringify(dataToSave);
  await fs.writeFile(path, contentToSave);
};

const loadLicenseInformation = async (event, payload) => {
  const path = pathLib.join(appConst.APP_FOLDER, appConst.LICENSE_FILE_NAME);
  if (fssync.existsSync(path)) {
    const content = await fs.readFile(path);
    const contentToResponse = JSON.parse(content);
    event.reply(appConst.LOAD_LICENSE_INFORMATION_RESPONSE, contentToResponse);
  }
};

export default (): void => {
  const listeners = [
    { name: appConst.ACTIVATE_LICENSE, callback: activateLicense },
    { name: appConst.SAVE_LICENSE_INFORMATION, callback: saveLicenseInformation },
    { name: appConst.LOAD_LICENSE_INFORMATION, callback: loadLicenseInformation },
  ];

  listeners.forEach((listener) => {
    ipcMain.on(listener.name, listener.callback);
  });
};

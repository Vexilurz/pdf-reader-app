import axios from 'axios';
import { ipcMain } from 'electron';
import { promises as fs } from 'fs';
import Cryptr from 'cryptr';
import * as fssync from 'fs';
import * as pathLib from 'path';
import * as appConst from '../types/textConstants';
import { getNewExpiringDate, getNewTrialDate } from '../utils/dateUtils';

const crypt = new Cryptr('DocumentAppSecretKeyThere');

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

const _saveLicFile = async (licenseKey: string, expiringDate: string) => {
  const dataToSave = {
    licenseKey,
    expiringDate,
  };
  const path = pathLib.join(appConst.APP_FOLDER, appConst.LICENSE_FILE_NAME);
  const contentToSave = JSON.stringify(dataToSave);
  const encryptedContent = crypt.encrypt(contentToSave);
  await fs.writeFile(path, encryptedContent);
};

const saveLicenseInformation = async (event, payload) => {
  await _saveLicFile(payload, getNewExpiringDate());
};

const loadLicenseInformation = async (event, payload) => {
  const path = pathLib.join(appConst.APP_FOLDER, appConst.LICENSE_FILE_NAME);
  try {
    if (fssync.existsSync(path)) {
      const content = await fs.readFile(path);
      const decryptedContent = crypt.decrypt(content);
      const contentToResponse = JSON.parse(decryptedContent);
      event.reply(appConst.LOAD_LICENSE_INFORMATION_RESPONSE, contentToResponse);
    } else {
      const expiringDate = getNewTrialDate();
      const licenseKey = 'TRIAL';
      await _saveLicFile(licenseKey, expiringDate);
      event.reply(appConst.LOAD_LICENSE_INFORMATION_RESPONSE, {
        licenseKey,
        expiringDate,
      });
    }
  } catch (e) {
    console.error('License load error: ', e);
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

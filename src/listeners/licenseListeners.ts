import axios from 'axios';
import { ipcMain } from 'electron';
import { promises as fs } from 'fs';
import * as appConst from '../types/textConstants';

const activateLicense = async (event, payload) => {
  const key = payload;
  const body = {
    product_permalink: 'Xtpqg',
    license_key: key,
  };
  // console.log('>>> start axios')
  axios({
    method: 'post',
    url: 'https://api.gumroad.com/v2/licenses/verify',
    data: body,
  })
    .then((response) => {
      const { data } = response;
      // console.log('SUCCESS!');
      // console.log(data);
      event.reply(appConst.ACTIVATE_LICENSE_RESPONSE, data);
    })
    .catch((error) => {
      const { response } = error;
      const { data } = response;
      // console.error('!!!ERROR!!!');
      // console.error(data);
      event.reply(appConst.ACTIVATE_LICENSE_RESPONSE, data);
    });
};

export default (): void => {
  const listeners = [
    { name: appConst.ACTIVATE_LICENSE, callback: activateLicense },
  ];

  listeners.forEach((listener) => {
    ipcMain.on(listener.name, listener.callback);
  });
};

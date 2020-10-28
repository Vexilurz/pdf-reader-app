import { ipcMain, dialog } from 'electron';
import { promises as fs } from 'fs';
import * as appConst from '../types/textConstants';

const loadPdfFile = async (event, path: string) => {
  const data: Uint8Array = await fs.readFile(path);
  event.reply(appConst.PDF_FILE_CONTENT_RESPONSE, data);
};

export default (): void => {
  const listeners = [
    { name: appConst.LOAD_PDF_FILE, callback: loadPdfFile },
  ];

  listeners.forEach((listener) => {
    ipcMain.on(listener.name, listener.callback);
  });
};

import { BrowserWindow, ipcMain } from 'electron';
import { promises as fs } from 'fs';
import printDialog from 'electron-print-dialog';
import * as appConst from '../types/textConstants';

const loadPdfFile = async (event, path: string) => {
  let data: Uint8Array = new Uint8Array();
  if (path !== '') data = await fs.readFile(path);
  event.reply(appConst.PDF_FILE_CONTENT_RESPONSE, data);
};

const printPdfFile = (win: BrowserWindow | null) => async (event, data) => {
  printDialog.open(win, data);
};

export default (win: BrowserWindow | null): void => {
  const listeners = [
    { name: appConst.LOAD_PDF_FILE, callback: loadPdfFile },
    { name: appConst.PRINT_PDF_FILE, callback: printPdfFile(win) },
  ];

  listeners.forEach((listener) => {
    ipcMain.on(listener.name, listener.callback);
  });
};

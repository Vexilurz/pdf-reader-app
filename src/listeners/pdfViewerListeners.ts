import { BrowserWindow, dialog, ipcMain } from 'electron';
import PDFWindow from 'electron-pdf-window';
import { promises as fs } from 'fs';
import * as appConst from '../types/textConstants';
import ptp from "pdf-to-printer";

const loadPdfFile = async (event, payload) => {
  const { path, external } = payload;
  let data: Uint8Array = new Uint8Array();
  if (path !== '') data = await fs.readFile(path);
  event.reply(appConst.PDF_FILE_CONTENT_RESPONSE, { data, path, external });
};

// TODO: deprecated (and "external" feature too).
const openExternalPdf = async (event) => {
  const response = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'PDF files', extensions: ['pdf'] }],
  });
  if (!response.canceled) {
    await loadPdfFile(event, { path: response.filePaths[0], external: true });
  }
};

const printPdfFile = async (event, filePath: string) => {
  if (process.env.NODE_ENV === 'development') {
    process.chdir('./dist');
    try {
      await ptp.print(filePath, {
        win32: ['-print-dialog'],
      });
    } catch (err) {
      dialog.showMessageBox({ message: err.message });
    }
    process.chdir('../');
  } else {
    dialog.showMessageBox({ message: 'Printing feature is unavaliable now.' });
  }
};

export default (win: BrowserWindow | null): void => {
  const listeners = [
    { name: appConst.LOAD_PDF_FILE, callback: loadPdfFile },
    { name: appConst.OPEN_EXTERNAL_PDF, callback: openExternalPdf },
    { name: appConst.PRINT_PDF_FILE, callback: printPdfFile },
  ];

  listeners.forEach((listener) => {
    ipcMain.on(listener.name, listener.callback);
  });
};

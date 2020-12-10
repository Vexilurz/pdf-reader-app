import { BrowserWindow, dialog, ipcMain } from 'electron';
import PDFWindow from 'electron-pdf-window';
import { promises as fs } from 'fs';
// import printDialog from 'electron-print-dialog';
import * as appConst from '../types/textConstants';

const loadPdfFile = async (event, payload) => {
  const { path, external } = payload;
  let data: Uint8Array = new Uint8Array();
  if (path !== '') data = await fs.readFile(path);
  event.reply(appConst.PDF_FILE_CONTENT_RESPONSE, { data, path, external });
};

const openExternalPdf = async (event) => {
  const response = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'PDF files', extensions: ['pdf'] }],
  });
  if (!response.canceled) {
    await loadPdfFile(event, { path: response.filePaths[0], external: true });
  }
};

const printPdfFile = async (event, path: string) => {
  const options = {
    silent: false,
    printBackground: true,
    color: false,
    margin: {
      marginType: 'printableArea',
    },
    landscape: false,
    pagesPerSheet: 1,
    collate: false,
    copies: 1,
    header: 'Header of the Page',
    footer: 'Footer of the Page',
  };

  const win = new BrowserWindow({
    show: false,
    // webPreferences: {
    //   plugins: true,
    //   // nodeIntegration: true,
    // },
  });
  PDFWindow.addSupport(win);

  // const win = new PDFWindow({
  //   width: 800,
  //   height: 600,
  // });

  // win.loadURL(`file://${path}`);
  win.loadURL('https://www.google.com/');
  // win.loadURL('http://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf');

  win.webContents.on('did-finish-load', () => {
    setTimeout(() => {
      win.webContents.print(options, (success, failureReason) => {
        if (!success) console.log(failureReason);
        console.log('Print Initiated');
        win.close();
      });
    }, 3000); // A time to load and render PDF
  });
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

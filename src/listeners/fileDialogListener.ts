import { ipcMain } from 'electron';

export const initFileDialogListener = (win: BrowserWindow) => {
  ipcMain.on('open-file-dialog', (event, arg) => {
    console.log('heyyyy', event, arg)
    win.webContents.send("open-file-dialog-response", "hello from main");
  })
}
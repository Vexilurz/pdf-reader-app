import { BrowserWindow } from 'electron';
import { initFileDialogListener } from './fileDialogListener';

export const initListeners = (win: BrowserWindow | null) => {
  if (win !== null) {
    initFileDialogListener(win);
  }
}
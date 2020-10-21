import { BrowserWindow } from 'electron';
import initFileDialogListener from './fileDialogListener';

export default (win: BrowserWindow | null): void => {
  if (win !== null) {
    initFileDialogListener(win);
  }
};

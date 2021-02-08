import { BrowserWindow } from 'electron';
import initFileOperationListeners from './fileOperationListeners';
import initPdfViewerListeners from './pdfViewerListeners';
import initProjectFileListeners from './projectFileListeners';

export default (win: BrowserWindow | null): void => {
  initFileOperationListeners();
  initPdfViewerListeners(win);
  initProjectFileListeners();
};

import initFileDialogListeners from './fileDialogListeners';
import initpdfViewerListeners from './pdfViewerListeners';
import initProjectFileListeners from './projectFileListeners';

export default (): void => {
  initFileDialogListeners();
  initpdfViewerListeners();
  initProjectFileListeners();
};

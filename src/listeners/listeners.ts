import initFileDialogListeners from './fileDialogListeners';
import initpdfViewerListeners from './pdfViewerListeners';

export default (): void => {
  initFileDialogListeners();
  initpdfViewerListeners();
};

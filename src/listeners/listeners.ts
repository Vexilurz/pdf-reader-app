import initFileOperationListeners from './fileOperationListeners';
import initPdfViewerListeners from './pdfViewerListeners';
import initProjectFileListeners from './projectFileListeners';

export default (): void => {
  initFileOperationListeners();
  initPdfViewerListeners();
  initProjectFileListeners();
};

import * as React from 'react';
import PDFPage from '../components/pdf/pdfPage';
import { TEST_BOOKMARKS } from '../types/pdfBookmark';

const pdfPath = '/public/example.pdf';

export interface IPDFViewerProps {}

export default class PDFViewer extends React.Component<IPDFViewerProps> {
  componentDidMount() {}

  render(): React.ReactElement {
    return (
      <div className="pdf-viewer" id="pdf-viewer">
        <h4>Single Page</h4>
        <PDFPage pdf={pdfPath} bookmarks={TEST_BOOKMARKS} />
      </div>
    );
  }
}

import * as React from 'react';
import { Document, Page } from 'react-pdf';
import SinglePagePDFViewer from '../components/pdf/single-page';
import AllPagesPDFViewer from '../components/pdf/all-pages';

const pdfPath = '/public/example.pdf';

export interface IPDFViewerProps {}

export default class PDFViewer extends React.Component<IPDFViewerProps> {
  componentDidMount() {}

  render(): React.ReactElement {
    return (
      <div className="pdf-viewer" id="pdf-viewer">
        <h4>Single Page</h4>
        <SinglePagePDFViewer pdf={pdfPath} />

        {/* <hr />

        <h4>All Pages</h4>
        <div className="all-page-container">
          <AllPagesPDFViewer pdf={pdfPath} />
        </div>

        <hr /> */}
      </div>
    );
  }
}

import * as React from 'react';
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
      </div>
    );
  }
}

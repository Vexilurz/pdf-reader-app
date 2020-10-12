import * as React from 'react';
import { Document, Page } from 'react-pdf';
import SinglePagePDFViewer from '../components/pdf/single-page';
import AllPagesPDFViewer from '../components/pdf/all-pages';
import ReactResizeDetector from 'react-resize-detector';

const pdfPath = '/public/example.pdf';

export interface IPDFViewerProps {}

export default class PDFViewer extends React.Component<IPDFViewerProps> {
  componentDidMount() {}

  render(): React.ReactElement {
    return (
      <ReactResizeDetector handleWidth handleHeight>
        {({ width, height }) => (
          <div className="pdf-viewer" id="pdf-viewer">
            <h4>Single Page</h4>
            <SinglePagePDFViewer pdf={pdfPath} parentWidth={width} />
          </div>
        )}
      </ReactResizeDetector>
    );
  }
}

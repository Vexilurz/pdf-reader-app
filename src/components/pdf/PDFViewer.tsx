import * as React from 'react';
import PDFPage from './PDFPage';
import { TEST_BOOKMARKS } from '../../types/pdfBookmark';

const pdfPath = '/public/example.pdf';

export interface IPDFViewerProps {}

export default class PDFViewer extends React.Component<IPDFViewerProps> {
  private containerRef: React.RefObject<any>;

  constructor(props: IPDFViewerProps) {
    super(props);
    this.containerRef = React.createRef();
  }

  componentDidMount() {}

  render(): React.ReactElement {
    return (
      <div className="pdf-viewer" ref={this.containerRef}>
        <h4>Single Page</h4>
        <PDFPage
          pdf={pdfPath}
          bookmarks={TEST_BOOKMARKS}
          parentRef={this.containerRef}
        />
      </div>
    );
  }
}

import * as React from 'react';
import { Document, Page } from 'react-pdf';

const pdfPath = '/public/example.pdf';

export interface IPDFViewerProps {}

export default class PDFViewer extends React.Component<IPDFViewerProps> {
  componentDidMount() {}

  render(): React.ReactElement {
    return (
      <Document file={pdfPath}>
        <Page pageNumber={3} />
      </Document>
    );
  }
}

import React from 'react';
import { Document, Page } from 'react-pdf';

interface IAllPagesPDFViewerProps {
  pdf: string;
}

interface IAllPagesPDFViewerState {
  numPages: number;
}

export default class AllPagesPDFViewer extends React.Component<
  IAllPagesPDFViewerProps,
  IAllPagesPDFViewerState
> {
  constructor(props) {
    super(props);
    this.state = { numPages: 0 };
  }

  onDocumentLoadSuccess = ({ numPages }) => {
    this.setState({ numPages });
  };

  render = (): React.ReactElement => {
    const { pdf } = this.props;
    const { numPages } = this.state;
    return (
      <Document file={pdf} onLoadSuccess={this.onDocumentLoadSuccess}>
        {Array.from(new Array(numPages), (el, index) => (
          <Page key={`page_${index + 1}`} pageNumber={index + 1} />
        ))}
      </Document>
    );
  };
}

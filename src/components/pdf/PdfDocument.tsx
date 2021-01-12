import React, { Component } from 'react';
import { Document } from 'react-pdf/dist/esm/entry.webpack';
import { List, AutoSizer } from 'react-virtualized';
import { IPDFdata } from '../../types/pdf';

interface Props {
  pdfFile?: IPDFdata;
  onLoadSuccess: () => void;
}
interface State {
  numPages: number;
}

export default class PdfDocument extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      numPages: 0,
    };
  }

  onDocumentLoadSuccess = ({ numPages }): void => {
    const { onLoadSuccess } = this.props;
    this.setState({ numPages });
    onLoadSuccess();
  };

  render(): React.ReactNode {
    const { pdfFile } = this.props;
    const { numPages } = this.state;
    return (
      <div className="pdf-document">
        <Document
          file={pdfFile}
          onLoadSuccess={this.onDocumentLoadSuccess}
          // нужно чтобы чекать выделение
          inputRef={(ref) => (this.containerRef.current = ref)}
          onMouseUp={this.onMouseUp}
        >
          <AutoSizer>
            {({ height, width }: any) => (
              <List
                width={width}
                rowCount={numPages}
                height={height}
                rowHeight={this.state.pageHeight}
                rowRenderer={this.rowRenderer}
                scrollToIndex={scrollToPage.value}
                overscanRowCount={1}
                ref={this.listRef}
              />
            )}
          </AutoSizer>
        </Document>
      </div>
    );
  }
}

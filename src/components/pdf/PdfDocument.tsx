import React, { Component } from 'react';
import { Document } from 'react-pdf/dist/esm/entry.webpack';

import { IPdfSelection } from '../../types/bookmark';
import { IPDFdata } from '../../types/pdf';
import PageContainer from './PageContainer';

interface Props {
  pdfFile?: IPDFdata;
  areaSelectionEnable: boolean;
  onLoadSuccess: () => void;
  setSelection: (selection: IPdfSelection) => void;
}
interface State {
  numPages: number;
}

export default class PdfDocument extends Component<Props, State> {
  private containerRef: React.RefObject<HTMLElement>;

  constructor(props: Props) {
    super(props);
    this.state = {
      numPages: 0,
    };
    this.containerRef = React.createRef();
  }

  setContainerRef = (ref: React.RefObject<HTMLElement>): void => {
    this.containerRef = ref;
  };

  onDocumentLoadSuccess = ({ numPages }): void => {
    const { onLoadSuccess } = this.props;
    this.setState({ numPages });
    onLoadSuccess();
  };

  onMouseUp = async (): Promise<void> => {
    const { areaSelectionEnable } = this.props;
    if (areaSelectionEnable) {
      const { setSelection } = this.props;

      if (this.containerRef.current === null) {
        return;
      }

      const selection = window.getSelection();

      if (!selection) return;

      if (selection?.toString() === '') {
        return;
      }

      const sel = selection.getRangeAt(0);

      const {
        commonAncestorContainer,
        endContainer,
        endOffset,
        startContainer,
        startOffset,
      } = sel;

      // Selection partially outside PDF document
      if (!this.containerRef.current.contains(commonAncestorContainer)) {
        return;
      }

      const startParenNode = startContainer?.parentNode as HTMLElement;
      const endParenNode = endContainer?.parentNode as HTMLElement;

      const startIdSplit = startParenNode.className.split(',');
      const endIdSplit = endParenNode.className.split(',');

      const start = parseInt(startIdSplit[1], 10) + startOffset;
      const startPage = parseInt(startIdSplit[0], 10);
      const end = parseInt(endIdSplit[1], 10) + endOffset;
      const endPage = parseInt(endIdSplit[0], 10);

      setSelection({
        startPage,
        startOffset: start,
        endPage,
        endOffset: end,
      });
    }
  };

  render(): React.ReactNode {
    const { pdfFile } = this.props;
    const { numPages } = this.state;
    return (
      <div className="pdf-document">
        <Document
          file={pdfFile}
          onLoadSuccess={this.onDocumentLoadSuccess}
          inputRef={this.setContainerRef}
          onMouseUp={this.onMouseUp}
        >
          <PageContainer />
        </Document>
      </div>
    );
  }
}

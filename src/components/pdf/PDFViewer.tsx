import './pdf.scss';
import * as React from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import { CircularProgress } from '@material-ui/core';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack';
import { StoreType } from '../../reduxStore/store';
import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import * as appConst from '../../types/textConstants';
import { IPDFdata } from '../../types/pdf';
import * as DOM from 'react-dom';
import { IBookmark } from '../../types/bookmark';
import { pdfRenderer, getTotalOffset } from '../../utils/pdfUtils';

export interface IPDFViewerProps {
  parentRef: React.RefObject<any>;
}
export interface IPDFViewerState {
  pdfData: IPDFdata | null;
  numPages: number;
  pageNumber: number;
  scale: number;
  startSelection: number;
  endSelection: number;
}

class PDFViewer extends React.Component<
  StatePropsType & DispatchPropsType,
  IPDFViewerState
> {
  private containerRef: React.RefObject<any>;
  private documentRef: React.RefObject<any>;

  constructor(props: StatePropsType & DispatchPropsType) {
    super(props);
    this.state = {
      pdfData: null,
      numPages: 0,
      pageNumber: 1,
      scale: 1.0,
      startSelection: Infinity,
      endSelection: Infinity,
    };
    this.containerRef = React.createRef();
    this.documentRef = React.createRef();
  }

  componentDidMount(): void {
    this.initListeners();
  }

  initListeners = (): void => {
    ipcRenderer.on(
      appConst.PDF_FILE_CONTENT_RESPONSE,
      (event, data: Uint8Array) => {
        this.setState({ pdfData: { data } });
      }
    );
  };

  calcScale = (page) => {
    const parent = this.props.parentRef.current;
    if (parent) {
      const pageScale = parent.clientWidth / page.originalWidth;
      if (this.state.scale !== pageScale) {
        this.setState({ scale: pageScale });
      }
    }
  };

  onPageLoad = async (page) => {
    this.removeTextLayerOffset();
    this.calcScale(page);
  };

  removeTextLayerOffset = () => {
    const textLayers = document.querySelectorAll(
      '.react-pdf__Page__textContent'
    );
    textLayers.forEach((layer) => {
      const { style } = layer;
      style.top = '0';
      style.left = '0';
      style.transform = '';
    });
  };

  onDocumentLoadSuccess = (document) => {
    const { numPages } = document;

    this.setState({ numPages });
    this.setState({ pageNumber: 1 });

    this.documentRef.current = document;
  };

  changePage = (offset) => {
    const { pageNumber } = this.state;
    this.setState({ pageNumber: pageNumber + offset });
  };

  previousPage = () => {
    this.changePage(-1);
  };

  nextPage = () => {
    this.changePage(1);
  };

  clearSelection = () => {
    this.setState({ startSelection: Infinity, endSelection: Infinity });
  };

  onMouseUp = async () => {
    if (
      this.containerRef.current === null ||
      this.documentRef.current === null
    ) {
      return;
    }

    const selection = window.getSelection();

    if (selection?.toString() === '') {
      return;
    }

    const {
      commonAncestorContainer,
      endContainer,
      endOffset,
      startContainer,
      startOffset,
    } = selection.getRangeAt(0);

    selection?.empty(); // important!

    // Selection partially outside PDF document
    if (!this.containerRef.current.contains(commonAncestorContainer)) {
      return;
    }

    const [startTotalOffset, endTotalOffset] = await Promise.all([
      getTotalOffset(startContainer, startOffset, this.documentRef),
      getTotalOffset(endContainer, endOffset, this.documentRef),
    ]);

    this.setState({
      startSelection: startTotalOffset,
      endSelection: endTotalOffset,
    });
  };

  onMouseDown = async () => {
    this.clearSelection();
  };

  render(): React.ReactElement {
    const { pdfPath } = this.props;
    const {
      pdfData,
      pageNumber,
      numPages,
      scale,
      startSelection,
      endSelection,
    } = this.state;
    return (
      <div className="pdf-viewer" ref={this.containerRef}>
        {pdfPath}
        <div>
          Start: {startSelection}, End: {endSelection}
        </div>
        <Document
          file={pdfData}
          onLoadSuccess={this.onDocumentLoadSuccess}
          inputRef={(ref) => (this.containerRef.current = ref)}
          onMouseUp={this.onMouseUp}
          onMouseDown={this.onMouseDown}
          loading={<CircularProgress size={'100px'} />}
        >
          <Page
            pageNumber={pageNumber}
            onLoadSuccess={this.onPageLoad}
            scale={scale}
            // renderTextLayer={false}
            // renderMode={'svg'}
            customTextRenderer={pdfRenderer(
              startSelection,
              endSelection,
              [] // bookmarks
            )}
          />
        </Document>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            width: '100%',
            padding: '10px',
          }}
        >
          Page {pageNumber || (numPages ? 1 : '--')} of {numPages || '--'}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            width: '100%',
            padding: '10px',
          }}
        >
          <button
            type="button"
            disabled={pageNumber <= 1}
            onClick={this.previousPage}
          >
            Previous
          </button>
          <button
            type="button"
            disabled={pageNumber >= numPages}
            onClick={this.nextPage}
          >
            Next
          </button>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = {
  setAppState: appStateActions.setAppState,
};

const mapStateToProps = (state: StoreType, ownProps: IPDFViewerProps) => {
  return {
    pdfPath: state.pdfViewer.pdfPath,
    parentRef: ownProps.parentRef,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(PDFViewer);

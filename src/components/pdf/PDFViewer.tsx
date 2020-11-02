import './pdf.scss';
import * as React from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import { CircularProgress } from '@material-ui/core';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack';
import { StoreType } from '../../reduxStore/store';
import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import { actions as pdfViewerActions } from '../../reduxStore/pdfViewerSlice';
import * as appConst from '../../types/textConstants';
import { IPDFdata } from '../../types/pdf';
import * as DOM from 'react-dom';
import { IBookmark, createBookmark } from '../../types/bookmark';
import { splitTriple, splitDuo } from '../../utils/splitUtils';

export interface IPDFViewerProps {
  parentRef: React.RefObject<any>;
}
export interface IPDFViewerState {
  pdfData: IPDFdata | null;
  numPages: number;
  scale: number;
}

class PDFViewer extends React.Component<
  StatePropsType & DispatchPropsType,
  IPDFViewerState
> {
  private containerRef: React.RefObject<any>;
  private documentRef: React.RefObject<any>;
  private newPatternWorkResult: boolean;
  private pagesOffsets: number[];

  constructor(props: StatePropsType & DispatchPropsType) {
    super(props);
    this.state = {
      pdfData: null,
      numPages: 0,
      scale: 1.0,
    };
    this.containerRef = React.createRef();
    this.documentRef = React.createRef();
    this.newPatternWorkResult = false;
    this.pagesOffsets = [];
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
    this.documentRef.current = document;

    this.pagesOffsets = [];
    for (let i = 0; i < numPages; i += 1) {
      this.getPageOffset(i + 1).then((pageOffset) =>
        this.pagesOffsets.push(pageOffset)
      );
    }
  };

  getItemOffset = async (pageNumber: number, itemIndex = Infinity) => {
    const page = await this.documentRef.current.getPage(pageNumber);
    const textContent = await page.getTextContent();
    // console.log('getItemOffset', itemIndex, textContent);
    return textContent.items
      .slice(0, itemIndex)
      .reduce((acc: number, item) => acc + item.str.length, 0);
  };

  // Calculates total length of all previous pages
  getPageOffset = async (pageNumber: number) => {
    const pageLengths = await Promise.all(
      Array.from({ length: pageNumber - 1 }, (_, index) =>
        this.getItemOffset(index + 1)
      )
    );
    return pageLengths.reduce((acc, pageLength) => acc + pageLength, 0);
  };

  getItemIndex = (item) => {
    let index = 0;
    while ((item = item.previousSibling) !== null) {
      index += 1;
    }
    return index;
  };

  getTotalOffset = async (container, offset) => {
    const textLayerItem = container.parentNode;
    const textLayer = textLayerItem.parentNode;
    const page = textLayer.parentNode;
    const pageNumber = parseInt(page.dataset.pageNumber, 10);
    const itemIndex = this.getItemIndex(textLayerItem);
    const [itemOffset] = await Promise.all([
      // this.getPageOffset(pageNumber),
      this.getItemOffset(pageNumber, itemIndex),
    ]);

    // console.log('getTotalOffset', pageOffset, itemOffset, offset);

    return this.pagesOffsets[pageNumber - 1] + itemOffset + offset;
  };

  getMarkedText = (text: string, color: string, key: any) => {
    return (
      <mark key={key} style={{ backgroundColor: color }}>
        {text}
      </mark>
    );
  };

  getUnmarkedText = (text: string, key: any) => {
    return <span key={key}>{text}</span>;
  };

  newPattern = (text, bookmark: IBookmark, counter) => {
    // console.log(counter, bookmark.start, bookmark.end, text);
    // let result = getUnmarkedText(text, counter);
    let result = text;
    let dbg = 'unmarked:';
    this.newPatternWorkResult = false;
    if (counter >= bookmark.start && counter + text.length <= bookmark.end) {
      // mark all text
      dbg = 'mark all text:';
      result = this.getMarkedText(text, bookmark.color, counter);
      this.newPatternWorkResult = true;
    } else if (counter >= bookmark.start && counter < bookmark.end) {
      // mark left part
      dbg = 'mark left part:';
      result = splitDuo(bookmark.end - counter)(text);
      result[0] = this.getMarkedText(result[0], bookmark.color, counter);
      this.newPatternWorkResult = true;
    } else if (
      counter + text.length > bookmark.start &&
      counter + text.length <= bookmark.end
    ) {
      // mark right part
      dbg = 'mark right part:';
      result = splitDuo(bookmark.start - counter)(text);
      result[1] = this.getMarkedText(result[1], bookmark.color, counter);
      this.newPatternWorkResult = true;
    } else if (
      counter < bookmark.start &&
      counter + text.length > bookmark.end
    ) {
      // mark middle
      dbg = 'mark middle:';
      result = splitTriple(
        bookmark.start - counter,
        bookmark.end - counter
      )(text);
      result[1] = this.getMarkedText(result[1], bookmark.color, counter);
      this.newPatternWorkResult = true;
    }
    // console.log(dbg, result);
    return result;
  };

  pdfRenderer = (
    pageNumber: number,
    start: number,
    end: number,
    bookmarks: IBookmark[]
  ) => {
    let counter = this.pagesOffsets[pageNumber - 1];
    // this is crunches. I don't know why renderer calls twice on the same textItem.
    // that cause counter wrong calculation.
    let prevTextItem = null;
    let prevPattern = null;
    return (textItem) => {
      if (prevTextItem === textItem) {
        return prevPattern;
      } else {
        // console.log('PDF renderer', start, end, textItem);
        prevTextItem = textItem;
        let pattern = '';
        if (textItem.str) {
          // just our new selection:
          pattern = this.newPattern(
            textItem.str,
            createBookmark('selection', start, end, 'black'),
            counter
          );
          // after executing newPattern() the newPatternWorkResult variable changed (or not) (yes, this is crunch)
          bookmarks.forEach((bookmark) => {
            if (!this.newPatternWorkResult)
              pattern = this.newPattern(textItem.str, bookmark, counter);
          });

          counter += textItem.str.length;
        }
        prevPattern = pattern;
        return pattern;
      }
    };
  };

  // changePage = (offset) => {
  //   const { pageNumber } = this.state;
  //   this.setState({ pageNumber: pageNumber + offset });
  // };

  // previousPage = () => {
  //   this.changePage(-1);
  // };

  // nextPage = () => {
  //   this.changePage(1);
  // };

  clearSelection = () => {
    const { setSelection } = this.props;
    setSelection({ start: Infinity, end: Infinity });
  };

  onMouseUp = async () => {
    const { setSelection } = this.props;

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

    const sel = selection.getRangeAt(0);
    // console.log(sel);

    const {
      commonAncestorContainer,
      endContainer,
      endOffset,
      startContainer,
      startOffset,
    } = sel; //selection.getRangeAt(0);

    selection?.empty(); // important!

    // Selection partially outside PDF document
    if (!this.containerRef.current.contains(commonAncestorContainer)) {
      return;
    }

    const [startTotalOffset, endTotalOffset] = await Promise.all([
      this.getTotalOffset(startContainer, startOffset),
      this.getTotalOffset(endContainer, endOffset),
    ]);

    setSelection({
      start: startTotalOffset,
      end: endTotalOffset,
    });
  };

  onMouseDown = async () => {
    this.clearSelection();
  };

  render(): React.ReactElement {
    const {
      currentPdf,
      pdfSelection,
      currentIndexes,
      currentProjectFile,
    } = this.props;
    const { pdfData, numPages, scale } = this.state;
    return (
      <div className="pdf-viewer" ref={this.containerRef}>
        {currentPdf.path}
        <div>
          Start: {pdfSelection.start}, End: {pdfSelection.end}
        </div>
        <Document
          file={pdfData}
          onLoadSuccess={this.onDocumentLoadSuccess}
          inputRef={(ref) => (this.containerRef.current = ref)}
          onMouseUp={this.onMouseUp}
          onMouseDown={this.onMouseDown}
          loading={<CircularProgress size={'100px'} />}
        >
          {Array.from(new Array(numPages), (el, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              onLoadSuccess={this.onPageLoad}
              scale={scale}
              // renderTextLayer={false}
              // renderMode={'svg'}
              customTextRenderer={this.pdfRenderer(
                index + 1,
                pdfSelection.start,
                pdfSelection.end,
                currentProjectFile.content.events[currentIndexes.eventIndex]
                  ?.files[currentIndexes.fileIndex]?.bookmarks
              )}
            />
          ))}
        </Document>
        {/* <div
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
        </div> */}
      </div>
    );
  }
}

const mapDispatchToProps = {
  setAppState: appStateActions.setAppState,
  setSelection: pdfViewerActions.setSelection,
};

const mapStateToProps = (state: StoreType, ownProps: IPDFViewerProps) => {
  return {
    currentPdf: state.projectFile.currentPdf,
    pdfSelection: state.pdfViewer.pdfSelection,
    parentRef: ownProps.parentRef,
    currentProjectFile: state.projectFile.currentProjectFile,
    currentIndexes: state.projectFile.currentIndexes,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(PDFViewer);

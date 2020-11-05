import './pdf.scss';
import * as React from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
// import { CircularProgress } from '@material-ui/core';
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
  pagesRendered: any;
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
      pagesRendered: null,
    };
    this.containerRef = React.createRef();
    this.documentRef = React.createRef();
    this.newPatternWorkResult = false;
    this.pagesOffsets = [];
  }

  componentDidMount(): void {
    ipcRenderer.on(
      appConst.PDF_FILE_CONTENT_RESPONSE,
      (event, data: Uint8Array) => {
        this.setState({ pdfData: { data } });
      }
    );
  }

  // shouldComponentUpdate()

  calcScale = (page) => {
    const parent = this.props.parentRef.current;
    if (parent) {
      const pageScale = (parent.clientWidth * 0.984) / page.originalWidth;
      if (this.state.scale !== pageScale) {
        this.setState({ scale: pageScale });
      }
    }
  };

  onPageLoad = async (page) => {
    console.log('page loaded');
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

  calcPageOffsets = (numPages) => {
    this.pagesOffsets = [];
    for (let i = 0; i < numPages; i += 1) {
      this.getPageOffset(i + 1).then((pageOffset) =>
        this.pagesOffsets.push(pageOffset)
      );
    }
  };

  onDocumentLoadSuccess = (document) => {
    const { numPages } = document;
    this.setState({ numPages, pagesRendered: 0 });
    this.documentRef.current = document;
    this.calcPageOffsets(numPages);
  };

  onRenderSuccess = () => {
    console.log('onRenderSuccess');
    this.setState((prevState) => ({
      pagesRendered: prevState.pagesRendered + 1,
    }));
  };

  onRenderFinished = (pageNumber: number) => {
    const { numPages } = this.state;
    const { setPdfLoading } = this.props;
    if (pageNumber === numPages) setPdfLoading(false);
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
    const textLayerItem = container.parentNode.parentNode;
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
      <mark key={key} style={{ color, backgroundColor: color }}>
        {text}
      </mark>
    );
  };

  getUnmarkedText = (text: string, key: any) => {
    return <span key={key}>{text}</span>;
  };

  newPattern = (text: string, bookmark: IBookmark, counter: number) => {
    // console.log(counter, bookmark.start, bookmark.end, text);
    let result = this.getUnmarkedText(text, '0k' + counter);
    // let result = text;
    let dbg = 'unmarked:';
    const { length } = text;
    if (counter >= bookmark.start && counter + length <= bookmark.end) {
      // mark all text
      dbg = 'mark all text:';
      result = this.getMarkedText(text, bookmark.color, counter);
      this.newPatternWorkResult = true;
    } else if (counter >= bookmark.start && counter < bookmark.end) {
      // mark left part
      dbg = 'mark left part:';
      result = splitDuo(bookmark.end - counter)(text);
      result[0] = this.getMarkedText(result[0], bookmark.color, '0k' + counter);
      result[1] = this.getUnmarkedText(result[1], '1k' + counter);
      this.newPatternWorkResult = true;
    } else if (
      counter + length > bookmark.start &&
      counter + length <= bookmark.end
    ) {
      // mark right part
      dbg = 'mark right part:';
      result = splitDuo(bookmark.start - counter)(text);
      result[0] = this.getUnmarkedText(result[0], '0k' + counter);
      result[1] = this.getMarkedText(result[1], bookmark.color, '1k' + counter);
      this.newPatternWorkResult = true;
    } else if (counter < bookmark.start && counter + length > bookmark.end) {
      // mark middle
      dbg = 'mark middle:';
      result = splitTriple(
        bookmark.start - counter,
        bookmark.end - counter
      )(text);
      result[0] = this.getUnmarkedText(result[0], '0k' + counter);
      result[1] = this.getMarkedText(result[1], bookmark.color, '1k' + counter);
      result[2] = this.getUnmarkedText(result[2], '2k' + counter);
      this.newPatternWorkResult = true;
    }
    // console.log(dbg, result);
    return result;
  };

  pdfRenderer = (pageNumber: number) => {
    const { currentIndexes, currentProjectFile } = this.props;
    // const { numPages } = this.state;

    const bookmarks =
      currentProjectFile.content.events[currentIndexes.eventIndex]?.files[
        currentIndexes.fileIndex
      ]?.bookmarks;

    let counter = this.pagesOffsets[pageNumber - 1];
    // this is crunches. I don't know why renderer calls twice on the same textItem.
    // that cause counter wrong calculation.
    let prevTextItem = null;
    // let prevPattern = null;
    console.log('%c%s', 'color: lime; font: 1.2rem/1 Tahoma;', 'PDF_RENDERER');
    return (textItem) => {
      if (prevTextItem !== textItem) {
        //   console.log('prev');
        //   return prevPattern;
        // } else {
        prevTextItem = textItem;
        let pattern = '';
        if (textItem.str) {
          this.newPatternWorkResult = false;
          if (bookmarks.length > 0) {
            let index = 0;
            while (!this.newPatternWorkResult && index < bookmarks.length) {
              pattern = this.newPattern(
                textItem.str,
                bookmarks[index],
                counter
              );
              index += 1;
            }
          } else {
            pattern = this.getUnmarkedText(textItem.str, '0k' + counter);
          }
          counter += textItem.str.length;
        }
        // prevPattern = pattern;
        return pattern;
      }
    };
  };

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

    // selection?.empty(); // important!

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
    const { currentPdf, pdfLoading } = this.props;
    const { pdfData, numPages, pagesRendered, scale } = this.state;

    /**
     * The amount of pages we want to render now. Always 1 more than already rendered,
     * no more than total amount of pages in the document.
     */
    // const pagesRenderedPlusOne = Math.min(pagesRendered + 1, numPages);

    return (
      <div className="pdf-viewer" ref={this.containerRef}>
        {currentPdf.path}
        {pdfLoading ? (
          <div className="loading-container">
            {/* <CircularProgress size={'200px'} /> */}
            <img src="./public/loading.gif" alt="Loading..." />
          </div>
        ) : null}
        {pdfData ? (
          <Document
            file={pdfData}
            onLoadSuccess={this.onDocumentLoadSuccess}
            inputRef={(ref) => (this.containerRef.current = ref)}
            onMouseUp={this.onMouseUp}
            // onMouseDown={this.onMouseDown}
          >
            {Array.from(new Array(numPages), (el, index) => {
              // const isCurrentlyRendering = pagesRenderedPlusOne === index + 1;
              // const isLastPage = numPages === index + 1;
              // const needsCallbackToRenderNextPage =
              //   isCurrentlyRendering && !isLastPage;

              return (
                <Page
                  key={`page_${index + 1}`}
                  // onRenderSuccess={
                  //   needsCallbackToRenderNextPage ? this.onRenderSuccess : null
                  // }
                  scale={scale}
                  pageNumber={index + 1}
                  onLoadSuccess={this.onPageLoad}
                  customTextRenderer={this.pdfRenderer(index + 1)}
                  onGetTextSuccess={() => {
                    this.onRenderFinished(index + 1);
                  }}
                />
              );
            })}
          </Document>
        ) : null}
      </div>
    );
  }
}

const mapDispatchToProps = {
  setAppState: appStateActions.setAppState,
  setSelection: pdfViewerActions.setSelection,
  setPdfLoading: appStateActions.setPdfLoading,
};

const mapStateToProps = (state: StoreType, ownProps: IPDFViewerProps) => {
  return {
    currentPdf: state.projectFile.currentPdf,
    // pdfSelection: state.pdfViewer.pdfSelection,
    parentRef: ownProps.parentRef,
    currentProjectFile: state.projectFile.currentProjectFile,
    currentIndexes: state.projectFile.currentIndexes,
    pdfLoading: state.appState.pdfLoading,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(PDFViewer);

/* eslint-disable */
import './pdf.scss';
import * as pathLib from 'path';
import * as React from 'react';
import electron, { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import { List, AutoSizer } from 'react-virtualized';
import Measure from 'react-measure';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack';
import { StoreType } from '../../reduxStore/store';
import { actions as projectFileActions } from '../../reduxStore/projectFileSlice';
import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import { actions as pdfViewerActions } from '../../reduxStore/pdfViewerSlice';
import * as appConst from '../../types/textConstants';
import { IPDFdata } from '../../types/pdf';
import { PdfToolBar } from './PdfToolBar';
import AreaSelection from './AreaSelection';

export interface IPDFViewerProps {
  parentRef: React.RefObject<any>;
  needForceUpdate: boolean;
}
export interface IPDFViewerState {
  pdfData: IPDFdata | null;
  numPages: number;
  currentPage: number;
  scale: number;
  renderTextLayer: boolean;
  pdfDocWidth: number;
  searchPattern: string | null;
  currentSearchResNum: number;
  totalSearchResCount: number;
  displayedPdfName: string;
  pageWidth: number;
  pageHeight: number;
}

class PDFViewer extends React.Component<StatePropsType & DispatchPropsType, IPDFViewerState> {
  private containerRef: React.RefObject<any>;
  private documentRef: React.RefObject<any>;
  private searchRef: React.RefObject<any>;
  private listRef: React.RefObject<any>;
  private pagesRendered: number;
  private pageText: string[];
  private _totalSearchResCount: number;
  private textLayerZIndex: number;

  constructor(props: StatePropsType & DispatchPropsType) {
    super(props);
    this.state = {
      pdfData: null,
      numPages: 0,
      currentPage: 1,
      scale: 1.0,
      renderTextLayer: false,
      pdfDocWidth: 1000,
      searchPattern: null,
      currentSearchResNum: 0,
      totalSearchResCount: 0,
      displayedPdfName: '',
      pageWidth: 100,
      pageHeight: 100,
    };
    this.containerRef = React.createRef();
    this.documentRef = React.createRef();
    this.searchRef = React.createRef();
    this.listRef = React.createRef();
    this.pagesRendered = 0;
    this.pageText = [];
    this._totalSearchResCount = 0;
    this.textLayerZIndex = 5;
  }

  checkForceUpdate() {
    if (this.props.needForceUpdate === true) {
      this.listRef.current?.forceUpdateGrid();
      this.props.setNeedForceUpdate(false);
    }
  }

  componentDidMount(): void {
    ipcRenderer.on(appConst.PDF_FILE_CONTENT_RESPONSE, (event, payload) => {
      const { data, path, external } = payload;
      const { setCurrentPdf, setAppState } = this.props;
      this.setState({
        renderTextLayer: false,
        pdfData: { data },
        displayedPdfName: pathLib.basename(path),
      });
      if (external) {
        setCurrentPdf({ path, eventID: '' });
      }
    });
  }

  componentDidUpdate(prevProps) {
    this.checkForceUpdate();
  }

  onPageLoad = async (page) => {
    this.removeTextLayerOffset();
  };

  removeTextLayerOffset = () => {
    const textLayers = document.querySelectorAll('.react-pdf__Page__textContent');
    textLayers.forEach((layer) => {
      const { style } = layer;
      style.zIndex = this.textLayerZIndex;
    });
  };

  onDocumentLoadSuccess = (document) => {
    const { numPages } = document;
    this.pageText = new Array(numPages).fill('');
    this.setState({ numPages });
    this.documentRef.current = document;
    this.props.setCurrentSelection(null);
    this.props.disableAreaSelection();
  };

  onRenderFinished = (pageNumber: number) => {
    const { numPages } = this.state;
    const { setShowLoading } = this.props;
    this.pagesRendered += 1;
    if (this.pagesRendered === numPages) {
      setShowLoading(false);
    }
    // Updates area-selection layer after pdf loading
    this.listRef.current?.forceUpdateGrid();
  };

  selectAllMatches = () => {
    const searchPattern = this.searchRef.current.value;
    let matchIndex = -1;
    matchIndex = this.pageText[0].indexOf(searchPattern);
    const selection = window.getSelection();
    selection?.removeAllRanges();

    const range = new Range();
    const qwe = document.getElementsByClassName('1,2674,0');
    range.setStart(qwe[0], 0);
    range.setEnd(qwe[0], 1);
    selection?.addRange(range);
  };

  getMarkedText = (text: string, color: string, key: any, id: string) => {
    return (
      <mark className={key} key={key} id={id} style={{ color, backgroundColor: color }}>
        {text}
      </mark>
    );
  };

  getUnmarkedText = (text: string, key: any) => {
    return (
      <span className={key} key={key}>
        {text}
      </span>
    );
  };

  newPattern = (text: string, bookmarks: any[], pageNumber: number, counter: number) => {
    const result = [];
    const textEnd = counter + text.length;
    let current = counter;
    let index = 0;
    for (const bookmark of bookmarks) {
      if (bookmark.end < current) {
        continue;
      }

      if (bookmark.start > current) {
        result.push(
          this.getUnmarkedText(
            text.slice(current - counter, bookmark.start - counter),
            `${pageNumber},${current},${index++}`
          )
        );
        current = Math.min(bookmark.start, textEnd);
      }

      if (bookmark.start <= current) {
        const start = Math.max(bookmark.start, current);
        const end = Math.min(bookmark.end, textEnd);
        const t = text.slice(start - counter, end - counter);
        if (t !== '')
          result.push(this.getMarkedText(t, bookmark.color, `${pageNumber},${current},${index++}`, `${bookmark.id}`));
        current = end;
      }

      if (current === textEnd) {
        break;
      }
    }

    if (current < textEnd) {
      result.push(
        this.getUnmarkedText(text.slice(current - counter, text.length), `${pageNumber},${current},${index++}`)
      );
    }

    return result;
  };

  highlightPattern = (text: string, pattern: string) => {
    const splitText = text.toLowerCase().split(pattern);

    if (splitText.length <= 1) {
      return text;
    }

    const tmp = splitText.map((item, index) => {
      if (index == splitText.length - 1) return item;
      else {
        this._totalSearchResCount += 1;
        this.setState({ totalSearchResCount: this._totalSearchResCount });
        return [item, this.getMarkedText(pattern, 'blue', this._totalSearchResCount, `sr${this._totalSearchResCount}`)];
      }
    });

    return tmp;
  };

  pdfRenderer = (pageNumber: number) => {
    let textLenCounter = 0;
    let indexCounter = 0;
    const { currentIndexes, currentProjectFile } = this.props;

    const allBookmarks =
      currentProjectFile.content.events[currentIndexes.eventIndex]?.files[currentIndexes.fileIndex]?.bookmarks;

    const bookmarksFiltered = allBookmarks?.filter(
      (v) => !v.isAreaSelection && v.selection.startPage <= pageNumber && v.selection.endPage >= pageNumber
    );

    const bookmarksSorted = bookmarksFiltered
      ?.map((v) => {
        let start = v.selection.startOffset;
        let end = v.selection.endOffset;
        if (pageNumber > v.selection.startPage) {
          start = 0;
        }
        if (pageNumber < v.selection.endPage) {
          end = Infinity;
        }
        return { start, end, color: v.color, id: v.id };
      })
      .sort((a, b) => a.start - b.start);

    // this is crunches. I don't know why renderer calls twice on the same textItem.
    let prevTextItem = null;
    return (textItem) => {
      if (prevTextItem !== textItem) {
        prevTextItem = textItem;
        let pattern = '';
        if (textItem.str) {
          this.pageText[pageNumber - 1] += textItem.str;
          const { searchPattern } = this.state;
          if (searchPattern) {
            pattern = this.highlightPattern(textItem.str, searchPattern);
          } else {
            if (bookmarksSorted?.length > 0) {
              pattern = this.newPattern(textItem.str, bookmarksSorted, pageNumber, textLenCounter);
            } else {
              pattern = this.getUnmarkedText(textItem.str, `${pageNumber},${textLenCounter},0`);
            }
          }
          textLenCounter += textItem.str.length;
          indexCounter += 1;
        }
        return pattern;
      }
    };
  };

  onMouseUp = async () => {
    if (!this.props.areaSelectionEnable.value) {
      const { setSelection } = this.props;

      if (this.containerRef.current === null || this.documentRef.current === null) {
        return;
      }

      const selection = window.getSelection();

      if (selection?.toString() === '') {
        return;
      }

      const sel = selection.getRangeAt(0);
      const { commonAncestorContainer, endContainer, endOffset, startContainer, startOffset } = sel;

      // Selection partially outside PDF document
      if (!this.containerRef.current.contains(commonAncestorContainer)) {
        return;
      }

      const startIdSplit = startContainer?.parentNode?.className.split(',');
      const endIdSplit = endContainer?.parentNode?.className.split(',');

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

  handlePdfPageResize = (index) => (contentRect) => {
    // TODO: condition is a crunch
    if (index === 0 && contentRect?.bounds?.height > 50)
      this.setState({
        pageHeight: contentRect?.bounds?.height,
        pageWidth: contentRect?.bounds?.width,
      });
  };

  rowRenderer = ({ key, index, isScrolling, isVisible, style, parent }: any) => {
    const { scale } = this.state;
    if (isVisible) this.setState({ currentPage: index + 1 });

    const { currentIndexes, currentProjectFile } = this.props;

    const allBookmarks =
      currentProjectFile.content.events[currentIndexes.eventIndex]?.files[currentIndexes.fileIndex]?.bookmarks;

    const bookmarksFiltered = allBookmarks?.filter((v) => v.isAreaSelection && v.selection.page === index + 1);

    return (
      <div key={key} style={style}>
        <div className="pdf-page" key={`page_${index + 1}_${key}`}>
          <AreaSelection
            key={`as${index + 1}_${key}`}
            width={this.state.pageWidth}
            height={this.state.pageHeight}
            page={index + 1}
            bookmarks={bookmarksFiltered}
          />
          <Measure bounds onResize={this.handlePdfPageResize(index)}>
            {({ measureRef }) => (
              <div ref={measureRef}>
                <Page
                  scale={scale}
                  pageNumber={index + 1}
                  onLoadSuccess={this.onPageLoad}
                  customTextRenderer={this.pdfRenderer(index + 1)}
                  // renderTextLayer={renderTextLayer}
                  onGetTextSuccess={() => {
                    this.onRenderFinished(index + 1);
                  }}
                />
              </div>
            )}
          </Measure>
        </div>
      </div>
    );
  };

  setPageNumber = (pageNumber: number) => {
    const { setScrollToPage } = this.props;
    this.setState({ currentPage: pageNumber });
    setScrollToPage({ value: pageNumber - 1 });
  };

  onPrint = () => {
    const { currentPdf } = this.props;
    const { pdfData } = this.state;
    ipcRenderer.send(appConst.PRINT_PDF_FILE, currentPdf.path);
  };

  prevSearchRes = () => {
    const { currentSearchResNum } = this.state;
    if (currentSearchResNum > 1) {
      this.setState({
        currentSearchResNum: currentSearchResNum - 1,
      });
    }
  };

  nextSearchRes = () => {
    const { currentSearchResNum, totalSearchResCount } = this.state;
    if (currentSearchResNum < totalSearchResCount) {
      this.setState({
        currentSearchResNum: currentSearchResNum + 1,
      });
      // TODO:
      // setScrollToPage({ value: page_number });
      // document.getElementById(element_id).scrollIntoView();
    }
  };

  onAreaSelectionToggle = () => {
    const textLayers = document.querySelectorAll('.react-pdf__Page__textContent');
    this.textLayerZIndex = this.props.areaSelectionEnable.value ? 5 : 1;
    if (this.props.areaSelectionEnable) {
      this.props.setCurrentSelection(null);
    }
    this.props.toggleAreaSelectionEnable();
    textLayers.forEach((layer) => {
      const { style } = layer;
      style.zIndex = this.textLayerZIndex;
    });
    this.props.setNeedForceUpdate(true);
  };

  render(): React.ReactElement {
    const { pdfLoading, scrollToPage } = this.props;
    const { pdfData, numPages, currentPage, currentSearchResNum, totalSearchResCount, displayedPdfName } = this.state;
    this.pagesRendered = 0;
    return (
      <div className="pdf-viewer" ref={this.containerRef} style={{ width: '100%' }}>
        <PdfToolBar
          pdfName={displayedPdfName}
          onSetPattern={(searchPattern: string) => {
            this._totalSearchResCount = 0;
            this.setState({
              searchPattern,
              totalSearchResCount: 0,
              currentSearchResNum: 0,
            });
          }}
          prevSearchRes={this.prevSearchRes}
          nextSearchRes={this.nextSearchRes}
          currentSearchResNum={currentSearchResNum}
          totalSearchResCount={totalSearchResCount}
          onSetScale={(scale: number) => {
            this.setState({ scale });
          }}
          onSetPageNumber={this.setPageNumber}
          numPages={numPages}
          currentPage={currentPage}
          onPrint={this.onPrint}
          onAreaSelectionToggle={this.onAreaSelectionToggle}
          areaSelectionEnable={this.props.areaSelectionEnable.value}
        />
        {pdfData ? (
          <div className="pdf-document">
            <Document
              file={pdfData}
              onLoadSuccess={this.onDocumentLoadSuccess}
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
        ) : null}
      </div>
    );
  }
}

const mapDispatchToProps = {
  setCurrentPdf: projectFileActions.setCurrentPdf,
  setAppState: appStateActions.setAppState,
  setSelection: pdfViewerActions.setSelection,
  setShowLoading: appStateActions.setShowLoading,
  setScrollToPage: pdfViewerActions.setScrollToPage,
  toggleAreaSelectionEnable: pdfViewerActions.toggleAreaSelectionEnable,
  disableAreaSelection: pdfViewerActions.disableAreaSelection,
  setCurrentSelection: pdfViewerActions.setAreaSelection,
  setNeedForceUpdate: pdfViewerActions.setNeedForceUpdate,
};

const mapStateToProps = (state: StoreType, ownProps: IPDFViewerProps) => {
  return {
    currentPdf: state.projectFile.currentPdf,
    parentRef: ownProps.parentRef,
    needForceUpdate: ownProps.needForceUpdate,
    currentProjectFile: state.projectFile.currentProjectFile,
    currentIndexes: state.projectFile.currentIndexes,
    pdfLoading: state.appState.showLoading,
    scrollToPage: state.pdfViewer.scrollToPage,
    areaSelectionEnable: state.pdfViewer.areaSelectionEnable,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(PDFViewer);

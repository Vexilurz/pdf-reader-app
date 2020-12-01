/* eslint-disable */
import './pdf.scss';
import * as pathLib from 'path';
import * as React from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import { List } from 'react-virtualized';
import Measure from 'react-measure';
// import { CircularProgress } from '@material-ui/core';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack';
import { StoreType } from '../../reduxStore/store';
import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import { actions as pdfViewerActions } from '../../reduxStore/pdfViewerSlice';
import * as appConst from '../../types/textConstants';
import { IPDFdata } from '../../types/pdf';
import * as DOM from 'react-dom';
import {
  IBookmark,
  getInfSelection,
  getBookmarkPage,
  getBookmarkPageOffset,
} from '../../types/bookmark';
import { splitTriple, splitDuo } from '../../utils/splitUtils';
import { TextItem, ITextItemChunk } from './TextItem';

// interface IChunks {
//   chunks: ITextItemChunk[];
// }
// interface IChunksArray {
//   textItemArray: IChunks[];
// }

export interface IPDFViewerProps {
  parentRef: React.RefObject<any>;
}
export interface IPDFViewerState {
  pdfData: IPDFdata | null;
  numPages: number;
  scale: number;
  renderTextLayer: boolean;
  pdfDocWidth: number;
  searchPattern: string | null;
  // pageChunks: IChunksArray[];
}

class PDFViewer extends React.Component<
  StatePropsType & DispatchPropsType,
  IPDFViewerState
> {
  private containerRef: React.RefObject<any>;
  private documentRef: React.RefObject<any>;
  private searchRef: React.RefObject<any>;
  // private _pageChunks: IChunksArray[];
  private pagesRendered: number;
  private pageText: string[];

  constructor(props: StatePropsType & DispatchPropsType) {
    super(props);
    this.state = {
      pdfData: null,
      numPages: 0,
      scale: 1.0,
      renderTextLayer: false,
      pdfDocWidth: 1000,
      searchPattern: null,
      // pageChunks: [],
    };
    this.containerRef = React.createRef();
    this.documentRef = React.createRef();
    this.searchRef = React.createRef();
    // this._pageChunks = [];
    this.pagesRendered = 0;
    this.pageText = [];
  }

  componentDidMount(): void {
    ipcRenderer.on(
      appConst.PDF_FILE_CONTENT_RESPONSE,
      (event, data: Uint8Array) => {
        this.setState({ renderTextLayer: false, pdfData: { data } });
      }
    );
  }

  // calcScale = (page) => {
  //   const parent = this.props.parentRef.current;
  //   if (parent) {
  //     const pageScale = (parent.clientWidth * 0.984) / page.originalWidth;
  //     if (this.state.scale !== pageScale) {
  //       this.setState({ scale: pageScale });
  //     }
  //   }
  // };

  onPageLoad = async (page) => {
    this.removeTextLayerOffset();
    // this.calcScale(page);
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
    // this._pageChunks = new Array(numPages + 1).fill({
    //   textItemArray: [],
    // });
    this.pageText = new Array(numPages).fill('');
    this.setState({ numPages });
    this.documentRef.current = document;
    // this.calcPageOffsets(numPages);
  };

  onRenderFinished = (pageNumber: number) => {
    const { numPages } = this.state;
    const { setShowLoading } = this.props;
    this.pagesRendered += 1;
    if (this.pagesRendered === numPages) {
      setShowLoading(false);
      // this.setState({ pageChunks: [...this._pageChunks] });
    }
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
      <mark
        className={key}
        key={key}
        id={id}
        style={{ color, backgroundColor: color }}
      >
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

  newPattern = (
    text: string,
    bookmarks: any[],
    pageNumber: number,
    counter: number
  ) => {
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
        result.push(
          this.getMarkedText(
            text.slice(start - counter, end - counter),
            bookmark.color,
            `${pageNumber},${current},${index++}`,
            `${bookmark.id}`
          )
        );
        current = end;
      }

      if (current === textEnd) {
        break;
      }
    }

    if (current < textEnd) {
      result.push(
        this.getUnmarkedText(
          text.slice(current - counter, text.length),
          `${pageNumber},${current},${index++}`
        )
      );
    }

    return result;
  };

  highlightPattern = (text, pattern) => {
    const splitText = text.split(pattern);

    if (splitText.length <= 1) {
      return text;
    }

    const matches = text.match(pattern);

    const tmp = splitText.reduce(
      (arr, element, index) =>
        matches[index]
          ? [
              ...arr,
              element,
              <mark key={index} style={{ backgroundColor: 'blue' }}>
                {matches[index]}
              </mark>,
            ]
          : [...arr, element],
      []
    );
    return tmp;
  };

  pdfRenderer = (pageNumber: number) => {
    let textLenCounter = 0;
    let indexCounter = 0;
    const { currentIndexes, currentProjectFile } = this.props;

    const allBookmarks =
      currentProjectFile.content.events[currentIndexes.eventIndex]?.files[
        currentIndexes.fileIndex
      ]?.bookmarks;

    const bookmarksFiltered = allBookmarks.filter(
      (v) =>
        v.selection.startPage <= pageNumber && v.selection.endPage >= pageNumber
    );

    const bookmarksSorted = bookmarksFiltered
      .map((v) => {
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

    // console.log(
    //   '%c%s',
    //   'color: lime; font: 1.2rem/1 Tahoma;',
    //   'PDF_RENDERER',
    //   pageNumber
    // );

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
              pattern = this.newPattern(
                textItem.str,
                bookmarksSorted,
                pageNumber,
                textLenCounter
              );
            } else {
              pattern = this.getUnmarkedText(
                textItem.str,
                `${pageNumber},${textLenCounter},0`
              );
            }
            // this._pageChunks[pageNumber].textItemArray.push({
            //   chunks: [
            //     {
            //       className: `${pageNumber},${textLenCounter}`,
            //       text: textItem.str,
            //       id: null,
            //       color: 'red',
            //     },
            //   ],
            // });
            // pattern = (
            //   <TextItem
            //     chunks={
            //       this.state.pageChunks[pageNumber]?.textItemArray[indexCounter]
            //         ?.chunks
            //     }
            //   />
            // );
          }
          textLenCounter += textItem.str.length;
          indexCounter += 1;
        }
        return pattern;
      }
    };
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
  };

  handlePdfDocResize = (contentRect) => {
    this.setState({ pdfDocWidth: contentRect?.bounds?.width });
  };

  rowRenderer = ({
    key,
    index,
    isScrolling,
    isVisible,
    style,
    parent,
  }: any) => {
    // console.log(`Rendered ${key} ${index}`);
    return (
      <div key={key} style={style}>
        <div className="pdf-page" key={`page_${index + 1}_${key}`}>
          <Page
            // onRenderSuccess={}
            scale={1.3}
            // scale={scale}
            pageNumber={index + 1}
            onLoadSuccess={this.onPageLoad}
            customTextRenderer={this.pdfRenderer(index + 1)}
            // renderTextLayer={renderTextLayer}
            onGetTextSuccess={() => {
              this.onRenderFinished(index + 1);
            }}
          />
        </div>
      </div>
    );
  };

  render(): React.ReactElement {
    const { currentPdf, pdfLoading } = this.props;
    const {
      pdfData,
      numPages,
      // scale,
      // renderTextLayer,
      pdfDocWidth,
    } = this.state;
    this.pagesRendered = 0;
    return (
      <div
        className="pdf-viewer"
        ref={this.containerRef}
        style={{ width: pdfDocWidth }}
      >
        {pathLib.basename(currentPdf.path)}
        <div className="pdf-search">
          <label htmlFor="search">{`Search:  `}</label>
          <input
            type="search"
            id="search-input"
            className="search-input"
            ref={this.searchRef}
          />
          <button
            type="button"
            className="search-button btn btn-primary"
            onClick={() => {
              this.setState({ searchPattern: this.searchRef.current.value });
              // this.selectAllMatches();
            }}
          >
            Search
          </button>
          <button
            type="button"
            className="clear-search-button btn btn-primary"
            onClick={() => {
              this.searchRef.current.value = '';
              this.setState({ searchPattern: '' });
              // this.selectAllMatches();
            }}
          >
            Clear
          </button>
        </div>
        {pdfLoading && false ? (
          <div className="loading-container">
            <img src="./public/loading.gif" alt="Loading..." />
          </div>
        ) : null}
        {pdfData ? (
          <Measure bounds onResize={this.handlePdfDocResize}>
            {({ measureRef }) => (
              <div className="pdf-document" ref={measureRef}>
                <Document
                  file={pdfData}
                  onLoadSuccess={this.onDocumentLoadSuccess}
                  inputRef={(ref) => (this.containerRef.current = ref)}
                  onMouseUp={this.onMouseUp}
                >
                  <List
                    width={this.state.pdfDocWidth}
                    height={600}
                    rowCount={numPages}
                    rowHeight={1100}
                    rowRenderer={this.rowRenderer}
                    // scrollToIndex={312}
                  />
                </Document>
              </div>
            )}
          </Measure>
        ) : null}
      </div>
    );
  }
}

const mapDispatchToProps = {
  setAppState: appStateActions.setAppState,
  setSelection: pdfViewerActions.setSelection,
  setShowLoading: appStateActions.setShowLoading,
};

const mapStateToProps = (state: StoreType, ownProps: IPDFViewerProps) => {
  return {
    currentPdf: state.projectFile.currentPdf,
    parentRef: ownProps.parentRef,
    currentProjectFile: state.projectFile.currentProjectFile,
    currentIndexes: state.projectFile.currentIndexes,
    pdfLoading: state.appState.showLoading,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(PDFViewer);

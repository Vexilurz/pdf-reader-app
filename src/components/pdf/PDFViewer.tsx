/* eslint-disable */
import './pdf.scss';
import * as pathLib from 'path';
import * as React from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import { List, AutoSizer } from 'react-virtualized';
import Measure from 'react-measure';
// import { CircularProgress } from '@material-ui/core';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack';
import { StoreType } from '../../reduxStore/store';
import { actions as projectFileActions } from '../../reduxStore/projectFileSlice';
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
import { PdfToolBar } from './PdfToolBar';
import printJS from 'print-js';

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
  currentPage: number;
  scale: number;
  renderTextLayer: boolean;
  pdfDocWidth: number;
  searchPattern: string | null;
  // pageChunks: IChunksArray[];
  currentSearchResNum: number;
  totalSearchResCount: number;
  displayedPdfName: string;
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
  private _totalSearchResCount: number;

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
      // pageChunks: [],
    };
    this.containerRef = React.createRef();
    this.documentRef = React.createRef();
    this.searchRef = React.createRef();
    // this._pageChunks = [];
    this.pagesRendered = 0;
    this.pageText = [];
    this._totalSearchResCount = 0;
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
        // setAppState(appConst.PDF_VIEWER);
      }
    });
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
      style.margin = '0 auto';
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
        return [
          item,
          this.getMarkedText(
            pattern,
            'blue',
            this._totalSearchResCount,
            `sr${this._totalSearchResCount}`
          ),
        ];
      }
    });

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

    const bookmarksFiltered = allBookmarks?.filter(
      (v) =>
        v.selection.startPage <= pageNumber && v.selection.endPage >= pageNumber
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
    const { scale } = this.state;
    if (isVisible) this.setState({ currentPage: index + 1 });
    return (
      <div key={key} style={style}>
        <div className="pdf-page" key={`page_${index + 1}_${key}`}>
          <Page
            // onRenderSuccess={}
            // scale={1.3}
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
    // const decoder = new TextDecoder('utf8');
    // const b64encoded = btoa(decoder.decode(pdfData?.data));

    // const data =
    //   'JVBERi0xLjMNCiXi48/TDQoNCjEgMCBvYmoNCjw8DQovVHlwZSAvQ2F0YWxvZw0KL091dGxpbmVzIDIgMCBSDQovUGFnZXMgMyAwIFINCj4+DQplbmRvYmoNCg0KMiAwIG9iag0KPDwNCi9UeXBlIC9PdXRsaW5lcw0KL0NvdW50IDANCj4+DQplbmRvYmoNCg0KMyAwIG9iag0KPDwNCi9UeXBlIC9QYWdlcw0KL0NvdW50IDINCi9LaWRzIFsgNCAwIFIgNiAwIFIgXSANCj4+DQplbmRvYmoNCg0KNCAwIG9iag0KPDwNCi9UeXBlIC9QYWdlDQovUGFyZW50IDMgMCBSDQovUmVzb3VyY2VzIDw8DQovRm9udCA8PA0KL0YxIDkgMCBSIA0KPj4NCi9Qcm9jU2V0IDggMCBSDQo+Pg0KL01lZGlhQm94IFswIDAgNjEyLjAwMDAgNzkyLjAwMDBdDQovQ29udGVudHMgNSAwIFINCj4+DQplbmRvYmoNCg0KNSAwIG9iag0KPDwgL0xlbmd0aCAxMDc0ID4+DQpzdHJlYW0NCjIgSg0KQlQNCjAgMCAwIHJnDQovRjEgMDAyNyBUZg0KNTcuMzc1MCA3MjIuMjgwMCBUZA0KKCBBIFNpbXBsZSBQREYgRmlsZSApIFRqDQpFVA0KQlQNCi9GMSAwMDEwIFRmDQo2OS4yNTAwIDY4OC42MDgwIFRkDQooIFRoaXMgaXMgYSBzbWFsbCBkZW1vbnN0cmF0aW9uIC5wZGYgZmlsZSAtICkgVGoNCkVUDQpCVA0KL0YxIDAwMTAgVGYNCjY5LjI1MDAgNjY0LjcwNDAgVGQNCigganVzdCBmb3IgdXNlIGluIHRoZSBWaXJ0dWFsIE1lY2hhbmljcyB0dXRvcmlhbHMuIE1vcmUgdGV4dC4gQW5kIG1vcmUgKSBUag0KRVQNCkJUDQovRjEgMDAxMCBUZg0KNjkuMjUwMCA2NTIuNzUyMCBUZA0KKCB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiApIFRqDQpFVA0KQlQNCi9GMSAwMDEwIFRmDQo2OS4yNTAwIDYyOC44NDgwIFRkDQooIEFuZCBtb3JlIHRleHQuIEFuZCBtb3JlIHRleHQuIEFuZCBtb3JlIHRleHQuIEFuZCBtb3JlIHRleHQuIEFuZCBtb3JlICkgVGoNCkVUDQpCVA0KL0YxIDAwMTAgVGYNCjY5LjI1MDAgNjE2Ljg5NjAgVGQNCiggdGV4dC4gQW5kIG1vcmUgdGV4dC4gQm9yaW5nLCB6enp6ei4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kICkgVGoNCkVUDQpCVA0KL0YxIDAwMTAgVGYNCjY5LjI1MDAgNjA0Ljk0NDAgVGQNCiggbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiApIFRqDQpFVA0KQlQNCi9GMSAwMDEwIFRmDQo2OS4yNTAwIDU5Mi45OTIwIFRkDQooIEFuZCBtb3JlIHRleHQuIEFuZCBtb3JlIHRleHQuICkgVGoNCkVUDQpCVA0KL0YxIDAwMTAgVGYNCjY5LjI1MDAgNTY5LjA4ODAgVGQNCiggQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgKSBUag0KRVQNCkJUDQovRjEgMDAxMCBUZg0KNjkuMjUwMCA1NTcuMTM2MCBUZA0KKCB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBFdmVuIG1vcmUuIENvbnRpbnVlZCBvbiBwYWdlIDIgLi4uKSBUag0KRVQNCmVuZHN0cmVhbQ0KZW5kb2JqDQoNCjYgMCBvYmoNCjw8DQovVHlwZSAvUGFnZQ0KL1BhcmVudCAzIDAgUg0KL1Jlc291cmNlcyA8PA0KL0ZvbnQgPDwNCi9GMSA5IDAgUiANCj4+DQovUHJvY1NldCA4IDAgUg0KPj4NCi9NZWRpYUJveCBbMCAwIDYxMi4wMDAwIDc5Mi4wMDAwXQ0KL0NvbnRlbnRzIDcgMCBSDQo+Pg0KZW5kb2JqDQoNCjcgMCBvYmoNCjw8IC9MZW5ndGggNjc2ID4+DQpzdHJlYW0NCjIgSg0KQlQNCjAgMCAwIHJnDQovRjEgMDAyNyBUZg0KNTcuMzc1MCA3MjIuMjgwMCBUZA0KKCBTaW1wbGUgUERGIEZpbGUgMiApIFRqDQpFVA0KQlQNCi9GMSAwMDEwIFRmDQo2OS4yNTAwIDY4OC42MDgwIFRkDQooIC4uLmNvbnRpbnVlZCBmcm9tIHBhZ2UgMS4gWWV0IG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gKSBUag0KRVQNCkJUDQovRjEgMDAxMCBUZg0KNjkuMjUwMCA2NzYuNjU2MCBUZA0KKCBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSApIFRqDQpFVA0KQlQNCi9GMSAwMDEwIFRmDQo2OS4yNTAwIDY2NC43MDQwIFRkDQooIHRleHQuIE9oLCBob3cgYm9yaW5nIHR5cGluZyB0aGlzIHN0dWZmLiBCdXQgbm90IGFzIGJvcmluZyBhcyB3YXRjaGluZyApIFRqDQpFVA0KQlQNCi9GMSAwMDEwIFRmDQo2OS4yNTAwIDY1Mi43NTIwIFRkDQooIHBhaW50IGRyeS4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gKSBUag0KRVQNCkJUDQovRjEgMDAxMCBUZg0KNjkuMjUwMCA2NDAuODAwMCBUZA0KKCBCb3JpbmcuICBNb3JlLCBhIGxpdHRsZSBtb3JlIHRleHQuIFRoZSBlbmQsIGFuZCBqdXN0IGFzIHdlbGwuICkgVGoNCkVUDQplbmRzdHJlYW0NCmVuZG9iag0KDQo4IDAgb2JqDQpbL1BERiAvVGV4dF0NCmVuZG9iag0KDQo5IDAgb2JqDQo8PA0KL1R5cGUgL0ZvbnQNCi9TdWJ0eXBlIC9UeXBlMQ0KL05hbWUgL0YxDQovQmFzZUZvbnQgL0hlbHZldGljYQ0KL0VuY29kaW5nIC9XaW5BbnNpRW5jb2RpbmcNCj4+DQplbmRvYmoNCg0KMTAgMCBvYmoNCjw8DQovQ3JlYXRvciAoUmF2ZSBcKGh0dHA6Ly93d3cubmV2cm9uYS5jb20vcmF2ZVwpKQ0KL1Byb2R1Y2VyIChOZXZyb25hIERlc2lnbnMpDQovQ3JlYXRpb25EYXRlIChEOjIwMDYwMzAxMDcyODI2KQ0KPj4NCmVuZG9iag0KDQp4cmVmDQowIDExDQowMDAwMDAwMDAwIDY1NTM1IGYNCjAwMDAwMDAwMTkgMDAwMDAgbg0KMDAwMDAwMDA5MyAwMDAwMCBuDQowMDAwMDAwMTQ3IDAwMDAwIG4NCjAwMDAwMDAyMjIgMDAwMDAgbg0KMDAwMDAwMDM5MCAwMDAwMCBuDQowMDAwMDAxNTIyIDAwMDAwIG4NCjAwMDAwMDE2OTAgMDAwMDAgbg0KMDAwMDAwMjQyMyAwMDAwMCBuDQowMDAwMDAyNDU2IDAwMDAwIG4NCjAwMDAwMDI1NzQgMDAwMDAgbg0KDQp0cmFpbGVyDQo8PA0KL1NpemUgMTENCi9Sb290IDEgMCBSDQovSW5mbyAxMCAwIFINCj4+DQoNCnN0YXJ0eHJlZg0KMjcxNA0KJSVFT0YNCg==';
    // const blob = new Blob([data], { type: 'application/pdf' });
    // const url = URL.createObjectURL(blob);
    // printJS(url);

    // printJS({
    //   printable:
    //     'https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf',
    //   type: 'pdf',
    //   showModal: true,
    // });

    // ipcRenderer.send(appConst.PRINT_PDF_FILE, pdfData);
  };

  prevSearchRes = () => {
    const { currentSearchResNum } = this.state;
    if (currentSearchResNum > 1) {
      this.setState({
        currentSearchResNum: currentSearchResNum - 1,
      });
      // setScrollToPage({ value: page_number });
      // document.getElementById(element_id).scrollIntoView();
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

  render(): React.ReactElement {
    const { currentPdf, pdfLoading, scrollToPage } = this.props;
    const {
      pdfData,
      numPages,
      currentPage,
      // scale,
      // renderTextLayer,
      pdfDocWidth,
      currentSearchResNum,
      totalSearchResCount,
      displayedPdfName,
    } = this.state;
    this.pagesRendered = 0;
    return (
      <div
        className="pdf-viewer"
        ref={this.containerRef}
        style={{ width: pdfDocWidth }}
      >
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
        />

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
                    height={690}
                    rowCount={numPages}
                    rowHeight={850 * this.state.scale}
                    rowRenderer={this.rowRenderer}
                    scrollToIndex={scrollToPage.value}
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
  setCurrentPdf: projectFileActions.setCurrentPdf,
  setAppState: appStateActions.setAppState,
  setSelection: pdfViewerActions.setSelection,
  setShowLoading: appStateActions.setShowLoading,
  setScrollToPage: pdfViewerActions.setScrollToPage,
};

const mapStateToProps = (state: StoreType, ownProps: IPDFViewerProps) => {
  return {
    currentPdf: state.projectFile.currentPdf,
    parentRef: ownProps.parentRef,
    currentProjectFile: state.projectFile.currentProjectFile,
    currentIndexes: state.projectFile.currentIndexes,
    pdfLoading: state.appState.showLoading,
    scrollToPage: state.pdfViewer.scrollToPage,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(PDFViewer);

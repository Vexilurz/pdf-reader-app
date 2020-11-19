/* eslint-disable */
import './pdf.scss';
import * as pathLib from 'path';
import * as React from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
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
import { TextItem } from './TextItem';

export interface IPDFViewerProps {
  parentRef: React.RefObject<any>;
}
export interface IPDFViewerState {
  pdfData: IPDFdata | null;
  numPages: number;
  scale: number;
  renderTextLayer: boolean;
  pdfDocWidth: number;
}

class PDFViewer extends React.Component<
  StatePropsType & DispatchPropsType,
  IPDFViewerState
> {
  private containerRef: React.RefObject<any>;
  private documentRef: React.RefObject<any>;
  private newPatternWorkResult: boolean;

  constructor(props: StatePropsType & DispatchPropsType) {
    super(props);
    this.state = {
      pdfData: null,
      numPages: 0,
      scale: 1.0,
      renderTextLayer: false,
      pdfDocWidth: 1000,
    };
    this.containerRef = React.createRef();
    this.documentRef = React.createRef();
    this.newPatternWorkResult = false;
  }

  componentDidMount(): void {
    ipcRenderer.on(
      appConst.PDF_FILE_CONTENT_RESPONSE,
      (event, data: Uint8Array) => {
        this.setState({ renderTextLayer: false, pdfData: { data } });
      }
    );
  }

  // shouldComponentUpdate()

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
    // const { numPages } = this.state;
    // this.loadedPagesCounter += 1;
    // if (this.loadedPagesCounter >= numPages) {
    //   this.setState({ renderTextLayer: true });
    // }
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

  // calcPageOffsets = (numPages) => {
  //   this.pagesOffsets = [];
  //   for (let i = 0; i < numPages; i += 1) {
  //     this.getPageOffset(i + 1).then((pageOffset) =>
  //       this.pagesOffsets.push(pageOffset)
  //     );
  //   }
  // };

  onDocumentLoadSuccess = (document) => {
    const { numPages } = document;
    this.setState({ numPages });
    this.documentRef.current = document;
    // this.calcPageOffsets(numPages);
  };

  onRenderFinished = (pageNumber: number) => {
    // const { numPages } = this.state;
    // const { setShowLoading } = this.props;
    // if (pageNumber === numPages) {
    //   setShowLoading(false);
    // }
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
  // getPageOffset = async (pageNumber: number) => {
  //   const pageLengths = await Promise.all(
  //     Array.from({ length: pageNumber - 1 }, (_, index) =>
  //       this.getItemOffset(index + 1)
  //     )
  //   );
  //   return pageLengths.reduce((acc, pageLength) => acc + pageLength, 0);
  // };

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
      <mark id={key} key={key} style={{ color, backgroundColor: color }}>
        {text}
      </mark>
    );
  };

  getUnmarkedText = (text: string, key: any) => {
    return (
      <span id={key} key={key}>
        {text}
      </span>
    );
  };

  // newPattern = (
  //   text: string,
  //   bookmark: IBookmark,
  //   pageNumber: number,
  //   counter: number
  // ) => {
  //   let result = this.getUnmarkedText(text, `${pageNumber},${counter},0`);

  //   const {
  //     startOffset,
  //     endOffset,
  //     startContainerOffset,
  //     startPage,
  //     endContainerOffset,
  //     endPage,
  //   } = bookmark.selection;

  //   const { length } = text;
  //   const counterPlusLen = counter + length;
  //   if (pageNumber >= startPage && pageNumber <= endPage) {
  //     if (
  //       (pageNumber > startPage && pageNumber < endPage) ||
  //       (pageNumber === endPage && counterPlusLen <= endContainerOffset) ||
  //       ()
  //     ) {
  //       // mark all text
  //       result = this.getMarkedText(text, bookmark.color, '0k' + counter);
  //       this.newPatternWorkResult = true;
  //     } else if (
  //       counter >= bookmark.selection.startOffset &&
  //       counter < bookmark.selection.endOffset
  //     ) {
  //       // mark left part
  //       result = splitDuo(bookmark.selection.endOffset - counter)(text);
  //       result[0] = this.getMarkedText(
  //         result[0],
  //         bookmark.color,
  //         '0k' + counter
  //       );
  //       result[1] = this.getUnmarkedText(result[1], '1k' + counter);
  //       this.newPatternWorkResult = true;
  //     } else if (
  //       counter + length > bookmark.selection.startOffset &&
  //       counter + length <= bookmark.selection.endOffset
  //     ) {
  //       // mark right part
  //       result = splitDuo(bookmark.selection.startOffset - counter)(text);
  //       result[0] = this.getUnmarkedText(result[0], '0k' + counter);
  //       result[1] = this.getMarkedText(
  //         result[1],
  //         bookmark.color,
  //         '1k' + counter
  //       );
  //       this.newPatternWorkResult = true;
  //     } else if (
  //       counter < bookmark.selection.startOffset &&
  //       counter + length > bookmark.selection.endOffset
  //     ) {
  //       // mark middle
  //       result = splitTriple(
  //         bookmark.selection.startOffset - counter,
  //         bookmark.selection.endOffset - counter
  //       )(text);
  //       result[0] = this.getUnmarkedText(result[0], '0k' + counter);
  //       result[1] = this.getMarkedText(
  //         result[1],
  //         bookmark.color,
  //         '1k' + counter
  //       );
  //       result[2] = this.getUnmarkedText(result[2], '2k' + counter);
  //       this.newPatternWorkResult = true;
  //     }
  //   }
  //   // console.log(dbg, result);
  //   return result;
  // };

  split = (
    text: string,
    bookmarks: any[],
    pageNumber: number,
    counter: number
  ) => {
    const result = [];
    const textEnd = text.length + counter;
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
            `${pageNumber},${current},${index++},${bookmark.id}`
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

  pdfRenderer = (pageNumber: number) => {
    let counter = 0;
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
        let start = v.selection.startContainerOffset + v.selection.startOffset;
        let end = v.selection.endContainerOffset + v.selection.endOffset;

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
    console.log(
      '%c%s',
      'color: lime; font: 1.2rem/1 Tahoma;',
      'PDF_RENDERER',
      pageNumber
    );
    return (textItem) => {
      if (prevTextItem !== textItem) {
        prevTextItem = textItem;
        let pattern = '';
        if (textItem.str) {
          // this.newPatternWorkResult = false;
          if (bookmarksSorted?.length > 0) {
            let index = 0;
            // while (!this.newPatternWorkResult && index < bookmarks.length) {
            pattern = this.split(
              textItem.str,
              bookmarksSorted,
              pageNumber,
              counter
            );
            // index += 1;
            // }
          } else {
            pattern = this.getUnmarkedText(
              textItem.str,
              `${pageNumber},${counter},0`
            );
          }
          // pattern = (
          //   <TextItem
          //     key={`${pageNumber},${counter},0`}
          //     id={`${pageNumber},${counter},0`}
          //   >
          //     {textItem.str}
          //   </TextItem>
          // );
          counter += textItem.str.length;
        }
        return pattern;
      }
    };
  };

  // clearSelection = () => {
  //   const { setSelection } = this.props;
  //   setSelection(getInfSelection());
  // };

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

    // console.log(startContainer.parentNode.id);

    // Selection partially outside PDF document
    if (!this.containerRef.current.contains(commonAncestorContainer)) {
      return;
    }

    const startIdSplit = startContainer?.parentNode?.id.split(',');
    const endIdSplit = endContainer?.parentNode?.id.split(',');

    const startContainerOffset = parseInt(startIdSplit[1], 10);
    const startPage = parseInt(startIdSplit[0], 10);
    const endContainerOffset = parseInt(endIdSplit[1], 10);
    const endPage = parseInt(endIdSplit[0], 10);

    setSelection({
      startPage,
      startContainerOffset,
      startOffset,
      endPage,
      endContainerOffset,
      endOffset,
    });
  };

  // onMouseDown = async () => {
  //   this.clearSelection();
  // };

  handlePdfDocResize = (contentRect) => {
    this.setState({ pdfDocWidth: contentRect?.bounds?.width });
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

    return (
      <div
        className="pdf-viewer"
        ref={this.containerRef}
        style={{ width: pdfDocWidth }}
      >
        {pathLib.basename(currentPdf.path)}
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
                  // onMouseDown={this.onMouseDown}
                >
                  {Array.from(new Array(numPages), (el, index) => {
                    return (
                      <div className="pdf-page" key={`page_${index + 1}`}>
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
                    );
                  })}
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

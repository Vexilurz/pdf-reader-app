/* eslint-disable */
import React, { Component, Ref } from 'react';
import { connect } from 'react-redux';
import { Page } from 'react-pdf/dist/esm/entry.webpack';
import Measure from 'react-measure';
import { IProjectFileWithPath } from '../../types/projectFile';
import { IEventAndFileIndex } from '../../reduxStore/projectFileSlice';
import { actions as dimensionsActions } from '../../reduxStore/dimensionSlice';
import { StoreType } from '../../reduxStore/store';
import { withStyles } from '@material-ui/core';

interface Props {
  scale: number;
  pageNumber: number;
  numPages: number;
  setShowLoading(value: boolean): void;
  pageDimensionsCallback(width: number, height: number): void;
  listRef: React.RefObject<any>;
  pagesRendered: number;
  setPagesRendered(value: number): void;
  currentProjectFile: IProjectFileWithPath;
  currentIndexes: IEventAndFileIndex;
  searchPattern: string | null;
  textLayerZIndex: number;
  // height: number;
  // width: number;
}
interface State {}

class PdfPage extends Component<StatePropsType & DispatchPropsType, State> {
  private _currentSearchIndex: number;

  constructor(props: State & Props) {
    super(props);
    this.state = {};
    this._currentSearchIndex = 0;
  }

  componentDidUpdate(prevProps) {
    if (this.props.searchPattern !== prevProps.searchPattern) {
      this._currentSearchIndex = 0;
    }
  }

  handlePdfPageResize = (pageNumber) => (contentRect) => {
    // console.log(pageNumber, contentRect?.bounds);
    // TODO: condition is a crunch
    if (pageNumber === 1 && contentRect?.bounds?.height > 50)
      // this.props.pageDimensionsCallback(
      //   contentRect?.bounds?.width,
      //   contentRect?.bounds?.height
      // );
      this.props.setPageDimensions({
        width: contentRect?.bounds?.width,
        height: contentRect?.bounds?.height,
      });
  };

  onPageLoad = async (page) => {
    this.removeTextLayerOffset();
  };

  removeTextLayerOffset = () => {
    const textLayers = document.querySelectorAll(
      '.react-pdf__Page__textContent'
    );
    textLayers.forEach((layer) => {
      const { style } = layer;
      style.zIndex = this.props.textLayerZIndex;
    });
  };

  highlightPattern = (text: string, pattern: string) => {
    // console.log(`"${text}"`);
    if (text === ' A Simple PDF File ') console.log('render line');

    const splitText = text.toLowerCase().split(pattern);

    if (splitText.length <= 1) {
      return text;
    }

    const tmp = splitText.map((item, index) => {
      if (index == splitText.length - 1) return item;
      else {
        // this._totalSearchResCount += 1;
        // this.setState({ totalSearchResCount: this._totalSearchResCount });
        this._currentSearchIndex += 1;
        const id = `${this.props.pageNumber}-${this._currentSearchIndex}`;
        return [
          item,
          this.getMarkedText(
            pattern,
            'blue',
            id,
            id
            // this._totalSearchResCount,
            // `sr${this._totalSearchResCount}`
          ),
        ];
      }
    });

    return tmp;
  };

  getMarkedText = (text: string, color: string, key: any, id: string) => {
    return (
      <mark
        className={key}
        key={key}
        id={id}
        title={id} // debug
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
        const t = text.slice(start - counter, end - counter);
        if (t !== '')
          result.push(
            this.getMarkedText(
              t,
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
        !v.isAreaSelection &&
        v.selection.startPage <= pageNumber &&
        v.selection.endPage >= pageNumber
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
          const { searchPattern } = this.props;
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
          }
          textLenCounter += textItem.str.length;
          indexCounter += 1;
        }
        return pattern;
      }
    };
  };

  onRenderFinished = (pageNumber: number) => {
    const {
      setShowLoading,
      numPages,
      listRef,
      pagesRendered,
      setPagesRendered,
    } = this.props;
    setPagesRendered(pagesRendered + 1);
    if (pagesRendered === numPages) {
      setShowLoading(false);
    }
    // Updates area-selection layer after pdf loading
    listRef.current?.forceUpdateGrid();
  };

  render() {
    const { scale, pageNumber } = this.props;
    this._currentSearchIndex = 0;
    return (
      // TODO: this measure block cause inf re-render of page.
      // But width and height of the page is needed to scale area bookmarks.

      <Measure
        bounds
        onResize={(e) => {
          // this.handlePdfPageResize(pageNumber)(e);
          console.log('qwewqe');
        }}
      >
        {({ measureRef }) => (
          // <div ref={measureRef}>
          <Page
            canvasRef={measureRef}
            width={this.props.docDim.width}
            // height={this.props.height}
            scale={scale}
            pageNumber={pageNumber}
            onLoadSuccess={this.onPageLoad}
            customTextRenderer={this.pdfRenderer(pageNumber)}
            onGetTextSuccess={() => {
              this.onRenderFinished(pageNumber);
            }}
          />
          // </div>
        )}
      </Measure>
    );
  }
}

const mapDispatchToProps = {
  setPageDimensions: dimensionsActions.setPageDimensions,
};

const mapStateToProps = (state: StoreType, ownProps: Props) => {
  return {
    ...ownProps,
    docDim: state.dimensions.document,
    pageDim: state.dimensions.page,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(PdfPage);

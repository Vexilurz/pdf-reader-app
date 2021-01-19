/* eslint-disable */
import React, { Component, CSSProperties } from 'react';
import { List, AutoSizer } from 'react-virtualized';
import { IEventAndFileIndex } from '../../reduxStore/projectFileSlice';
import { IAreaSelection } from '../../types/bookmark';
import { IProjectFileWithPath } from '../../types/projectFile';
import AreaSelection from './AreaSelection';
import PdfPage from './PdfPage';

interface IRowRendererProps {
  key: string;
  index: number;
  isVisible: boolean;
  isScrolling: boolean;
  style: CSSProperties | undefined;
  parent: HTMLElement;
}

interface Props {
  numPages: number;
  scrollToIndex: number;
  currentProjectFile: IProjectFileWithPath;
  currentIndexes: IEventAndFileIndex;
  setCurrentPage(value: number): void;

  scale: number;
  setShowLoading(value: boolean): void;
  searchPattern: string | null;
  textLayerZIndex: number;
  newAreaSelectionCallback(area: IAreaSelection): void;
}
interface State {
  pageWidth: number;
  pageHeight: number;
}

export default class PageContainer extends Component<Props, State> {
  private listRef: React.RefObject<any>;
  private pagesRendered: number;

  constructor(props: State & Props) {
    super(props);
    this.state = {
      pageWidth: 100,
      pageHeight: 100,
    };
    this.listRef = React.createRef();
    this.pagesRendered = 0;
  }

  pageDimensionsCallback = (width: number, height: number) => {
    this.setState({
      pageHeight: height,
      pageWidth: width,
    });
  };

  setPagesRendered = (value: number) => {
    this.pagesRendered = value;
  };

  rowRenderer = ({
    key,
    index,
    isVisible,
    style,
  }: IRowRendererProps): React.ReactNode => {
    if (isVisible) this.props.setCurrentPage(index + 1);

    const {
      currentIndexes,
      currentProjectFile,
      scale,
      numPages,
      setShowLoading,
      searchPattern,
      textLayerZIndex,
      newAreaSelectionCallback,
    } = this.props;

    const { pageHeight, pageWidth } = this.state;

    const allBookmarks =
      currentProjectFile.content.events[currentIndexes.eventIndex]?.files[
        currentIndexes.fileIndex
      ]?.bookmarks;

    const bookmarksFiltered = allBookmarks?.filter(
      (v) => v.isAreaSelection && v.selection.page === index + 1
    );

    return (
      <div key={key} style={style}>
        <div className="pdf-page" key={`page_${index + 1}_${key}`}>
          <AreaSelection
            key={`as${index + 1}_${key}`}
            width={pageWidth}
            height={pageHeight}
            page={index + 1}
            bookmarks={bookmarksFiltered}
            newSelectionCallback={newAreaSelectionCallback}
          />
          <PdfPage
            scale={scale}
            pageNumber={index + 1}
            numPages={numPages}
            setShowLoading={setShowLoading}
            pageDimensionsCallback={this.pageDimensionsCallback}
            listRef={this.listRef}
            pagesRendered={this.pagesRendered}
            setPagesRendered={this.setPagesRendered}
            currentProjectFile={currentProjectFile}
            currentIndexes={currentIndexes}
            searchPattern={searchPattern}
            textLayerZIndex={textLayerZIndex}
          />
        </div>
      </div>
    );
  };

  render() {
    const { numPages, scrollToIndex } = this.props;
    const { pageHeight } = this.state;
    this.pagesRendered = 0;
    return (
      <AutoSizer>
        {({ height, width }: any) => (
          <List
            width={width}
            height={height}
            rowCount={numPages}
            rowHeight={pageHeight}
            rowRenderer={this.rowRenderer}
            scrollToIndex={scrollToIndex}
            overscanRowCount={1}
            ref={this.listRef}
          />
        )}
      </AutoSizer>
    );
  }
}

import React, { Component, CSSProperties } from 'react';
import { List, AutoSizer } from 'react-virtualized';
import PdfPage from './PdfPage';

interface IRowRendererProps {
  key: string;
  index: number;
  isVisible: boolean;
  isScrolling: boolean;
  style: CSSProperties | undefined;
  parent: HTMLElement;
}

interface Props {}
interface State {}

export default class PageContainer extends Component<Props, State> {
  state = {};

  rowRenderer = ({
    key,
    index,
    isVisible,
    style,
  }: IRowRendererProps): React.ReactNode => {
    const { scale } = this.state;
    if (isVisible) this.setState({ currentPage: index + 1 });

    const { currentIndexes, currentProjectFile } = this.props;

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
            width={this.state.pageWidth}
            height={this.state.pageHeight}
            page={index + 1}
            bookmarks={bookmarksFiltered}
          />
          <PdfPage />
        </div>
      </div>
    );
  };

  render() {
    return (
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
    );
  }
}

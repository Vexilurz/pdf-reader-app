import React, { CSSProperties } from 'react';

interface IRowRendererProps {
  key: string;
  index: number;
  isVisible: boolean;
  isScrolling: boolean;
  style: CSSProperties | undefined;
  parent: HTMLElement;
}

const rowRenderer = ({
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

export default {
  rowRenderer,
};

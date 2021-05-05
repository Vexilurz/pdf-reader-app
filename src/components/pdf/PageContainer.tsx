/* eslint-disable */
import React, { Component, CSSProperties } from 'react';
import { connect } from 'react-redux';
import { List, AutoSizer } from 'react-virtualized';
import { IBoolValue } from '../../reduxStore/pdfViewerSlice';
import { IEventAndFileIndex } from '../../reduxStore/projectFileSlice';
import { IAreaSelection } from '../../types/bookmark';
import { IProjectFileWithPath } from '../../types/projectFile';
import AreaSelection from './AreaSelection';
import PdfPage from './PdfPage';
import { actions as dimensionsActions } from '../../reduxStore/dimensionSlice';
import { StoreType } from '../../reduxStore/store';

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
  rotateInDeg: number;

  // tmp
  needForceUpdate: boolean;
  setNeedForceUpdate(value: IBoolValue): void;
  listWidth: number;
  listHeight: number;
  currentPage: number;
}
interface State {
  pageWidth: number;
  pageHeight: number;
}

class PageContainer extends Component<
  StatePropsType & DispatchPropsType,
  State
> {
  private listRef: React.RefObject<any>;
  private pagesRendered: number;

  constructor(props: StatePropsType & DispatchPropsType) {
    super(props);
    // Refactor this
    this.state = {
      pageWidth: 700,
      pageHeight: 700,
    };
    this.listRef = React.createRef();
    this.pagesRendered = 0;
  }

  componentDidUpdate(prevProps) {
    this.checkForceUpdate();
    // if (this.props.listHeight !== prevProps.listHeight) {
    //   this.setState({
    //     pageWidth: this.props.listWidth - 20,
    //     pageHeight: this.props.listHeight,
    //   });
    // }
  }

  checkForceUpdate() {
    if (this.props.needForceUpdate === true) {
      this.listRef.current?.recomputeRowHeights(this.props.currentPage);
      this.props.setNeedForceUpdate({ value: false, tip: '...set to false' });
    }
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
      rotateInDeg,
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
        <div
          className="pdf-page"
          key={`page_${index + 1}_${key}`}
          style={{ transform: `rotate(${rotateInDeg}deg)` }}
        >
          <AreaSelection
            key={`as${index + 1}_${key}`}
            width={this.props.pageDim.width}
            height={this.props.pageDim.height}
            page={index + 1}
            bookmarks={bookmarksFiltered}
            scale={scale}
            newSelectionCallback={newAreaSelectionCallback}
          />
          <PdfPage
            // Magic number: width of scroll bar
            // width={this.props.listWidth - 20}
            // height={this.props.listHeight}
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
      <List
        width={this.props.docDim.width}
        height={this.props.docDim.height}
        rowCount={numPages}
        rowHeight={this.props.pageDim.height + 20}
        rowRenderer={this.rowRenderer}
        scrollToIndex={scrollToIndex}
        scrollToAlignment={'start'}
        overscanRowCount={1}
        ref={this.listRef}
      />
    );
  }
}

const mapDispatchToProps = {
  setDocumentDimensions: dimensionsActions.setDocumentDimensions,
  setPageDimentions: dimensionsActions.setPageDimensions,
};

const mapStateToProps = (state: StoreType, ownProps: Props) => {
  return {
    ...ownProps,
    pageDim: state.dimensions.page,
    docDim: state.dimensions.document,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(PageContainer);

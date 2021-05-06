import React, { Component } from 'react';
import { Document } from 'react-pdf/dist/esm/entry.webpack';
import { connect } from 'react-redux';
import ReactResizeDetector from 'react-resize-detector';
import { IEventAndFileIndex } from '../../reduxStore/projectFileSlice';
import { IAreaSelection, IPdfSelection } from '../../types/bookmark';
import { IPDFdata } from '../../types/pdf';
import { IProjectFileWithPath } from '../../types/projectFile';
import PageContainer from './PageContainer';
import { IBoolValue } from '../../reduxStore/pdfViewerSlice';
import { StoreType } from '../../reduxStore/store';
import { actions as dimensionsActions } from '../../reduxStore/dimensionSlice';

interface Props {
  pdfFile?: IPDFdata;
  areaSelectionEnable: boolean;
  onLoadSuccessCallback: (numPages: number) => void;
  setSelection: (selection: IPdfSelection) => void;

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
  currentPage: number;
}
interface State {
  numPages: number;
  listWidth: number;
  listHeight: number;
}

class PdfDocument extends Component<StatePropsType & DispatchPropsType, State> {
  private containerRef: React.RefObject<HTMLElement>;

  constructor(props: Props) {
    super(props);
    this.state = {
      numPages: 0,
      listWidth: 0,
      listHeight: 0,
    };
    this.containerRef = React.createRef();
  }

  setContainerRef = (ref: React.RefObject<HTMLElement>): void => {
    this.containerRef = ref;
  };

  onDocumentLoadSuccess = ({ numPages }): void => {
    const { onLoadSuccessCallback } = this.props;
    this.setState({ numPages });
    onLoadSuccessCallback(numPages);
  };

  onMouseUp = async (): Promise<void> => {
    const { areaSelectionEnable } = this.props;
    if (!areaSelectionEnable) {
      const { setSelection } = this.props;

      if (this.containerRef.current === null) {
        return;
      }

      const selection = window.getSelection();

      if (!selection) return;

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

      const startParenNode = startContainer?.parentNode as HTMLElement;
      const endParenNode = endContainer?.parentNode as HTMLElement;

      const startIdSplit = startParenNode.className.split(',');
      const endIdSplit = endParenNode.className.split(',');

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

  render(): React.ReactNode {
    const {
      pdfFile,
      scrollToIndex,
      currentProjectFile,
      currentIndexes,
      setCurrentPage,
      scale,
      setShowLoading,
      searchPattern,
      textLayerZIndex,
      newAreaSelectionCallback,
      // tmp
      needForceUpdate,
      setNeedForceUpdate,
      rotateInDeg,
    } = this.props;
    const { numPages } = this.state;
    return (
      <ReactResizeDetector
        handleWidth
        handleHeight
        onResize={(width, height) => {
          console.log('OnDocRes!!');
          const toolbarHeight = 0;
          if (width && height)
            this.props.setDocumentDimensions({
              width,
              height: height - toolbarHeight,
            });
        }}
      >
        {({ targetRef }) => (
          <div className="pdf-document" ref={targetRef}>
            <Document
              file={pdfFile}
              onLoadSuccess={this.onDocumentLoadSuccess}
              inputRef={this.setContainerRef}
              onMouseUp={this.onMouseUp}
            >
              <PageContainer
                listHeight={this.state.listHeight}
                listWidth={this.state.listWidth}
                currentPage={this.props.currentPage}
                numPages={numPages}
                scrollToIndex={scrollToIndex}
                currentProjectFile={currentProjectFile}
                currentIndexes={currentIndexes}
                setCurrentPage={setCurrentPage}
                scale={scale}
                setShowLoading={setShowLoading}
                searchPattern={searchPattern}
                textLayerZIndex={textLayerZIndex}
                newAreaSelectionCallback={newAreaSelectionCallback}
                needForceUpdate={needForceUpdate}
                setNeedForceUpdate={setNeedForceUpdate}
                rotateInDeg={rotateInDeg}
              />
            </Document>
          </div>
        )}
      </ReactResizeDetector>
    );
  }
}

const mapDispatchToProps = {
  setDocumentDimensions: dimensionsActions.setDocumentDimensions,
};

const mapStateToProps = (state: StoreType, ownProps: Props) => {
  return {
    ...ownProps,
    width: state.dimensions.document.width,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(PdfDocument);

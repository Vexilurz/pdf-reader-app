/* eslint-disable */
import './pdf.scss';
import * as pathLib from 'path';
import * as React from 'react';
import electron, { ipcRenderer, shell } from 'electron';
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
import PdfDocument from './PdfDocument';
import { createBookmark, IAreaSelection } from '../../types/bookmark';

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
  rotateIndex: number;
}

class PDFViewer extends React.Component<
  StatePropsType & DispatchPropsType,
  IPDFViewerState
> {
  private containerRef: React.RefObject<any>;
  private documentRef: React.RefObject<any>;
  private searchRef: React.RefObject<any>;
  private listRef: React.RefObject<any>;

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
      rotateIndex: 0,
    };
    this.containerRef = React.createRef();
    this.documentRef = React.createRef();
    this.searchRef = React.createRef();
    this.listRef = React.createRef();
    this.pageText = [];
    this._totalSearchResCount = 0;
    this.textLayerZIndex = 5;
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.scale !== this.state.scale) {
      this.props.setNeedForceUpdate({
        value: true,
        tip: 'PDFViewer did update',
      });
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

  onLoadSuccessCallback = (numPages: number) => {
    this.setState({ numPages });
    this.props.setCurrentSelection(null);
    this.props.disableAreaSelection();
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

  setPageNumber = (pageNumber: number) => {
    const { setScrollToPage } = this.props;
    this.setState({ currentPage: pageNumber });
    setScrollToPage({ value: pageNumber - 1 });
  };

  onPrint = () => {
    const { currentPdf } = this.props;
    const { pdfData } = this.state;
    ipcRenderer.send(appConst.PRINT_PDF_FILE, currentPdf.path);

    // this.props.setNeedForceUpdate({ value: true, tip: 'onPrint update' });
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
    const textLayers = document.querySelectorAll(
      '.react-pdf__Page__textContent'
    );
    this.textLayerZIndex = this.props.areaSelectionEnable.value ? 5 : 1;
    if (this.props.areaSelectionEnable) {
      this.props.setCurrentSelection(null);
    }
    this.props.toggleAreaSelectionEnable();
    textLayers.forEach((layer) => {
      const { style } = layer;
      style.zIndex = this.textLayerZIndex;
    });
    this.props.setNeedForceUpdate({
      value: true,
      tip: 'onAreaSelectionToggle',
    });
  };

  newAreaSelectionCallback = (area: IAreaSelection) => {
    const {
      addBookmark,
      setEditingBookmarkID,
      setCurrentSelection,
      setCurrentFileHaveChanges,
      saveCurrentProjectTemporary,
    } = this.props;
    const { scale } = this.state;
    let newBookmark = null;
    console.log(area);
    if (area) {
      let scaledArea = {
        ...area,
        x: area.x / scale,
        y: area.y / scale,
        width: area.width / scale,
        height: area.height / scale,
      };
      newBookmark = createBookmark('', true, scaledArea, '#cce5ff');
    }
    if (newBookmark) {
      addBookmark(newBookmark);
      setEditingBookmarkID(newBookmark.id);
      setCurrentSelection(null);
      setCurrentFileHaveChanges(true);
      saveCurrentProjectTemporary();
    }
    // setTimeout(() => {
    this.props.setNeedForceUpdate({
      value: true,
      tip: 'newAreaSelectionCallback',
    }); // TODO: this thing do not help or work there
    // }, 200);
  };

  onAddBookmark = () => {
    const {
      addBookmark,
      textSelection,
      areaSelection,
      setEditingBookmarkID,
      setCurrentFileHaveChanges,
      saveCurrentProjectTemporary,
    } = this.props;
    let newBookmark = null;
    if (
      !areaSelection && //) {
      //   newBookmark = createBookmark('', true, areaSelection, '#cce5ff');
      // } else if (
      textSelection.startOffset !== Infinity &&
      textSelection.endOffset !== Infinity
    ) {
      newBookmark = createBookmark('', false, textSelection, '#cce5ff');
    }
    if (newBookmark) {
      addBookmark(newBookmark);
      setEditingBookmarkID(newBookmark.id);
      setCurrentFileHaveChanges(true);
      saveCurrentProjectTemporary();
    }
    this.props.setNeedForceUpdate({ value: true, tip: 'onAddBookmark' });
  };

  onOpenPDFinExternal = () => {
    shell.openPath(this.props.currentPdf.path);
  };

  onRotatePdf = () => {
    const { rotateIndex } = this.state;
    if (rotateIndex == 3) this.setState({ rotateIndex: 0 });
    else this.setState({ rotateIndex: rotateIndex + 1 });
  };

  render(): React.ReactElement {
    const { pdfLoading, scrollToPage } = this.props;
    const {
      pdfData,
      numPages,
      currentPage,
      currentSearchResNum,
      totalSearchResCount,
      displayedPdfName,
    } = this.state;

    return (
      <div
        className="pdf-viewer"
        ref={this.containerRef}
        style={{ width: '100%' }}
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
            this.setState({ scale }, () => {
              // setTimeout(() => {
              this.props.setNeedForceUpdate({
                value: true,
                tip: 'After scale setState',
              });
              // }, 200);
            });
          }}
          onSetPageNumber={this.setPageNumber}
          numPages={numPages}
          currentPage={currentPage}
          onPrint={this.onPrint}
          onAreaSelectionToggle={this.onAreaSelectionToggle}
          areaSelectionEnable={this.props.areaSelectionEnable.value}
          onAddBookmark={this.onAddBookmark}
          onOpenPDFinExternal={this.onOpenPDFinExternal}
          onRotatePdf={this.onRotatePdf}
        />
        {pdfData ? (
          <PdfDocument
            currentPage={currentPage}
            pdfFile={pdfData}
            areaSelectionEnable={this.props.areaSelectionEnable.value}
            onLoadSuccessCallback={this.onLoadSuccessCallback}
            setSelection={this.props.setSelection}
            scrollToIndex={scrollToPage.value}
            currentProjectFile={this.props.currentProjectFile}
            currentIndexes={this.props.currentIndexes}
            setCurrentPage={(value: number) => {
              this.setState({ currentPage: value });
            }}
            scale={this.state.scale}
            setShowLoading={this.props.setShowLoading}
            searchPattern={this.state.searchPattern}
            textLayerZIndex={this.textLayerZIndex}
            newAreaSelectionCallback={this.newAreaSelectionCallback}
            rotateInDeg={this.state.rotateIndex * 90}
            // tmp
            needForceUpdate={this.props.needForceUpdate}
            setNeedForceUpdate={this.props.setNeedForceUpdate}
          />
        ) : null}
      </div>
    );
  }
}

const mapDispatchToProps = {
  addBookmark: projectFileActions.addBookmark,
  setCurrentPdf: projectFileActions.setCurrentPdf,
  setAppState: appStateActions.setAppState,
  setSelection: pdfViewerActions.setSelection,
  setShowLoading: appStateActions.setShowLoading,
  setScrollToPage: pdfViewerActions.setScrollToPage,
  toggleAreaSelectionEnable: pdfViewerActions.toggleAreaSelectionEnable,
  disableAreaSelection: pdfViewerActions.disableAreaSelection,
  setCurrentSelection: pdfViewerActions.setAreaSelection,
  setNeedForceUpdate: pdfViewerActions.setNeedForceUpdate,
  setEditingBookmarkID: pdfViewerActions.setEditingBookmarkID,
  setCurrentFileHaveChanges: projectFileActions.setCurrentFileHaveChanges,
  saveCurrentProjectTemporary: projectFileActions.saveCurrentProjectTemporary,
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
    textSelection: state.pdfViewer.pdfSelection,
    areaSelection: state.pdfViewer.areaSelection,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(PDFViewer);

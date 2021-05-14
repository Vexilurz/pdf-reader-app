/* eslint-disable */
import './pdf.scss';
import * as pathLib from 'path';
import * as React from 'react';
import electron, { ipcRenderer, remote, shell } from 'electron';
import { connect } from 'react-redux';
import { List, AutoSizer } from 'react-virtualized';
import Measure from 'react-measure';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack';
import { StoreType } from '../../reduxStore/store';
import { actions as projectFileActions } from '../../reduxStore/projectFileSlice';
import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import { actions as pdfViewerActions } from '../../reduxStore/pdfViewerSlice';
import { actions as licenseActions } from '../../reduxStore/licenseSlice';
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
  private textLayerZIndex: number;
  private _currentSearchPage: number;
  private _currentSearchIndex: number;

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
    this._currentSearchPage = 1;
    this._currentSearchIndex = 1;
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
    ipcRenderer.on(
      appConst.PDF_FILE_CONTENT_RESPONSE,
      this.onPdfFileContentResponse
    );
  }

  componentWillUnmount(): void {
    ipcRenderer.removeListener(
      appConst.PDF_FILE_CONTENT_RESPONSE,
      this.onPdfFileContentResponse
    );
  }

  onPdfFileContentResponse = (event, payload) => {
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
  };

  onLoadSuccessCallback = (numPages: number) => {
    this.setState({ numPages });
    this.props.setCurrentSelection(null);
    this.props.disableAreaSelection();
  };

  // TODO: this is not used yet, and not wirking.
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
  };

  getSearchElement = () => {
    console.log(`${this._currentSearchPage}-${this._currentSearchIndex}`);
    return document.getElementById(
      `${this._currentSearchPage}-${this._currentSearchIndex}`
    );
  };

  prevSearchRes = () => {
    const { setScrollToPage } = this.props;
    const { numPages } = this.state;
    this._currentSearchIndex--;
    let element = this.getSearchElement();
    while (!element && this._currentSearchPage > 1) {
      this._currentSearchPage--;
      setScrollToPage({ value: this._currentSearchPage - 1 });
      this._currentSearchIndex = 1; // TODO: remember max of found on page
      element = this.getSearchElement();
    }
    if (!element) {
      this._currentSearchPage = numPages;
      this._currentSearchIndex = 1;
      element = this.getSearchElement();
    }
    if (element) {
      setScrollToPage({ value: this._currentSearchPage - 1 });
      element.scrollIntoView();
    }
  };

  nextSearchRes = () => {
    const { setScrollToPage } = this.props;
    const { numPages } = this.state;
    this._currentSearchIndex++;
    let element = this.getSearchElement();
    while (!element && this._currentSearchPage < numPages) {
      this._currentSearchPage++;
      setScrollToPage({ value: this._currentSearchPage - 1 });
      this._currentSearchIndex = 1;
      element = this.getSearchElement();
    }
    // if (!element) {
    //   this._currentSearchPage = 1;
    //   this._currentSearchIndex = 1;
    //   element = this.getSearchElement();
    // }
    if (element) {
      setScrollToPage({ value: this._currentSearchPage - 1 });
      element.scrollIntoView();
    }
  };

  onAreaSelectionToggle = () => {
    const {
      setCurrentSelection,
      toggleAreaSelectionEnable,
      setNeedForceUpdate,
      areaSelectionEnable,
    } = this.props;
    const textLayers = document.querySelectorAll(
      '.react-pdf__Page__textContent'
    );
    this.textLayerZIndex = areaSelectionEnable.value ? 5 : 1;
    if (areaSelectionEnable) {
      setCurrentSelection(null);
    }
    toggleAreaSelectionEnable();
    textLayers.forEach((layer) => {
      const { style } = layer;
      style.zIndex = this.textLayerZIndex;
    });
    setNeedForceUpdate({
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
      licenseActive,
      setShowLicenseDialog,
    } = this.props;
    if (licenseActive) {
      const { scale } = this.state;
      let newBookmark = null;
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
      this.props.setNeedForceUpdate({
        value: true,
        tip: 'newAreaSelectionCallback',
      });
    } else {
      setShowLicenseDialog(true);
    }
  };

  onAddBookmark = () => {
    const {
      addBookmark,
      textSelection,
      areaSelection,
      setEditingBookmarkID,
      setCurrentFileHaveChanges,
      saveCurrentProjectTemporary,
      licenseActive,
      setShowLicenseDialog,
    } = this.props;
    if (licenseActive) {
      let newBookmark = null;
      if (
        !areaSelection &&
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
    } else {
      setShowLicenseDialog(true);
    }
  };

  onOpenPDFinExternal = () => {
    try {
      shell.openPath(this.props.currentPdf.path);
    } catch {
      remote.dialog.showMessageBoxSync({
        message: `Can't open file "${this.props.currentPdf.path}"!`,
        title: 'Error',
        type: 'error',
        buttons: ['Ok'],
      });
    }
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
              this.props.setNeedForceUpdate({
                value: true,
                tip: 'After scale setState',
              });
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
  setShowLicenseDialog: licenseActions.setShowLicenseDialog,
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
    licenseActive: state.license.info.active,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(PDFViewer);

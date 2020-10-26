import * as React from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import { StoreType } from '../../reduxStore/store';
import { actions as projectFileActions } from '../../reduxStore/projectFileSlice';
import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import * as appConst from '../../types/textConstants';
import PDFContent, { IPDFdata } from './PDFContent';
import { TEST_BOOKMARKS } from '../../types/bookmark';

// const pdfPath = '/public/example.pdf';

export interface IPDFViewerProps {}
export interface IPDFViewerState {
  pdfData: IPDFdata;
}

class PDFViewer extends React.Component<
  StatePropsType & DispatchPropsType,
  IPDFViewerState
> {
  private containerRef: React.RefObject<any>;

  constructor(props: StatePropsType & DispatchPropsType) {
    super(props);
    this.containerRef = React.createRef();
    this.state = {
      pdfData: { data: new Uint8Array() },
    };
  }

  componentDidMount(): void {
    this.initListeners();
  }

  initListeners = (): void => {
    ipcRenderer.on(appConst.PDF_FILE_CONTENT_RESPONSE, (event, data) => {
      this.setState({ pdfData: { data } });
    });
  };

  onOpenLocalFileClick = () => {
    ipcRenderer.send(appConst.LOAD_PDF_FILE, { path: 'pdf path' });
  };

  render(): React.ReactElement {
    const { pdfData } = this.state;
    return (
      <div className="pdf-viewer" ref={this.containerRef}>
        <div className="open-local-file">
          <button
            type="button"
            className="open-local-file-button"
            onClick={this.onOpenLocalFileClick}
          >
            Open local file (test button)
          </button>
        </div>
        <PDFContent
          pdf={pdfData}
          bookmarks={TEST_BOOKMARKS}
          parentRef={this.containerRef}
        />
      </div>
    );
  }
}

const mapDispatchToProps = {
  setAppState: appStateActions.setAppState,
};

const mapStateToProps = (state: StoreType, ownProps: IPDFViewerProps) => {
  return {};
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(PDFViewer);

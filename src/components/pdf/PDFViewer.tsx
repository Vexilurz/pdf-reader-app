import * as React from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import { StoreType } from '../../reduxStore/store';
import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import * as appConst from '../../types/textConstants';
import PDFContent from './PDFContent';
import { TEST_BOOKMARKS } from '../../types/bookmark';
import { IPDFdata } from '../../types/pdf';

export interface IPDFViewerProps {}
export interface IPDFViewerState {
  pdfData: IPDFdata | null;
}

class PDFViewer extends React.Component<
  StatePropsType & DispatchPropsType,
  IPDFViewerState
> {
  private containerRef: React.RefObject<any>;

  constructor(props: StatePropsType & DispatchPropsType) {
    super(props);
    this.containerRef = React.createRef();
    this.state = { pdfData: null };
  }

  componentDidMount(): void {
    this.initListeners();
  }

  initListeners = (): void => {
    ipcRenderer.on(
      appConst.PDF_FILE_CONTENT_RESPONSE,
      (event, data: Uint8Array) => {
        this.setState({ pdfData: { data } });
      }
    );
  };

  render(): React.ReactElement {
    const { pdfData } = this.state;
    return (
      <div className="pdf-viewer" ref={this.containerRef}>
        <PDFContent
          pdfData={pdfData}
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

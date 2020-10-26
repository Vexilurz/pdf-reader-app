import * as React from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import { StoreType } from '../../reduxStore/store';
import { actions as projectFileActions } from '../../reduxStore/projectFileSlice';
import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import * as appConst from '../../types/textConstants';
import PDFContent from './PDFContent';
import { TEST_BOOKMARKS } from '../../types/bookmark';
import { IPDFdata } from '../../types/pdf';
import { CircularProgress } from '@material-ui/core';

export interface IPDFViewerProps {}
export interface IPDFViewerState {}

class PDFViewer extends React.Component<
  StatePropsType & DispatchPropsType,
  IPDFViewerState
> {
  private containerRef: React.RefObject<any>;

  constructor(props: StatePropsType & DispatchPropsType) {
    super(props);
    this.containerRef = React.createRef();
    this.state = {};
  }

  componentDidMount(): void {
    this.initListeners();
  }

  initListeners = (): void => {
    // ipcRenderer.on(appConst.PDF_FILE_CONTENT_RESPONSE, (event, data) => {
    //   this.setState({ pdfData: { data } });
    // });
  };

  render(): React.ReactElement {
    const { pdf, loading } = this.props;
    return (
      <div className="pdf-viewer" ref={this.containerRef}>
        {loading ? (
          <CircularProgress size={'200px'} />
        ) : (
          <PDFContent
            pdf={pdf}
            bookmarks={TEST_BOOKMARKS}
            parentRef={this.containerRef}
          />
        )}
      </div>
    );
  }
}

const mapDispatchToProps = {
  setAppState: appStateActions.setAppState,
};

const mapStateToProps = (state: StoreType, ownProps: IPDFViewerProps) => {
  return {
    pdf: state.pdfViewer.pdf,
    loading: state.pdfViewer.loading,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(PDFViewer);

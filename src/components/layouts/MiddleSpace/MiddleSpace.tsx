import './middle-space.scss';
import * as React from 'react';
import { connect } from 'react-redux';
import PDFViewer from '../../PDF/PDFViewer';
import StartPage from '../../StartPage/StartPage';
import ProjectEditForm from '../../ProjectEditForm/ProjectEditForm';
import EventEditForm from '../../EventEditForm/EventEditForm';
import { StoreType } from '../../../reduxStore/store';
import * as appConst from '../../../types/textConstants';

export interface IMiddleSpaceProps {}
export interface IMiddleSpaceState {}

class MiddleSpace extends React.Component<
  StatePropsType & DispatchPropsType,
  IMiddleSpaceState
> {
  private containerRef: React.RefObject<any>;

  constructor(props: StatePropsType & DispatchPropsType) {
    super(props);
    this.containerRef = React.createRef();
  }

  componentDidMount() {}

  render(): React.ReactElement {
    const {
      currentAppState,
      leftSidebarWidth,
      rightSidebarWidth,
      mainContainerWidth,
    } = this.props;

    let pageContent = <div>ERROR: Wrong appState current value</div>;
    if (currentAppState === appConst.EMTPY_SCREEN) {
      pageContent = (
        <div className="empty-screen">
          <div>Please select PDF</div>
        </div>
      );
    } else if (currentAppState === appConst.START_PAGE) {
      pageContent = <StartPage />;
    } else if (currentAppState === appConst.PROJECT_EDIT_FORM) {
      pageContent = <ProjectEditForm />;
    } else if (currentAppState === appConst.PDF_VIEWER) {
      pageContent = <PDFViewer parentRef={this.containerRef} />;
    } else if (currentAppState === appConst.EVENT_FORM) {
      pageContent = <EventEditForm />;
    }

    const width = mainContainerWidth - leftSidebarWidth - rightSidebarWidth;

    return (
      <div
        className="middle-space"
        ref={this.containerRef}
        style={{
          marginLeft: leftSidebarWidth,
          width,
        }}
      >
        {pageContent}
      </div>
    );
  }
}

const mapDispatchToProps = {};

const mapStateToProps = (state: StoreType, ownProps: IMiddleSpaceProps) => {
  return {
    currentAppState: state.appState.current,
    leftSidebarWidth: state.appState.leftSidebarWidth,
    rightSidebarWidth: state.appState.rightSidebarWidth,
    mainContainerWidth: state.appState.mainContainerWidth,
  };
};

type DispatchPropsType = typeof mapDispatchToProps;
type StatePropsType = ReturnType<typeof mapStateToProps>;

export default connect(mapStateToProps, mapDispatchToProps)(MiddleSpace);

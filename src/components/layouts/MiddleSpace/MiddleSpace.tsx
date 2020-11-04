import './middle-space.scss';
import * as React from 'react';
import { connect } from 'react-redux';
import PDFViewer from '../../PDF/PDFViewer';
import StartPage from '../../StartPage/StartPage';
import ProjectEditForm from '../../ProjectEditForm/ProjectEditForm';
import EventEditForm from '../../EventEditForm/EventEditForm';
import { StoreType } from '../../../reduxStore/store';
import { actions as projectFileActions } from '../../../reduxStore/projectFileSlice';
import { actions as appStateActions } from '../../../reduxStore/appStateSlice';
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
    const { currentAppState, saveCurrentProject, setAppState } = this.props;

    let pageContent = <div>ERROR: Wrong appState current value</div>;
    if (currentAppState === appConst.START_PAGE) {
      pageContent = <StartPage />;
    } else if (currentAppState === appConst.PROJECT_EDIT_FORM) {
      pageContent = <ProjectEditForm />;
    } else if (currentAppState === appConst.PDF_VIEWER) {
      pageContent = <PDFViewer parentRef={this.containerRef} />;
    } else if (currentAppState === appConst.EVENT_FORM) {
      pageContent = <EventEditForm />;
    }

    return (
      <div className="middle-space" ref={this.containerRef}>
        <button
          type="button"
          className="save-project-button"
          onClick={() => {
            saveCurrentProject();
          }}
        >
          [temporary] Save project
        </button>
        <button
          type="button"
          className="edit-project-button"
          onClick={() => {
            setAppState(appConst.PROJECT_EDIT_FORM);
          }}
        >
          [temporary] Edit project
        </button>
        {pageContent}
      </div>
    );
  }
}

const mapDispatchToProps = {
  saveCurrentProject: projectFileActions.saveCurrentProject,
  setAppState: appStateActions.setAppState,
};

const mapStateToProps = (state: StoreType, ownProps: IMiddleSpaceProps) => {
  return {
    currentAppState: state.appState.current,
  };
};

type DispatchPropsType = typeof mapDispatchToProps;
type StatePropsType = ReturnType<typeof mapStateToProps>;

export default connect(mapStateToProps, mapDispatchToProps)(MiddleSpace);

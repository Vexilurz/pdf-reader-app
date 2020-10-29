import './middle-space.scss';
import * as React from 'react';
import { connect } from 'react-redux';
import PDFViewer from '../../PDF/PDFViewer';
import StartPage from '../../StartPage/StartPage';
import NewFileForm from '../../NewFileForm/NewFileForm';
import EventEditForm from '../../EventEditForm/EventEditForm';
import { StoreType } from '../../../reduxStore/store';
import { actions as projectFileActions } from '../../../reduxStore/projectFileSlice';
import * as appConst from '../../../types/textConstants';

export interface IMiddleSpaceProps {
  visible: boolean;
}
export interface IMiddleSpaceState {}

class MiddleSpace extends React.Component<
  StatePropsType & DispatchPropsType,
  IMiddleSpaceState
> {
  componentDidMount() {}

  render(): React.ReactElement {
    const { visible, currentAppState } = this.props;
    const isVisible = visible ? 'visible' : 'hidden';

    let pageContent = <div>ERROR: Wrong appState current value</div>;
    if (currentAppState === appConst.START_PAGE) {
      pageContent = <StartPage />;
    } else if (currentAppState === appConst.NEW_FILE_FORM) {
      pageContent = <NewFileForm />;
    } else if (currentAppState === appConst.PDF_VIEWER) {
      pageContent = <PDFViewer />;
    } else if (currentAppState === appConst.EVENT_FORM) {
      pageContent = <EventEditForm />;
    }

    return (
      <div className="middle-space" style={{ visibility: isVisible }}>
        <button
          type="button"
          className="save-project-button"
          onClick={() => {
            this.props.saveCurrentProject();
          }}
        >
          [temporary button] Save project
        </button>
        {pageContent}
      </div>
    );
  }
}

const mapDispatchToProps = {
  saveCurrentProject: projectFileActions.saveCurrentProject,
};

const mapStateToProps = (state: StoreType, ownProps: IMiddleSpaceProps) => {
  return {
    currentAppState: state.appState.current,
    visible: ownProps.visible,
  };
};

type DispatchPropsType = typeof mapDispatchToProps;
type StatePropsType = ReturnType<typeof mapStateToProps>;

export default connect(mapStateToProps, mapDispatchToProps)(MiddleSpace);

import './left-bar.scss';
import * as React from 'react';
import { connect } from 'react-redux';
import { StoreType } from '../../../reduxStore/store';
import * as appConst from '../../../types/textConstants';
import EventsArea from '../../EventsArea/EventsArea';
import { actions as projectFileActions } from '../../../reduxStore/projectFileSlice';
import { actions as appStateActions } from '../../../reduxStore/appStateSlice';

export interface ILeftBarProps {}
export interface ILeftBarState {}

class LeftBar extends React.Component<
  StatePropsType & DispatchPropsType,
  ILeftBarState
> {
  componentDidMount() {}

  render(): React.ReactElement {
    const { currentAppState, saveCurrentProject, setAppState } = this.props;
    const isVisible =
      currentAppState === appConst.PDF_VIEWER ||
      currentAppState === appConst.EMTPY_SCREEN ||
      currentAppState === appConst.EVENT_FORM
        ? 'visible'
        : 'hidden';

    return (
      <div className="left-bar" style={{ visibility: isVisible }}>
        <div className="project-controls">
          <button
            type="button"
            className="save-project-button btn btn-primary"
            onClick={() => {
              saveCurrentProject();
            }}
          >
            Save project
          </button>
          <button
            type="button"
            className="edit-project-button btn btn-primary"
            onClick={() => {
              setAppState(appConst.PROJECT_EDIT_FORM);
            }}
          >
            Edit project
          </button>
        </div>
        <EventsArea />
      </div>
    );
  }
}

const mapDispatchToProps = {
  saveCurrentProject: projectFileActions.saveCurrentProject,
  setAppState: appStateActions.setAppState,
};

const mapStateToProps = (state: StoreType, ownProps: ILeftBarProps) => {
  return {
    currentAppState: state.appState.current,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(LeftBar);

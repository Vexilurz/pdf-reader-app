import './left-bar.scss';
import * as React from 'react';
import { connect } from 'react-redux';
import { StoreType } from '../../../reduxStore/store';
import * as appConst from '../../../types/textConstants';
import EventsArea from '../../EventsArea/EventsArea';
import { actions as projectFileActions } from '../../../reduxStore/projectFileSlice';
import { actions as appStateActions } from '../../../reduxStore/appStateSlice';
import ResizePanel from 'react-resize-panel';

export interface ILeftBarProps {}
export interface ILeftBarState {}

class LeftBar extends React.Component<
  StatePropsType & DispatchPropsType,
  ILeftBarState
> {
  private resizeRef: React.RefObject<any>;

  constructor(props: StatePropsType & DispatchPropsType) {
    super(props);
    this.resizeRef = React.createRef();
  }

  componentDidMount() {
    // this.resizeRef?.current?.width = '400px';
  }

  render(): React.ReactElement {
    const { currentAppState, saveCurrentProject, setAppState } = this.props;
    const isVisible =
      currentAppState === appConst.PDF_VIEWER ||
      currentAppState === appConst.EMTPY_SCREEN ||
      currentAppState === appConst.EVENT_FORM;

    return isVisible ? (
      <ResizePanel
        direction="e"
        handleClass="left-bar"
        ref={this.resizeRef}
        style={{ width: '350px' }}
      >
        <div
          className="left-bar"
          style={{ width: this.resizeRef?.current?.width }}
        >
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
      </ResizePanel>
    ) : (
      <></>
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

import './left-bar.scss';
import * as React from 'react';
import { connect } from 'react-redux';
import ResizePanel from 'react-resize-panel';
import Measure from 'react-measure';
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
  handleResize = (contentRect) => {
    const { leftSidebarWidth, setLeftSidebarWidth } = this.props;
    if (leftSidebarWidth !== contentRect?.bounds?.width) {
      setLeftSidebarWidth(contentRect?.bounds?.width);
    }
  };

  render(): React.ReactElement {
    const { currentAppState, saveCurrentProject, setAppState } = this.props;
    const isVisible =
      currentAppState === appConst.PDF_VIEWER ||
      currentAppState === appConst.EMTPY_SCREEN;

    return isVisible ? (
      <ResizePanel
        direction="e"
        handleClass="left-bar"
        style={{ width: '350px' }}
      >
        <Measure bounds onResize={this.handleResize}>
          {({ measureRef }) => (
            <div className="left-bar" ref={measureRef}>
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
          )}
        </Measure>
      </ResizePanel>
    ) : (
      <></>
    );
  }
}

const mapDispatchToProps = {
  saveCurrentProject: projectFileActions.saveCurrentProject,
  setAppState: appStateActions.setAppState,
  setLeftSidebarWidth: appStateActions.setLeftSidebarWidth,
};

const mapStateToProps = (state: StoreType, ownProps: ILeftBarProps) => {
  return {
    currentAppState: state.appState.current,
    leftSidebarWidth: state.appState.leftSidebarWidth,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(LeftBar);

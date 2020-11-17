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
import { ipcRenderer } from 'electron';
import { IProjectFileWithPath } from '../../../types/projectFile';

export interface ILeftBarProps {}
export interface ILeftBarState {}

class LeftBar extends React.Component<
  StatePropsType & DispatchPropsType,
  ILeftBarState
> {
  componentDidMount(): void {
    this.initListeners();
  }

  initListeners = (): void => {
    ipcRenderer.on(appConst.NEW_FILE_DIALOG_RESPONSE, (event, response) => {
      const {
        saveCurrentProject,
        currentProjectFile,
        setCurrentFile,
        addFileToOpened,
      } = this.props;
      const newFile: IProjectFileWithPath = {
        ...currentProjectFile,
        path: response.path,
      };
      setCurrentFile(newFile);
      addFileToOpened(newFile); // just for update filename in project tabs...
      saveCurrentProject();
      ipcRenderer.send(appConst.ADD_TO_RECENT_PROJECTS, newFile);
    });
  };

  handleResize = (contentRect) => {
    const { leftSidebarWidth, setLeftSidebarWidth } = this.props;
    if (Math.abs(leftSidebarWidth - contentRect?.bounds?.width) > 5) {
      setLeftSidebarWidth(contentRect?.bounds?.width);
    }
  };

  saveCurrentProjectClick = () => {
    const { currentProjectFile, saveCurrentProject } = this.props;
    if (currentProjectFile.path === '')
      ipcRenderer.send(appConst.SHOW_SAVE_FILE_DIALOG);
    else saveCurrentProject();
  };

  render(): React.ReactElement {
    const { currentAppState, setAppState } = this.props;
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
                  onClick={this.saveCurrentProjectClick}
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
  setCurrentFile: projectFileActions.setCurrentFile,
  addFileToOpened: projectFileActions.addFileToOpened,
};

const mapStateToProps = (state: StoreType, ownProps: ILeftBarProps) => {
  return {
    currentAppState: state.appState.current,
    leftSidebarWidth: state.appState.leftSidebarWidth,
    currentProjectFile: state.projectFile.currentProjectFile,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(LeftBar);

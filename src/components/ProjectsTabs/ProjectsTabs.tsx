/* eslint-disable */
import './projects-tabs.scss';
import * as pathLib from 'path';
import * as React from 'react';
import { connect } from 'react-redux';
import { StoreType } from '../../reduxStore/store';
import { actions as projectFileActions } from '../../reduxStore/projectFileSlice';
import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import * as appConst from '../../types/textConstants';
import { getNewFileWithPath } from '../../types/projectFile';
import { remote, ipcRenderer } from 'electron';
import { waitForDebugger } from 'inspector';

export interface IProjectsTabsProps {}
export interface IProjectsTabsState {}

const waitFor = (test, expectedValue, msec, callback) => {
  // Check if condition met. If not, re-check later (msec).
  while (test() !== expectedValue) {
    setTimeout(() => {
      waitFor(test, expectedValue, msec, callback);
    }, msec);
    return;
  }
  // Condition finally met. callback() can be executed.
  callback();
};

class ProjectsTabs extends React.Component<
  StatePropsType & DispatchPropsType,
  IProjectsTabsState
> {
  private prjSaved: boolean;

  constructor(props: StatePropsType & DispatchPropsType) {
    super(props);
    this.prjSaved = true;
  }

  componentDidMount() {
    ipcRenderer.on(appConst.SAVE_CURRENT_PROJECT_DONE, (event, payload) => {
      this.prjSaved = true;
    });
  }

  render(): React.ReactElement {
    const {
      openedProjectFiles,
      currentProjectFile,
      setAppState,
      setCurrentFile,
      saveCurrentProjectTemporary,
      saveCurrentProject,
      saveProjectByID,
      deleteFileFromOpened,
      currentAppState,
    } = this.props;
    const ACTIVE = ' active';
    const startPageActive =
      currentAppState === appConst.START_PAGE ? ACTIVE : '';
    return (
      <ul className="nav nav-tabs projects-tabs">
        {openedProjectFiles.map((project, index) => {
          const active = currentProjectFile.id === project.id ? ACTIVE : '';
          return (
            <li
              className="nav-item project-tab"
              key={'project-tab-key' + index}
            >
              <p
                className={'nav-link' + active}
                href="#"
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentProjectFile.id !== project.id) {
                    saveCurrentProjectTemporary();
                    setCurrentFile(project);
                    setAppState(appConst.EMTPY_SCREEN);
                  }
                }}
              >
                {/* {project.haveChanges ? '* ' : ''} */}
                {project.content?.name} ({pathLib.basename(project.path)}){' '}
                <a
                  // class="nav-link"
                  href="#"
                  onClick={async (e) => {
                    e.stopPropagation();

                    let response = -1;
                    const closePrj = () => {
                      waitFor(
                        () => {
                          return this.prjSaved;
                        },
                        true,
                        100,
                        () => {
                          if (response !== 2) {
                            if (currentProjectFile.id === project.id) {
                              setAppState(appConst.START_PAGE);
                            }
                            deleteFileFromOpened(project.id);
                          }
                        }
                      );
                    };

                    if (project.haveChanges) {
                      const res = await remote.dialog.showMessageBox({
                        message: `Save changes in "${project.path}"?`,
                        title: 'Question',
                        type: 'question',
                        buttons: ['Yes', 'No', 'Cancel'],
                      });
                      response = res.response;
                      if (response === 0) {
                        this.prjSaved = false;
                        if (currentProjectFile.id === project.id) {
                          saveCurrentProject();
                        } else {
                          saveProjectByID(project.id);
                        }
                      }
                      closePrj();
                    } else closePrj();
                  }}
                >
                  x
                </a>
              </p>
            </li>
          );
        })}
        <li className="nav-item project-tab" key="project-tab-add">
          <a
            className={'nav-link' + startPageActive}
            href="#"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentFile(getNewFileWithPath(''));
              setAppState(appConst.START_PAGE);
            }}
          >
            +
          </a>
        </li>
      </ul>
    );
  }
}

const mapDispatchToProps = {
  setCurrentFile: projectFileActions.setCurrentFile,
  saveCurrentProjectTemporary: projectFileActions.saveCurrentProjectTemporary,
  saveCurrentProject: projectFileActions.saveCurrentProject,
  saveProjectByID: projectFileActions.saveProjectByID,
  deleteFileFromOpened: projectFileActions.deleteFileFromOpened,
  setAppState: appStateActions.setAppState,
};

const mapStateToProps = (state: StoreType, ownProps: IProjectsTabsProps) => {
  return {
    currentProjectFile: state.projectFile.currentProjectFile,
    openedProjectFiles: state.projectFile.openedProjectFiles,
    currentAppState: state.appState.current,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(ProjectsTabs);

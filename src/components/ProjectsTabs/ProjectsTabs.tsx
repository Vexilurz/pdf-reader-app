import './projects-tabs.scss';
import * as React from 'react';
import { connect } from 'react-redux';
import { StoreType } from '../../reduxStore/store';
import { actions as projectFileActions } from '../../reduxStore/projectFileSlice';
import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import * as appConst from '../../types/textConstants';
import { getNewFile } from '../../types/projectFile';
import { deletePathFromFilename } from '../../utils/commonUtils';

export interface IProjectsTabsProps {}
export interface IProjectsTabsState {}

class ProjectsTabs extends React.Component<
  StatePropsType & DispatchPropsType,
  IProjectsTabsState
> {
  componentDidMount() {}

  render(): React.ReactElement {
    const {
      openedProjectFiles,
      currentProjectFile,
      setAppState,
      setCurrentFile,
      saveCurrentProjectTemporary,
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
              <a
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
                {project.content?.name} ({deletePathFromFilename(project.path)}){' '}
                <a
                  // class="nav-link"
                  href="#"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentProjectFile.id === project.id) {
                      setAppState(appConst.START_PAGE);
                    }
                    deleteFileFromOpened(project.id);
                  }}
                >
                  x
                </a>
              </a>
            </li>
          );
        })}
        <li className="nav-item project-tab" key="project-tab-add">
          <a
            className={'nav-link' + startPageActive}
            href="#"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentFile({ path: '', content: getNewFile('') });
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

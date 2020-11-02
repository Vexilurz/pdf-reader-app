import './projects-tabs.scss';
import * as React from 'react';
import { connect } from 'react-redux';
import { StoreType } from '../../reduxStore/store';
import { actions as projectFileActions } from '../../reduxStore/projectFileSlice';
import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import * as appConst from '../../types/textConstants';
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
      deleteFileFromOpened,
    } = this.props;
    return (
      <div className="projects-tabs">
        {openedProjectFiles.map((project, index) => {
          return (
            <div className="project-tab" key={'project-tab-key' + index}>
              <button
                type="button"
                className="project-button"
                key={'project-button-key' + index}
                onClick={() => {
                  setCurrentFile(project);
                  setAppState(appConst.PDF_VIEWER);
                }}
              >
                {project.content?.name} ({deletePathFromFilename(project.path)})
              </button>
              <button
                type="button"
                className="close-button"
                key={'close-button-key' + index}
                onClick={() => {
                  if (currentProjectFile.path === project.path) {
                    setAppState(appConst.START_PAGE);
                  }
                  deleteFileFromOpened(project.path);
                }}
              >
                x
              </button>
            </div>
          );
        })}
        <button
          type="button"
          className="project-tab"
          key="project-tab-add"
          onClick={() => {
            setAppState(appConst.START_PAGE);
          }}
        >
          +
        </button>
      </div>
    );
  }
}

const mapDispatchToProps = {
  setCurrentFile: projectFileActions.setCurrentFile,
  deleteFileFromOpened: projectFileActions.deleteFileFromOpened,
  setAppState: appStateActions.setAppState,
};

const mapStateToProps = (state: StoreType, ownProps: IProjectsTabsProps) => {
  return {
    currentProjectFile: state.projectFile.currentProjectFile,
    openedProjectFiles: state.projectFile.openedProjectFiles,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(ProjectsTabs);

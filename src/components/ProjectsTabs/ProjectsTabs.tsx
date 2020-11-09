import './projects-tabs.scss';
import * as React from 'react';
import { connect } from 'react-redux';
import Alert from 'react-bootstrap/Alert';
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
    } = this.props;
    return (
      <div className="projects-tabs">
        {openedProjectFiles.map((project, index) => {
          return (
            <Alert
              variant="primary"
              className="project-tab"
              key={'project-tab-key' + index}
              onClick={() => {
                if (currentProjectFile.path !== project.path) {
                  saveCurrentProjectTemporary();
                  setCurrentFile(project);
                  setAppState(appConst.EMTPY_SCREEN);
                }
              }}
            >
              {project.content?.name} ({deletePathFromFilename(project.path)}){' '}
              <Alert.Link
                href="#"
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentProjectFile.path === project.path) {
                    setAppState(appConst.START_PAGE);
                  }
                  deleteFileFromOpened(project.path);
                }}
              >
                x
              </Alert.Link>
            </Alert>
          );
        })}
        <Alert
          className="project-tab"
          key="project-tab-add"
          variant="primary"
          onClick={() => {
            setCurrentFile({ path: '', content: getNewFile('') });
            setAppState(appConst.START_PAGE);
          }}
        >
          +
        </Alert>
      </div>
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
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(ProjectsTabs);

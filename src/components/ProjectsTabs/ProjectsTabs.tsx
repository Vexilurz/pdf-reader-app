import './projects-tabs.scss';
import * as React from 'react';
import { ipcRenderer } from 'electron';
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
    const { openedProjectFiles, setAppState, setCurrentFile } = this.props;
    return (
      <div className="projects-tabs">
        {openedProjectFiles.map((project, index) => {
          return (
            <button
              type="button"
              className="project-tab"
              key={'project-tab-key' + index}
              onClick={() => {
                setCurrentFile(project);
                setAppState({ current: appConst.PDF_VIEWER });
              }}
            >
              {project.content?.name} ({deletePathFromFilename(project.path)})
            </button>
          );
        })}
        <button
          type="button"
          className="project-tab"
          key="project-tab-add"
          onClick={() => {
            setCurrentFile(null);
            setAppState({ current: appConst.START_PAGE });
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
  setAppState: appStateActions.setAppState,
};

const mapStateToProps = (state: StoreType, ownProps: IProjectsTabsProps) => {
  return {
    currentProjectFile: state.projectFile.current,
    openedProjectFiles: state.projectFile.opened,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(ProjectsTabs);

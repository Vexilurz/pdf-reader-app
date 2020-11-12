import './project-edit-form.scss';
import * as React from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import { StoreType } from '../../reduxStore/store';
import { actions as projectFileActions } from '../../reduxStore/projectFileSlice';
import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import { IProjectFileWithPath, getNewFile } from '../../types/projectFile';
import * as appConst from '../../types/textConstants';

export interface IProjectEditFormProps {}
export interface IProjectEditFormState {
  path: string;
}

class ProjectEditForm extends React.Component<
  StatePropsType & DispatchPropsType,
  IProjectEditFormState
> {
  private projectNameRef: React.RefObject<any>;

  constructor(props: StatePropsType & DispatchPropsType) {
    super(props);
    this.projectNameRef = React.createRef();
    this.state = {
      path: props.currentProjectFile.path,
    };
  }

  componentDidMount(): void {
    this.initListeners();
    this.projectNameRef.current.value = this.props.currentProjectFile.content.name;
  }

  initListeners = (): void => {
    ipcRenderer.on(appConst.NEW_FILE_DIALOG_RESPONSE, (event, response) => {
      this.setState({ path: response.path });
    });
  };

  onSaveChangesClick = (): void => {
    const { setCurrentFile, setAppState, addFileToOpened } = this.props;
    const { path } = this.state;
    if (path !== '') {
      const newFile: IProjectFileWithPath = {
        path,
        content: getNewFile(this.projectNameRef.current.value),
      };
      newFile.content.events = this.props.currentProjectFile.content.events;
      setCurrentFile(newFile);
      addFileToOpened(newFile);
      setAppState(appConst.PDF_VIEWER);
      ipcRenderer.send(appConst.ADD_TO_RECENT_PROJECTS, newFile);
      // todo: save file?
    } else {
      // todo: show message "please set save path to new file"
      setAppState(appConst.START_PAGE);
    }
  };

  onSetCurrentFilePathClick = (): void => {
    ipcRenderer.send(appConst.SHOW_NEW_FILE_DIALOG);
  };

  render(): React.ReactElement {
    const { path } = this.state;
    const { setAppState, currentProjectFile } = this.props;
    return (
      <div className="project-edit-form">
        <div className="project-name">
          {'Name:   '}
          <input
            className="project-name-input"
            type="text"
            ref={this.projectNameRef}
            style={{
              width: '350px',
            }}
          />
        </div>
        <div className="set-file-path">
          <button
            type="button"
            className="set-file-path-button edit-project-control-button btn btn-primary"
            onClick={this.onSetCurrentFilePathClick}
          >
            Set file path
          </button>
          Path to save: {path}
        </div>
        <div className="control-buttons">
          <button
            type="button"
            className="save-changes-button edit-project-control-button btn btn-primary"
            onClick={this.onSaveChangesClick}
          >
            Save
          </button>
          <button
            type="button"
            className="cancel-button edit-project-control-button btn btn-primary"
            onClick={() => {
              if (currentProjectFile.path !== '')
                setAppState(appConst.EMTPY_SCREEN);
              else setAppState(appConst.START_PAGE);
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = {
  setCurrentFile: projectFileActions.setCurrentFile,
  addFileToOpened: projectFileActions.addFileToOpened,
  setAppState: appStateActions.setAppState,
};

const mapStateToProps = (state: StoreType, ownProps: IProjectEditFormProps) => {
  return {
    currentProjectFile: state.projectFile.currentProjectFile,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(ProjectEditForm);

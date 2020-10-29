import './project-edit-form.scss';
import * as React from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
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
      path: '',
    };
  }

  componentDidMount(): void {
    this.initListeners();
  }

  initListeners = (): void => {
    ipcRenderer.on(appConst.NEW_FILE_DIALOG_RESPONSE, (event, response) => {
      this.setState({ path: response.path });
    });
  };

  onCreateNewFileClick = (): void => {
    const { setCurrentFile, setAppState, addFileToOpened } = this.props;
    const { path } = this.state;
    if (path !== '') {
      const newFile: IProjectFileWithPath = {
        path,
        content: getNewFile(this.projectNameRef.current.value),
      };
      setCurrentFile(newFile);
      addFileToOpened(newFile);
      setAppState(appConst.PDF_VIEWER);
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
    return (
      <div className="project-edit-form">
        <div className="project-name">
          Name:
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
            className="set-file-path-button"
            onClick={this.onSetCurrentFilePathClick}
          >
            Set file path
          </button>
          Path to save: {path}
        </div>
        <div className="create-new-file">
          <button
            type="button"
            className="create-new-file-button"
            onClick={this.onCreateNewFileClick}
          >
            Create file!
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
  return {};
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(ProjectEditForm);

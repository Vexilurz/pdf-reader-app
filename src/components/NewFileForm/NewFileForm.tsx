import './new-file-form.scss';
import * as React from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import {
  actions as projectFileActions,
  IProjectFileState,
} from '../../reduxStore/projectFileSlice';
import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import * as appConst from '../../types/textConstants';

export interface INewFileFormProps {}
export interface INewFileFormState {
  path: string;
}

class NewFileForm extends React.Component<
  INewFileFormProps & DispatchPropsType,
  INewFileFormState
> {
  private projectName = '';

  constructor(props: INewFileFormProps & DispatchPropsType) {
    super(props);
    this.state = {
      path: '',
    };
  }

  componentDidMount(): void {
    this.initListeners();
  }

  initListeners = (): void => {
    ipcRenderer.on(appConst.NEW_FILE_DIALOG_RESPONSE, (event, response) => {
      console.log(response);
      this.setState({ path: response.path });
    });
  };

  onCreateNewFileClick = (): void => {
    const { setFile, setAppState } = this.props;
    const { path } = this.state;
    if (path !== '') {
      const newFile: IProjectFileState = {
        path,
        content: {
          name: this.projectName,
          events: [],
        },
      };
      setFile(newFile);
      setAppState({ current: appConst.PDF_VIEWER });
      //todo: save file?
    } else {
      //todo: show message "please set save path to new file"
    }
  };

  onSetFilePathClick = (): void => {
    ipcRenderer.send(appConst.SHOW_NEW_FILE_DIALOG);
  };

  render(): React.ReactElement {
    const { path } = this.state;
    return (
      <div className="new-file-form">
        <div className="project-name">
          Name:
          <input
            className="project-name-input"
            type="text"
            style={{
              width: '350px',
            }}
            onChange={(event) => {
              this.projectName = event.target.value;
            }}
          />
        </div>
        <div className="set-file-path">
          <button
            type="button"
            className="set-file-path-button"
            onClick={this.onSetFilePathClick}
          >
            Set file path
          </button>
          Path to save:{path}
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
  setFile: projectFileActions.setFile,
  setAppState: appStateActions.setAppState,
};

type DispatchPropsType = typeof mapDispatchToProps;

export default connect(null, mapDispatchToProps)(NewFileForm);

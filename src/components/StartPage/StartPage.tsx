import './start-page.scss';
import * as React from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { StoreType } from '../../reduxStore/store';
import { actions as projectFileActions } from '../../reduxStore/projectFileSlice';
import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import { actions as licenseActions } from '../../reduxStore/licenseSlice';
import * as appConst from '../../types/textConstants';
import {
  IProjectFileWithPath,
  getNewFileWithPath,
} from '../../types/projectFile';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

export interface IStartPageProps {}
export interface IStartPageState {
  recent: any;
}

class StartPage extends React.Component<
  StatePropsType & DispatchPropsType,
  IStartPageState
> {
  constructor(props: StatePropsType & DispatchPropsType) {
    super(props);
    this.state = {
      recent: null,
    };
  }

  componentDidMount(): void {
    this.initListeners();
    ipcRenderer.send(appConst.GET_RECENT_PROJECTS);
  }

  initListeners = (): void => {
    ipcRenderer.on(
      appConst.OPEN_FILE_DIALOG_RESPONSE,
      (event, response: IProjectFileWithPath) => {
        const { setCurrentFile, setAppState, addFileToOpened } = this.props;
        setCurrentFile(response);
        addFileToOpened(response);
        setAppState(appConst.EMTPY_SCREEN);
        ipcRenderer.send(appConst.ADD_TO_RECENT_PROJECTS, response);
      }
    );
    ipcRenderer.on(appConst.GET_RECENT_PROJECTS_RESPONSE, (event, recent) => {
      this.setState({ recent });
    });
  };

  onOpenFileClick = (): void => {
    ipcRenderer.send(appConst.OPEN_FILE);
  };

  onNewFileClick = (): void => {
    const {
      setAppState,
      setCurrentFile,
      addFileToOpened,
      licenseActive,
      setShowLicenseDialog,
    } = this.props;
    if (licenseActive) {
      const newFile: IProjectFileWithPath = getNewFileWithPath(
        'Your project name'
      );
      setCurrentFile(newFile);
      addFileToOpened(newFile);
      setAppState(appConst.PROJECT_EDIT_FORM);
    } else {
      setShowLicenseDialog(true);
    }
  };

  render(): React.ReactElement {
    const { recent } = this.state;
    const { setAppState } = this.props;
    return (
      <div className="start-page">
        <div className="start-page-sidebar">
          <button
            type="button"
            className="new-file-button btn btn-primary"
            onClick={this.onNewFileClick}
          >
            New file
          </button>
          <button
            type="button"
            className="open-file-button btn btn-primary"
            onClick={this.onOpenFileClick}
          >
            Open file
          </button>
        </div>
        <div className="start-page-recent">
          Recent projects
          {recent?.map((item, index) => {
            return (
              <div key={'recent-item' + index} className="recent-item">
                <button
                  type="button"
                  className="recent-project-button btn btn-link"
                  key={'recent-project-key' + index}
                  onClick={() => {
                    ipcRenderer.send(appConst.OPEN_FILE, item.path);
                    setAppState(appConst.EMTPY_SCREEN);
                  }}
                >
                  {`${item.name} (${item.path})`}
                </button>
                <button
                  type="button"
                  className="delete-recent-project-button btn-icon"
                  key={'delete-recent-key' + index}
                  onClick={() => {
                    ipcRenderer.send(
                      appConst.DELETE_FROM_RECENT_PROJECTS,
                      item
                    );
                  }}
                >
                  <FontAwesomeIcon color={'red'} icon={faTimes} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: StoreType, ownProps: IStartPageProps) => {
  return {
    licenseActive: state.license.info.active,
  };
};

const mapDispatchToProps = {
  setCurrentFile: projectFileActions.setCurrentFile,
  addFileToOpened: projectFileActions.addFileToOpened,
  setAppState: appStateActions.setAppState,
  setShowLicenseDialog: licenseActions.setShowLicenseDialog,
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(StartPage);

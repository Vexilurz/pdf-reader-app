import './start-page.scss';
import * as React from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import { StoreType } from '../../reduxStore/store';
import { actions as projectFileActions } from '../../reduxStore/projectFileSlice';
import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import * as appConst from '../../types/textConstants';
import { IProjectFileWithPath } from '../../types/projectFile';

export interface IStartPageProps {}
export interface IStartPageState {}

class StartPage extends React.Component<
  StatePropsType & DispatchPropsType,
  IStartPageState
> {
  componentDidMount(): void {
    this.initListeners();
  }

  initListeners = (): void => {
    ipcRenderer.on(
      appConst.OPEN_FILE_DIALOG_RESPONSE,
      (event, response: IProjectFileWithPath) => {
        const { setCurrentFile, setAppState, addFileToOpened } = this.props;
        setCurrentFile(response);
        addFileToOpened(response);
        setAppState({ current: appConst.PDF_VIEWER });
      }
    );
  };

  onOpenFileClick = (): void => {
    ipcRenderer.send(appConst.SHOW_OPEN_FILE_DIALOG);
  };

  onNewFileClick = (): void => {
    const { setAppState } = this.props;
    setAppState({ current: appConst.NEW_FILE_FORM });
  };

  render(): React.ReactElement {
    return (
      <div className="start-page">
        <div className="start-page-sidebar">
          <button
            type="button"
            className="new-file-button"
            onClick={this.onNewFileClick}
          >
            New file
          </button>
          <button
            type="button"
            className="open-file-button"
            onClick={this.onOpenFileClick}
          >
            Open file
          </button>
        </div>
        <div className="start-page-recent">Recent projects</div>
      </div>
    );
  }
}

const mapStateToProps = (state: StoreType, ownProps: IStartPageProps) => {
  return {
    // visible: ownProps.visible,
  };
};

const mapDispatchToProps = {
  setCurrentFile: projectFileActions.setCurrentFile,
  addFileToOpened: projectFileActions.addFileToOpened,
  setAppState: appStateActions.setAppState,
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(StartPage);

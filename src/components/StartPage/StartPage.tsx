import './start-page.scss';
import * as React from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import { actions as projectFileActions } from '../../reduxStore/projectFileSlice';
import { actions as appStateActions } from '../../reduxStore/appStateSlice';

export interface IStartPageProps {}
export interface IStartPageState {}

class StartPage extends React.Component<
  IStartPageProps & DispatchPropsType,
  IStartPageState
> {
  componentDidMount(): void {
    this.initListeners();
  }

  initListeners = (): void => {
    ipcRenderer.on('open-file-dialog-response', (event, response) => {
      console.log(response);
      const { setFile, setAppState } = this.props;
      setFile(response);
      setAppState({ current: 'pdf-viewer' });
    });

    ipcRenderer.on('new-file-dialog-response', (event, response) => {
      console.log(response);
      const { setFile, setAppState } = this.props;
      setFile(response);
      setAppState({ current: 'pdf-viewer' });
    });
  };

  onOpenFileClick = (): void => {
    ipcRenderer.send('show-open-file-dialog');
  };

  onNewFileClick = (): void => {
    ipcRenderer.send('show-new-file-dialog');
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

const mapDispatchToProps = {
  setFile: projectFileActions.setFile,
  setAppState: appStateActions.setAppState,
};

type DispatchPropsType = typeof mapDispatchToProps;

export default connect(null, mapDispatchToProps)(StartPage);

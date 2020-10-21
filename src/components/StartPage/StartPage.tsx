import './start-page.scss';
import * as React from 'react';
import { ipcRenderer } from 'electron';

export interface IStartPageProps {}
export interface IStartPageState {
  openFile: string;
  newFile: string;
}

export default class StartPage extends React.Component<
  IStartPageProps,
  IStartPageState
> {
  constructor(props: IStartPageProps) {
    super(props);
    this.state = {
      openFile: '',
      newFile: '',
    };
  }

  componentDidMount(): void {
    this.initListeners();
  }

  initListeners = (): void => {
    ipcRenderer.on('open-file-dialog-response', (event, responce) => {
      this.setState({ openFile: responce.path });
    });
    ipcRenderer.on('new-file-dialog-response', (event, responce) => {
      this.setState({ newFile: responce.path });
    });
  };

  onOpenFileClick = (): void => {
    ipcRenderer.send('show-open-file-dialog');
  };

  onNewFileClick = (): void => {
    ipcRenderer.send('show-new-file-dialog');
  };

  render(): React.ReactElement {
    const { openFile, newFile } = this.state;
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
        <div className="start-page-recent">
          <div>New file: {newFile}</div>
          <div>Open file: {openFile}</div>
        </div>
      </div>
    );
  }
}

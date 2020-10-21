import './start-page.scss';
import * as React from 'react';
import { ipcRenderer } from 'electron';
import FileDialogButton from '../FileDialogButton/FileDialogButton';

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
    ipcRenderer.on('open-file-dialog-response', (event, responce) => {
      console.log(event, responce);
    });
  }

  componentDidMount() {
    // this.onNewFileChoose.bind(this);
    // this.onOpenFileChoose.bind(this);
  }

  onNewFileChoose = (fileName: string) => {
    console.log('im in new file');
    this.setState({ newFile: fileName });
  };

  onOpenFileChoose = (fileName: string) => {
    console.log('im in open file');
    this.setState({ openFile: fileName });
  };

  render(): React.ReactElement {
    const { openFile, newFile } = this.state;
    return (
      <div className="start-page">
        <div className="start-page-sidebar">
          <FileDialogButton
            caption="New file"
            onFileChoose={(param) => this.onNewFileChoose(param)}
          />
          <FileDialogButton
            caption="Open file"
            onFileChoose={(param) => this.onOpenFileChoose(param)}
          />
          <button
            type="button"
            onClick={() => {
              ipcRenderer.send('open-file-dialog', 'asdasdasdasd');
            }}
          >
            Go to Foo
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

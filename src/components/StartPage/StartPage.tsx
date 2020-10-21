import './start-page.scss';
import * as React from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import { setFile } from '../../reduxStore/projectFileSlice';
import { setAppState } from '../../reduxStore/appStateSlice';
// import fs from 'fs';
// import { TEST_PROJECT } from '../../types/projectFile';

export interface IStartPageProps {}
export interface IStartPageState {
  // openFile: string;
  // newFile: string;
}

class StartPage extends React.Component<IStartPageProps, IStartPageState> {
  // constructor(props: IStartPageProps & IProjectFileProps) {
  //   super(props);
  //   this.state = {
  //     openFile: '',
  //     newFile: '',
  //   };
  // }

  componentDidMount(): void {
    this.initListeners();
  }

  initListeners = (): void => {
    ipcRenderer.on('open-file-dialog-response', (event, response) => {
      console.log(response);
      this.props.setFile(response);
      this.props.setAppState({ current: 'pdf-viewer' });
      // this.setState({ openFile: response.path });
    });

    ipcRenderer.on('new-file-dialog-response', (event, response) => {
      // fs.writeFile(response.path, JSON.stringify(TEST_PROJECT), (err) => {
      //   if (err) throw err;
      //   console.log('The file has been saved!');
      // });
      console.log(response);
      this.props.setFile(response);
      this.props.setAppState({ current: 'pdf-viewer' });
      // this.setState({ newFile: response.path });
    });
  };

  onOpenFileClick = (): void => {
    ipcRenderer.send('show-open-file-dialog');
  };

  onNewFileClick = (): void => {
    ipcRenderer.send('show-new-file-dialog');
  };

  render(): React.ReactElement {
    // const { openFile, newFile } = this.state;
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
          {/* <div>New file: {newFile}</div>
          <div>Open file: {openFile}</div> */}
        </div>
      </div>
    );
  }
}

// const mapStateToProps = function (state, ownProps: IStartPageProps) {
//   return {
//     path: state.projectFile.path,
//     content: state.projectFile.content,
//   };
// };

const mapDispatchToProps = {
  setFile,
  setAppState,
};

export default connect(null, mapDispatchToProps)(StartPage);

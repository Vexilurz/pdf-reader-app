import './start-page.scss';
import * as React from 'react';
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
  }

  componentDidMount() {}

  render(): React.ReactElement {
    const { openFile, newFile } = this.state;
    return (
      <div className="start-page">
        <div className="start-page-sidebar">
          <FileDialogButton
            caption="New file"
            onFileChoose={(fileName: string) => {
              this.setState({ newFile: fileName });
            }}
          />
          <FileDialogButton
            caption="Open file"
            onFileChoose={(fileName: string) => {
              this.setState({ openFile: fileName });
            }}
          />
        </div>
        <div className="start-page-recent">
          <div>New file: {newFile}</div>
          <div>Open file: {openFile}</div>
        </div>
      </div>
    );
  }
}

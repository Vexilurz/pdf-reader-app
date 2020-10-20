import './file-dialog-button.scss';
import * as React from 'react';

export interface IFileDialogButtonProps {
  caption: string;
  onFileChoose(fileName: string): void;
}
export interface IFileDialogButtonState {
  // choosedFile: string;
}

export default class FileDialogButton extends React.Component<
  IFileDialogButtonProps,
  IFileDialogButtonState
> {
  // constructor(props: IFileDialogButtonProps) {
  //   super(props);
  //   this.state = {
  //     choosedFile = '',
  //   };
  // }

  componentDidMount() {}

  render(): React.ReactElement {
    const { caption, onFileChoose } = this.props;
    return (
      <div className="file-dialog-button" id={caption}>
        <label htmlFor="file-upload" className="custom-file-upload">
          {caption}
        </label>
        <input
          id="file-upload"
          type="file"
          className="input-file"
          onChange={(event) => {
            if (event.target.files) {
              const fileName = event.target.files[0].path;
              // this.setState({ choosedFile: fileName });
              onFileChoose(fileName);
            }
          }}
        />
      </div>
    );
  }
}

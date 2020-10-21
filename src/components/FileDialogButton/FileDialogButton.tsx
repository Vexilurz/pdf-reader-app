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
  // this.state = {
  //   choosedFile = '',
  // };
  // this.onChange.bind(this);
  // }

  componentDidMount() {}

  onChange = (event) => {
    const { caption, onFileChoose } = this.props;
    if (event.target.files) {
      const fileName = event.target.files[0].path;
      // this.setState({ choosedFile: fileName });
      console.log(caption, fileName);
      onFileChoose(fileName);
    }
  };

  render(): React.ReactElement {
    const { caption } = this.props;
    const id = 'file-upload-' + caption.toLowerCase().replace(' ', '-');
    return (
      <div className="file-dialog-button" id={caption}>
        <label htmlFor={id} className="custom-file-upload">
          {caption}
        </label>
        <input
          id={id}
          type="file"
          name={caption}
          className="input-file"
          onChange={this.onChange}
        />
      </div>
    );
  }
}

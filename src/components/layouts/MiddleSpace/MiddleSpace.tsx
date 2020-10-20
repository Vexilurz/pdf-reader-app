import './middle-space.scss';
import * as React from 'react';
import PDFViewer from '../../PDF/PDFViewer';
import StartPage from '../../StartPage/StartPage';

export interface IMiddleSpaceProps {
  visible: boolean;
}
export interface IMiddleSpaceState {}

export default class MiddleSpace extends React.Component<
  IMiddleSpaceProps,
  IMiddleSpaceState
> {
  componentDidMount() {}

  render(): React.ReactElement {
    const { visible } = this.props;
    const isVisible = visible ? 'visible' : 'hidden';

    return (
      <div className="middle-space" style={{ visibility: isVisible }}>
        {/* <PDFViewer /> */}
        <StartPage />
      </div>
    );
  }
}

import './middle-space.scss';
import * as React from 'react';
import PDFViewer from '../../PDF/PDFViewer';
import StartPage from '../../StartPage/StartPage';
import { connect } from 'react-redux';
import { StoreType } from '../../../reduxStore/store';

export interface IMiddleSpaceProps {
  visible: boolean;
}
export interface IMiddleSpaceState {}

class MiddleSpace extends React.Component<
  IMiddleSpaceProps,
  IMiddleSpaceState
> {
  componentDidMount() {}

  render(): React.ReactElement {
    const { visible } = this.props;
    const isVisible = visible ? 'visible' : 'hidden';

    const { currentAppState } = this.props;

    return (
      <div className="middle-space" style={{ visibility: isVisible }}>
        {/* <PDFViewer /> */}
        {currentAppState === 'pdf-viewer' ? (
          // <PDFViewer />
          <div>pdf viewer {JSON.stringify(this.props.projectFileContent)}</div>
        ) : (
          <StartPage />
        )}
      </div>
    );
  }
}

const mapStateToProps = function (state: StoreType) {
  return {
    currentAppState: state.appState.current,
    projectFileContent: state.projectFile.content,
  };
};

// const mapDispatchToProps = {
// };

export default connect(mapStateToProps)(MiddleSpace);

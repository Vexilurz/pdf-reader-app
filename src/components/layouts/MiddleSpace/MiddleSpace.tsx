import './middle-space.scss';
import * as React from 'react';
import { connect } from 'react-redux';
import PDFViewer from '../../PDF/PDFViewer';
import StartPage from '../../StartPage/StartPage';
import { StoreType } from '../../../reduxStore/store';

export interface IMiddleSpaceProps {
  visible: boolean;
}
export interface IMiddleSpaceState {}

class MiddleSpace extends React.Component<
  IMiddleSpaceProps & StatePropsType,
  IMiddleSpaceState
> {
  componentDidMount() {}

  render(): React.ReactElement {
    const { visible } = this.props;
    const isVisible = visible ? 'visible' : 'hidden';

    const { currentAppState, projectFileContent } = this.props;

    return (
      <div className="middle-space" style={{ visibility: isVisible }}>
        {/* <PDFViewer /> */}
        {currentAppState === 'pdf-viewer' ? (
          // <PDFViewer />
          <div>pdf viewer {JSON.stringify(projectFileContent)}</div>
        ) : (
          <StartPage />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: StoreType) => {
  return {
    currentAppState: state.appState.current,
    projectFileContent: state.projectFile.content,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;

export default connect(mapStateToProps)(MiddleSpace);

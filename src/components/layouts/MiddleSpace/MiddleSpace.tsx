import './middle-space.scss';
import * as React from 'react';
import { connect } from 'react-redux';
import PDFViewer from '../../PDF/PDFViewer';
import StartPage from '../../StartPage/StartPage';
import NewFileForm from '../../NewFileForm/NewFileForm';
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

    let pageContent = <div />;
    if (currentAppState === 'start-page') {
      pageContent = <StartPage />;
    } else if (currentAppState === 'new-file-form') {
      pageContent = <NewFileForm />;
    } else if (currentAppState === 'pdf-viewer') {
      // <PDFViewer />
      pageContent = <div>pdf viewer {JSON.stringify(projectFileContent)}</div>;
    }

    return (
      <div className="middle-space" style={{ visibility: isVisible }}>
        {pageContent}
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

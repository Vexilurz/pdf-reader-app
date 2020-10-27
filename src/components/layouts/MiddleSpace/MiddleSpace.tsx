import './middle-space.scss';
import * as React from 'react';
import { connect } from 'react-redux';
import PDFViewer from '../../PDF/PDFViewer';
import StartPage from '../../StartPage/StartPage';
import NewFileForm from '../../NewFileForm/NewFileForm';
import EventEditForm from '../../EventEditForm/EventEditForm';
import { StoreType } from '../../../reduxStore/store';
import * as appConst from '../../../types/textConstants';

export interface IMiddleSpaceProps {
  visible: boolean;
}
export interface IMiddleSpaceState {}

class MiddleSpace extends React.Component<StatePropsType, IMiddleSpaceState> {
  componentDidMount() {}

  render(): React.ReactElement {
    const { visible } = this.props;
    const isVisible = visible ? 'visible' : 'hidden';

    const { currentAppState } = this.props;

    let pageContent = <div>ERROR: Wrong appState current value</div>;
    if (currentAppState === appConst.START_PAGE) {
      pageContent = <StartPage />;
    } else if (currentAppState === appConst.NEW_FILE_FORM) {
      pageContent = <NewFileForm />;
    } else if (currentAppState === appConst.PDF_VIEWER) {
      pageContent = <PDFViewer />;
    } else if (currentAppState === appConst.EVENT_FORM) {
      pageContent = <EventEditForm />;
    }

    return (
      <div className="middle-space" style={{ visibility: isVisible }}>
        {pageContent}
      </div>
    );
  }
}

const mapStateToProps = (state: StoreType, ownProps: IMiddleSpaceProps) => {
  return {
    currentAppState: state.appState.current,
    visible: ownProps.visible,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;

export default connect(mapStateToProps)(MiddleSpace);

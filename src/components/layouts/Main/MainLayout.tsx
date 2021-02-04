import './main-layout.scss';
import * as React from 'react';
import Measure from 'react-measure';
import { connect } from 'react-redux';
import { ipcRenderer } from 'electron';
import TopBar from '../TopBar/TopBar';
import LeftBar from '../LeftBar/LeftBar';
import RightBar from '../RightBar/RightBar';
import MiddleSpace from '../MiddleSpace/MiddleSpace';
import { StoreType } from '../../../reduxStore/store';
import { actions as appStateActions } from '../../../reduxStore/appStateSlice';
import * as appConst from '../../../types/textConstants';

export interface IMainLayoutProps {}
export interface IMainLayoutState {}

class MainLayout extends React.Component<
  StatePropsType & DispatchPropsType,
  IMainLayoutState
> {
  componentDidMount() {
    // TODO: move that to app start loading point
    ipcRenderer.send(appConst.CLEAR_CACHE);
  }

  handleResize = (contentRect) => {
    const { mainContainerWidth, setMainContainerWidth } = this.props;
    if (mainContainerWidth !== contentRect?.bounds?.width) {
      setMainContainerWidth(contentRect?.bounds?.width);
    }
  };

  render(): React.ReactElement {
    return (
      <Measure bounds onResize={this.handleResize}>
        {({ measureRef }) => (
          <div className="main-layout" ref={measureRef}>
            <TopBar />
            <div className="main-container">
              <LeftBar />
              <MiddleSpace />
              <RightBar />
            </div>
          </div>
        )}
      </Measure>
    );
  }
}

const mapDispatchToProps = {
  setMainContainerWidth: appStateActions.setMainContainerWidth,
};

const mapStateToProps = (state: StoreType, ownProps: IMainLayoutProps) => {
  return {
    mainContainerWidth: state.appState.mainContainerWidth,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(MainLayout);

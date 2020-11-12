import './right-bar.scss';
import * as React from 'react';
import { connect } from 'react-redux';
import ResizePanel from 'react-resize-panel';
import Measure from 'react-measure';
import { StoreType } from '../../../reduxStore/store';
import * as appConst from '../../../types/textConstants';
import BookmarksArea from '../../BookmarksArea/BookmarksArea';
import { actions as appStateActions } from '../../../reduxStore/appStateSlice';

export interface IRightBarProps {}
export interface IRightBarState {}

class RightBar extends React.Component<
  StatePropsType & DispatchPropsType,
  IRightBarState
> {
  handleResize = (contentRect) => {
    const { rightSidebarWidth, setRightSidebarWidth } = this.props;
    if (rightSidebarWidth !== contentRect?.bounds?.width) {
      setRightSidebarWidth(contentRect?.bounds?.width);
    }
  };

  render(): React.ReactElement {
    const { currentAppState } = this.props;
    const isVisible = currentAppState === appConst.PDF_VIEWER;

    return isVisible ? (
      <ResizePanel
        direction="w"
        handleClass="right-bar"
        style={{ width: '350px' }}
      >
        <Measure bounds onResize={this.handleResize}>
          {({ measureRef }) => (
            <div className="right-bar" ref={measureRef}>
              <BookmarksArea />
            </div>
          )}
        </Measure>
      </ResizePanel>
    ) : (
      <></>
    );
  }
}

const mapDispatchToProps = {
  setRightSidebarWidth: appStateActions.setRightSidebarWidth,
};

const mapStateToProps = (state: StoreType, ownProps: IRightBarProps) => {
  return {
    currentAppState: state.appState.current,
    rightSidebarWidth: state.appState.rightSidebarWidth,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(RightBar);

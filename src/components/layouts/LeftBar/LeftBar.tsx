import './left-bar.scss';
import * as React from 'react';
import { connect } from 'react-redux';
import ResizePanel from 'react-resize-panel';
import Measure from 'react-measure';
import { StoreType } from '../../../reduxStore/store';
import * as appConst from '../../../types/textConstants';
import EventsArea from '../../EventsArea/EventsArea';
import { actions as projectFileActions } from '../../../reduxStore/projectFileSlice';
import { actions as appStateActions } from '../../../reduxStore/appStateSlice';
import { IProjectFileWithPath } from '../../../types/projectFile';
import { ipcRenderer } from 'electron';

export interface ILeftBarProps {}
export interface ILeftBarState {}

class LeftBar extends React.Component<
  StatePropsType & DispatchPropsType,
  ILeftBarState
> {
  handleResize = (contentRect) => {
    const { leftSidebarWidth, setLeftSidebarWidth } = this.props;
    if (Math.abs(leftSidebarWidth - contentRect?.bounds?.width) > 5) {
      setLeftSidebarWidth(contentRect?.bounds?.width);
    }
  };

  render(): React.ReactElement {
    const { currentAppState } = this.props;
    const isVisible =
      currentAppState === appConst.PDF_VIEWER ||
      currentAppState === appConst.EMTPY_SCREEN;

    return isVisible ? (
      <ResizePanel
        direction="e"
        handleClass="left-bar"
        style={{ width: '350px' }}
      >
        <Measure bounds onResize={this.handleResize}>
          {({ measureRef }) => (
            <div className="left-bar" ref={measureRef}>
              <EventsArea />
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
  setLeftSidebarWidth: appStateActions.setLeftSidebarWidth,
};

const mapStateToProps = (state: StoreType, ownProps: ILeftBarProps) => {
  return {
    currentAppState: state.appState.current,
    leftSidebarWidth: state.appState.leftSidebarWidth,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(LeftBar);

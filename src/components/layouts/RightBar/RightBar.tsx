import './right-bar.scss';
import * as React from 'react';
import { connect } from 'react-redux';
import { StoreType } from '../../../reduxStore/store';
import * as appConst from '../../../types/textConstants';
import BookmarksArea from '../../BookmarksArea/BookmarksArea';
import ResizePanel from 'react-resize-panel';

export interface IRightBarProps {}
export interface IRightBarState {}

class RightBar extends React.Component<
  StatePropsType & DispatchPropsType,
  IRightBarState
> {
  private resizeRef: React.RefObject<any>;

  constructor(props: StatePropsType & DispatchPropsType) {
    super(props);
    this.resizeRef = React.createRef();
  }

  render(): React.ReactElement {
    const { currentAppState } = this.props;
    const isVisible = currentAppState === appConst.PDF_VIEWER;

    return isVisible ? (
      <ResizePanel
        direction="w"
        handleClass="right-bar"
        ref={this.resizeRef}
        style={{ width: '350px' }}
      >
        <div
          className="right-bar"
          style={{ width: this.resizeRef?.current?.width }}
        >
          <BookmarksArea />
        </div>
      </ResizePanel>
    ) : null;
  }
}

const mapDispatchToProps = {};

const mapStateToProps = (state: StoreType, ownProps: IRightBarProps) => {
  return {
    currentAppState: state.appState.current,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(RightBar);

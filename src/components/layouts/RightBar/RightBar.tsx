import './right-bar.scss';
import * as React from 'react';
import { connect } from 'react-redux';
import { StoreType } from '../../../reduxStore/store';
import * as appConst from '../../../types/textConstants';
import BookmarksArea from '../../BookmarksArea/BookmarksArea';

export interface IRightBarProps {}
export interface IRightBarState {}

class RightBar extends React.Component<
  StatePropsType & DispatchPropsType,
  IRightBarState
> {
  componentDidMount() {}

  render(): React.ReactElement {
    const { currentAppState } = this.props;
    const isVisible =
      currentAppState === appConst.PDF_VIEWER ? 'visible' : 'hidden';

    return (
      <div className="right-bar" style={{ visibility: isVisible }}>
        <BookmarksArea />
      </div>
    );
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

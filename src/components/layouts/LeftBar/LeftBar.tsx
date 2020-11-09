import './left-bar.scss';
import * as React from 'react';
import { connect } from 'react-redux';
import { StoreType } from '../../../reduxStore/store';
import * as appConst from '../../../types/textConstants';
import EventsArea from '../../EventsArea/EventsArea';

export interface ILeftBarProps {}
export interface ILeftBarState {}

class LeftBar extends React.Component<
  StatePropsType & DispatchPropsType,
  ILeftBarState
> {
  componentDidMount() {}

  render(): React.ReactElement {
    const { currentAppState } = this.props;
    const isVisible =
      currentAppState === appConst.PDF_VIEWER ||
      currentAppState === appConst.EMTPY_SCREEN ||
      currentAppState === appConst.EVENT_FORM
        ? 'visible'
        : 'hidden';

    return (
      <div className="left-bar" style={{ visibility: isVisible }}>
        <EventsArea />
      </div>
    );
  }
}

const mapDispatchToProps = {};

const mapStateToProps = (state: StoreType, ownProps: ILeftBarProps) => {
  return {
    currentAppState: state.appState.current,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(LeftBar);

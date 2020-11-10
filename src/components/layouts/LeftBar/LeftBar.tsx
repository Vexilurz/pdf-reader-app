import './left-bar.scss';
import * as React from 'react';
import { connect } from 'react-redux';
import { StoreType } from '../../../reduxStore/store';
import * as appConst from '../../../types/textConstants';
import EventsArea from '../../EventsArea/EventsArea';
import { actions as projectFileActions } from '../../../reduxStore/projectFileSlice';
import { actions as appStateActions } from '../../../reduxStore/appStateSlice';
import { Rnd } from 'react-rnd';

export interface ILeftBarProps {}
export interface ILeftBarState {
  width: number | string;
  height: number | string;
}

class LeftBar extends React.Component<
  StatePropsType & DispatchPropsType,
  ILeftBarState
> {
  constructor(props: StatePropsType & DispatchPropsType) {
    super(props);
    this.state = {
      width: '18%',
      height: '100%',
    };
  }

  componentDidMount() {}

  render(): React.ReactElement {
    const { currentAppState, saveCurrentProject, setAppState } = this.props;
    const { width, height } = this.state;
    const isVisible =
      currentAppState === appConst.PDF_VIEWER ||
      currentAppState === appConst.EMTPY_SCREEN ||
      currentAppState === appConst.EVENT_FORM;

    return isVisible ? (
      <div
        className="left-bar"
        style={{ width, maxWidth: '800px', minWidth: '200px' }}
      >
        <Rnd
          disableDragging={true}
          enableResizing={{
            bottom: false,
            bottomLeft: false,
            bottomRight: false,
            left: false,
            right: true,
            top: false,
            topLeft: false,
            topRight: false,
          }}
          bounds="parent"
          // maxHeight={'90%'}
          size={{ width, height }}
          onResizeStop={(e, direction, ref, delta, position) => {
            console.log(position);
            this.setState({
              width: ref.style.width,
              height: ref.style.height,
            });
          }}
        >
          <div className="project-controls">
            <button
              type="button"
              className="save-project-button btn btn-primary"
              onClick={() => {
                saveCurrentProject();
              }}
            >
              Save project
            </button>
            <button
              type="button"
              className="edit-project-button btn btn-primary"
              onClick={() => {
                setAppState(appConst.PROJECT_EDIT_FORM);
              }}
            >
              Edit project
            </button>
          </div>
          <EventsArea />
        </Rnd>
      </div>
    ) : (
      <></>
    );
  }
}

const mapDispatchToProps = {
  saveCurrentProject: projectFileActions.saveCurrentProject,
  setAppState: appStateActions.setAppState,
};

const mapStateToProps = (state: StoreType, ownProps: ILeftBarProps) => {
  return {
    currentAppState: state.appState.current,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(LeftBar);

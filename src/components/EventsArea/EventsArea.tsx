import './events-area.scss';
import * as React from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import { StoreType } from '../../reduxStore/store';
import { actions as projectFileActions } from '../../reduxStore/projectFileSlice';
import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import * as appConst from '../../types/textConstants';
import { IEvent } from '../../types/event';
import EventItem from '../EventItem/EventItem';

export interface IEventsAreaProps {}
export interface IEventsAreaState {}

class EventsArea extends React.Component<
  StatePropsType & DispatchPropsType,
  IEventsAreaState
> {
  componentDidMount() {}

  render(): React.ReactElement {
    const { projectFileContent } = this.props;
    return (
      <div className="events-area">
        {projectFileContent?.events?.map((event, index) => {
          return <EventItem event={event} key={'event-item-key' + index} />;
        })}
      </div>
    );
  }
}

const mapDispatchToProps = {
  // setFile: projectFileActions.setFile,
  // setAppState: appStateActions.setAppState,
};

const mapStateToProps = (state: StoreType, ownProps: IEventsAreaProps) => {
  return {
    // currentAppState: state.appState.current,
    projectFileContent: state.projectFile.content,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(EventsArea);

import './events-area.scss';
import * as React from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import { StoreType } from '../../reduxStore/store';
import { actions as projectFileActions } from '../../reduxStore/projectFileSlice';
import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import * as appConst from '../../types/textConstants';
import { IEvent, NEW_EVENT } from '../../types/event';
import EventItem from '../EventItem/EventItem';

export interface IEventsAreaProps {}
export interface IEventsAreaState {}

class EventsArea extends React.Component<
  StatePropsType & DispatchPropsType,
  IEventsAreaState
> {
  componentDidMount() {}

  onCreateNewEventClick = () => {
    const { setAppState, setEditingEvent } = this.props;
    setEditingEvent(NEW_EVENT);
    setAppState(appConst.EVENT_FORM);
  };

  render(): React.ReactElement {
    const { currentProjectFile } = this.props;
    return (
      <div className="events-area">
        Events area
        {currentProjectFile?.content?.events?.map((event, index) => {
          return <EventItem event={event} key={'event-item-key' + index} />;
        })}
        <button
          type="button"
          className="create-new-event-button"
          onClick={this.onCreateNewEventClick}
        >
          Create new event
        </button>
      </div>
    );
  }
}

const mapDispatchToProps = {
  setAppState: appStateActions.setAppState,
  setEditingEvent: appStateActions.setEditingEvent,
};

const mapStateToProps = (state: StoreType, ownProps: IEventsAreaProps) => {
  return {
    currentProjectFile: state.projectFile.current,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(EventsArea);

import './events-area.scss';
import * as React from 'react';
import { connect } from 'react-redux';
import { StoreType } from '../../reduxStore/store';
import * as appConst from '../../types/textConstants';
import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import { actions as editingEventActions } from '../../reduxStore/editingEventSlice';
import { getNewEvent } from '../../types/event';
import EventItem from '../EventItem/EventItem';

export interface IEventsAreaProps {}
export interface IEventsAreaState {}

class EventsArea extends React.Component<
  StatePropsType & DispatchPropsType,
  IEventsAreaState
> {
  componentDidMount() {}

  onCreateNewEventClick = () => {
    const { setAppState, setEditingEvent, setIsNew } = this.props;
    setEditingEvent(getNewEvent());
    setIsNew(true);
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
  setEditingEvent: editingEventActions.setEditingEvent,
  setIsNew: editingEventActions.setIsNew,
};

const mapStateToProps = (state: StoreType, ownProps: IEventsAreaProps) => {
  return {
    currentProjectFile: state.projectFile.current,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(EventsArea);

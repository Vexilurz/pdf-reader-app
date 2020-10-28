import './event-edit-form.scss';
import * as React from 'react';
import { connect } from 'react-redux';
import { StoreType } from '../../reduxStore/store';
import { actions as projectFileActions } from '../../reduxStore/projectFileSlice';
import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import * as appConst from '../../types/textConstants';
import { IEvent } from '../../types/event';

export interface IEventEditFormProps {
  event: IEvent;
}
export interface IEventEditFormState {}

class EventEditForm extends React.Component<
  StatePropsType & DispatchPropsType,
  IEventEditFormState
> {
  private inputTitleRef: React.RefObject<any>;
  private inputDescriptionRef: React.RefObject<any>;

  constructor(props: IEventEditFormProps & DispatchPropsType) {
    super(props);
    // this.onSetEventClick = this.onSetEventClick.bind(this);
    this.inputTitleRef = React.createRef();
    this.inputDescriptionRef = React.createRef();
    this.state = {};
  }

  componentDidMount(): void {
    this.grabDefaultValues();
    this.initListeners();
  }

  componentDidUpdate(): void {
    this.grabDefaultValues();
  }

  grabDefaultValues = () => {
    const { event } = this.props;
    this.inputTitleRef.current.value = event.title;
    this.inputDescriptionRef.current.value = event.description;
  };

  initListeners = (): void => {};

  onSetEventClick = (): void => {
    const { addEvent, updateEvent, event, setAppState } = this.props;
    const newEvent = { ...event };
    newEvent.title = this.inputTitleRef.current.value;
    newEvent.description = this.inputDescriptionRef.current.value;
    newEvent.isNew = false;
    if (event.isNew) addEvent(newEvent);
    else updateEvent(newEvent);
    setAppState(appConst.PDF_VIEWER);
  };

  render(): React.ReactElement {
    const { event } = this.props;
    return (
      <div className="event-edit-form">
        <div className="event-title-label">Event title:</div>
        <div className="event-title">
          <input
            className="event-title-input"
            type="text"
            ref={this.inputTitleRef}
            style={{
              width: '400px',
            }}
          />
        </div>
        <div className="date-picker">Event date picker here {event.date}</div>
        <div className="description-label">Description:</div>
        <div className="event-description">
          <input
            className="event-description-area"
            type="textarea"
            ref={this.inputDescriptionRef}
            style={{
              width: '400px',
              height: '150px',
            }}
          />
        </div>
        <div className="file-drop-area">File drop area here</div>
        <div className="set-event">
          <button
            type="button"
            className="set-event-button"
            onClick={this.onSetEventClick}
          >
            {event.isNew ? 'Add event' : 'Update event'}
          </button>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = {
  addEvent: projectFileActions.addEvent,
  updateEvent: projectFileActions.updateEvent,
  setAppState: appStateActions.setAppState,
};

const mapStateToProps = (state: StoreType, ownProps: IEventEditFormProps) => {
  return {
    event: ownProps.event,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(EventEditForm);

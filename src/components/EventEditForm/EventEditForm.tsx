import './event-edit-form.scss';
import * as React from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import { StoreType } from '../../reduxStore/store';
import { actions as projectFileActions } from '../../reduxStore/projectFileSlice';
import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import * as appConst from '../../types/textConstants';
import { IEvent } from '../../types/event';

export interface IEventEditFormProps {
  event: IEvent;
}
export interface IEventEditFormState {
  event: IEvent;
}

class EventEditForm extends React.Component<
  StatePropsType & DispatchPropsType,
  IEventEditFormState
> {
  constructor(props: IEventEditFormProps & DispatchPropsType) {
    super(props);
    this.state = {
      event: {
        id: '',
        title: '',
        description: '',
        date: new Date(),
        files: [],
      },
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.event !== prevState.event) {
      return { event: nextProps.event };
    } else return null;
  }

  componentDidMount(): void {
    this.initListeners();
  }

  // componentDidUpdate(prevProps, prevState) {
  //   if (prevProps.event !== this.props.event) {
  //     // Perform some operation here
  //     this.setState({ someState: someValue });
  //   }
  // }

  initListeners = (): void => {};

  onSetEventClick = (): void => {
    const { setEvent } = this.props;
    const { event } = this.state;
    setEvent(event);
  };

  render(): React.ReactElement {
    return (
      <div className="event-edit-form">
        <div className="event-title-label">Event title:</div>
        <div className="event-title">
          <input
            className="event-title-input"
            type="text"
            style={{
              width: '400px',
            }}
            onChange={(e) => {
              const { event } = this.state;
              event.title = e.target.value;
              this.setState({ event });
            }}
          />
        </div>
        <div className="date-picker">Event date picker here</div>
        <div className="description-label">Description:</div>
        <div className="event-description">
          <input
            className="event-description-area"
            type="textarea"
            style={{
              width: '400px',
              height: '150px',
            }}
            onChange={(e) => {
              const { event } = this.state;
              event.description = e.target.value;
              this.setState({ event });
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
            Set event
          </button>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = {
  setEvent: projectFileActions.setEvent,
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

import './event-edit-form.scss';
import * as React from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import { StoreType } from '../../reduxStore/store';
import { actions as projectFileActions } from '../../reduxStore/projectFileSlice';
import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import * as appConst from '../../types/textConstants';
import { IEvent, NEW_EVENT } from '../../types/event';
import { NEW_FILE } from '../../types/projectFile';

export interface IEventEditFormProps {
  event: IEvent;
}
export interface IEventEditFormState {
  id: string;
  title: string;
  description: string;
  date: string;
  files: string[];
}

class EventEditForm extends React.Component<
  StatePropsType & DispatchPropsType,
  IEventEditFormState
> {
  constructor(props: IEventEditFormProps & DispatchPropsType) {
    super(props);
    this.state = {
      id: NEW_EVENT.id,
      title: NEW_EVENT.title,
      description: NEW_EVENT.description,
      date: NEW_EVENT.date,
      files: NEW_EVENT.files,
    };
  }

  // static getDerivedStateFromProps(nextProps, prevState) {
  //   console.log('nextProps', nextProps, 'prevState', prevState);
  //   if (nextProps.event !== prevState.event) {
  //     return { event: nextProps.event };
  //   } else return null;
  // }

  componentDidMount(): void {
    this.initListeners();
  }

  componentDidUpdate(prevProps, prevState) {
    const { event } = this.props;
    console.log(
      'props.event',
      event,
      'prevProps',
      prevProps,
      'prevState',
      prevState
    );
    if (prevState.id !== event.id) {
      const { id, title, description, date, files } = event;
      this.setState({ id, title, description, date, files });
    }
  }

  initListeners = (): void => {};

  onSetEventClick = (): void => {
    const { setEvent } = this.props;
    const { id, title, description, date, files } = this.state;
    const event: IEvent = { id, title, description, date, files };
    setEvent(event);
  };

  render(): React.ReactElement {
    const { id, title, description, date, files } = this.state;
    return (
      <div className="event-edit-form">
        <div className="event-title-label">Event title:</div>
        <div className="event-title">
          <input
            className="event-title-input"
            type="text"
            value={title} // this may be recoursive, need to take that from props...
            style={{
              width: '400px',
            }}
            onChange={(e) => {
              this.setState({ title: e.target.value });
            }}
          />
        </div>
        <div className="date-picker">Event date picker here {date}</div>
        <div className="description-label">Description:</div>
        <div className="event-description">
          <input
            className="event-description-area"
            type="textarea"
            value={description} // this may be recoursive, need to take that from props...
            style={{
              width: '400px',
              height: '150px',
            }}
            onChange={(e) => {
              this.setState({ description: e.target.value });
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

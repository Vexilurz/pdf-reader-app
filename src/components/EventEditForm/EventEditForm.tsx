import './event-edit-form.scss';
import 'react-datepicker/dist/react-datepicker.css';
import * as React from 'react';
import { connect } from 'react-redux';
import DatePicker from 'react-datepicker';
import Dropzone from 'react-dropzone';
import { StoreType } from '../../reduxStore/store';
import { actions as projectFileActions } from '../../reduxStore/projectFileSlice';
import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import { actions as editingEventActions } from '../../reduxStore/editingEventSlice';
import * as appConst from '../../types/textConstants';

export interface IEventEditFormProps {}
export interface IEventEditFormState {}

class EventEditForm extends React.Component<
  StatePropsType & DispatchPropsType,
  IEventEditFormState
> {
  constructor(props: StatePropsType & DispatchPropsType) {
    super(props);
    this.state = {};
  }

  componentDidMount(): void {
    this.initListeners();
  }

  componentDidUpdate(prevProps, prevState): void {}

  initListeners = (): void => {};

  onSetEventClick = (): void => {
    const {
      addEvent,
      updateEvent,
      editingEvent,
      isNew,
      setAppState,
      setCurrentPdf,
    } = this.props;
    if (isNew) addEvent(editingEvent);
    else updateEvent(editingEvent);
    setCurrentPdf({ path: '', eventID: '' });
    setAppState(appConst.PDF_VIEWER);
  };

  onCancelClick = (): void => {
    const { setAppState, setCurrentPdf } = this.props;
    setCurrentPdf({ path: '', eventID: '' });
    setAppState(appConst.PDF_VIEWER);
  };

  // todo: find type of acceptedFiles of Dropzone.onDrop
  onFilesDrop = (acceptedFiles) => {
    const { editingEvent, setEditingEvent } = this.props;
    const updatedEvent = { ...editingEvent };
    const files = Object.assign([], updatedEvent.files);
    acceptedFiles.forEach((file) => {
      // todo: use toLowerCase when compare?
      const { path } = file;
      const index = files.findIndex((f) => f.path === path);
      if (index === -1) files.push({ path, bookmarks: [] });
    });
    updatedEvent.files = files;
    setEditingEvent(updatedEvent);
  };

  onDeleteEventFile = (path: string) => () => {
    const { editingEvent, setEditingEvent } = this.props;
    const updatedEvent = { ...editingEvent };
    const files = Object.assign([], updatedEvent.files);
    const index = files.findIndex((f) => f.path === path);
    if (index > -1) files.splice(index, 1);
    updatedEvent.files = files;
    setEditingEvent(updatedEvent);
  };

  render(): React.ReactElement {
    const { editingEvent, setEditingEvent, isNew } = this.props;
    return (
      <div className="event-edit-form">
        <div className="event-id">ID: {editingEvent.id}</div>
        <div className="event-title-label">Event title:</div>
        <div className="event-title">
          <input
            className="event-title-input"
            type="text"
            style={{
              width: '400px',
            }}
            value={editingEvent.title}
            onChange={(e) => {
              const updatedEvent = { ...editingEvent };
              updatedEvent.title = e.target.value;
              setEditingEvent(updatedEvent);
            }}
          />
        </div>
        <div className="date-picker">
          Event date:
          <DatePicker
            selected={new Date(editingEvent.date)}
            onChange={(date: Date) => {
              const updatedEvent = { ...editingEvent };
              updatedEvent.date = date.toUTCString();
              setEditingEvent(updatedEvent);
            }}
          />
        </div>
        <div className="description-label">Description:</div>
        <div className="event-description">
          <input
            className="event-description-area"
            type="textarea"
            style={{
              width: '400px',
              height: '150px',
            }}
            value={editingEvent.description}
            onChange={(e) => {
              const updatedEvent = { ...editingEvent };
              updatedEvent.description = e.target.value;
              setEditingEvent(updatedEvent);
            }}
          />
        </div>
        <div className="event-files">
          {editingEvent.files.map((file, index) => {
            const { path } = file;
            return (
              <div className="event-file" key={'event-file-key' + index}>
                <button
                  type="button"
                  className="delete-event-file-button"
                  onClick={this.onDeleteEventFile(path)}
                >
                  X
                </button>
                {path}
              </div>
            );
          })}
        </div>
        <div className="event-form-dropzone">
          <Dropzone onDrop={this.onFilesDrop}>
            {({ getRootProps, getInputProps }) => (
              <section>
                <div {...getRootProps()}>
                  <input {...getInputProps()} />
                  <p>Drag 'n' drop some files here, or click to select files</p>
                </div>
              </section>
            )}
          </Dropzone>
        </div>
        <div className="set-event">
          <button
            type="button"
            className="set-event-button"
            onClick={this.onSetEventClick}
          >
            {isNew ? 'Add event' : 'Update event'}
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={this.onCancelClick}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = {
  addEvent: projectFileActions.addEvent,
  updateEvent: projectFileActions.updateEvent,
  setCurrentPdf: projectFileActions.setCurrentPdf,
  setAppState: appStateActions.setAppState,
  setEditingEvent: editingEventActions.setEditingEvent,
};

const mapStateToProps = (state: StoreType, ownProps: IEventEditFormProps) => {
  return {
    editingEvent: state.editingEvent.event,
    isNew: state.editingEvent.isNew,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(EventEditForm);

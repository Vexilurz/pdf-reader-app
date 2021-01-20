import './event-edit-form.scss';
import 'react-datepicker/dist/react-datepicker.css';
import { ipcRenderer } from 'electron';
import * as React from 'react';
import { connect } from 'react-redux';
import DatePicker from 'react-datepicker';
import Dropzone from 'react-dropzone';
import { StoreType } from '../../reduxStore/store';
import { actions as projectFileActions } from '../../reduxStore/projectFileSlice';
import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import { actions as editingEventActions } from '../../reduxStore/editingEventSlice';
import * as appConst from '../../types/textConstants';
import { IEvent } from '../../types/event';

export interface IEventEditFormProps {}
export interface IEventEditFormState {
  updating: boolean;
}

class EventEditForm extends React.Component<
  StatePropsType & DispatchPropsType,
  IEventEditFormState
> {
  constructor(props: StatePropsType & DispatchPropsType) {
    super(props);
    this.state = {
      updating: false,
    };
  }

  componentDidMount(): void {
    this.initListeners();
  }

  initListeners = (): void => {
    ipcRenderer.on(
      appConst.UPDATE_EVENT_IN_CACHE_COMPLETE,
      (event, payload) => {
        const { updateEvent, setAppState } = this.props;
        const updatedEvent: IEvent = JSON.parse(payload);
        updateEvent(updatedEvent);
        setAppState(appConst.EMTPY_SCREEN);
        this.setState({ updating: false });
      }
    );
  };

  onSetEventClick = (): void => {
    const { editingEvent, currentProjectFile } = this.props;
    this.setState({ updating: true });
    ipcRenderer.send(appConst.UPDATE_EVENT_IN_CACHE, {
      projectID: currentProjectFile.id,
      event: JSON.stringify(editingEvent),
    });
  };

  onCancelClick = (): void => {
    const { setAppState } = this.props;
    setAppState(appConst.EMTPY_SCREEN);
  };

  onDeleteEventClick = () => {
    const {
      setAppState,
      deleteEvent,
      editingEvent,
      currentProjectFile,
    } = this.props;
    ipcRenderer.send(
      appConst.DELETE_FOLDER_FROM_CACHE,
      `${currentProjectFile.id}/${editingEvent.id}`
    );
    deleteEvent(editingEvent);
    setAppState(appConst.EMTPY_SCREEN);
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
    const { editingEvent, setEditingEvent } = this.props;
    const { updating } = this.state;
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
              updatedEvent.date = date.toISOString();
              setEditingEvent(updatedEvent);
            }}
          />
        </div>
        <div className="description-label">Description:</div>
        <div className="event-description">
          <textarea
            className="event-description-area"
            // type="textarea"
            // style={{
            //   width: '400px',
            //   height: '150px',
            // }}
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
                  className="delete-event-file-button edit-event-control-button btn btn-danger"
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
            className="set-event-button edit-event-control-button btn btn-primary"
            onClick={this.onSetEventClick}
          >
            {updating ? (
              <div className="updating-container">
                <img src="./public/loading.gif" alt="Updating..." />
              </div>
            ) : null}
            Save
          </button>
          <button
            type="button"
            className="cancel-button edit-event-control-button btn btn-primary"
            onClick={this.onCancelClick}
          >
            Cancel
          </button>
          <button
            type="button"
            className="event-delete-button edit-event-control-button btn btn-danger"
            onClick={this.onDeleteEventClick}
          >
            Delete
          </button>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = {
  updateEvent: projectFileActions.updateEvent,
  setCurrentPdf: projectFileActions.setCurrentPdf,
  setAppState: appStateActions.setAppState,
  setEditingEvent: editingEventActions.setEditingEvent,
  deleteEvent: projectFileActions.deleteEvent,
};

const mapStateToProps = (state: StoreType, ownProps: IEventEditFormProps) => {
  return {
    editingEvent: state.editingEvent.event,
    currentProjectFile: state.projectFile.currentProjectFile,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(EventEditForm);

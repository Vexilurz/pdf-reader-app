import './event-edit-form.scss';
import 'react-datepicker/dist/react-datepicker.css';
import { ipcRenderer, remote, shell } from 'electron';
import * as React from 'react';
import { connect } from 'react-redux';
import DatePicker from 'react-datepicker';
import Dropzone from 'react-dropzone';
import { StoreType } from '../../reduxStore/store';
import * as pathLib from 'path';
import { actions as projectFileActions } from '../../reduxStore/projectFileSlice';
import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import { actions as editingEventActions } from '../../reduxStore/editingEventSlice';
import { actions as licenseActions } from '../../reduxStore/licenseSlice';
import { actions as pdfViewerActions } from '../../reduxStore/pdfViewerSlice';
import * as appConst from '../../types/textConstants';
import { IEvent } from '../../types/event';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { IPdfFileWithBookmarks } from '../../types/pdf';
import { getInfSelection } from '../../types/bookmark';

export interface IEventEditFormProps {}
export interface IEventEditFormState {
  updating: boolean;
}

const DatePickerInput = ({
  onChange,
  placeholder,
  value,
  isSecure,
  id,
  onClick,
}) => (
  <input
    className={'form-control'}
    onChange={onChange}
    placeholder={placeholder}
    value={value}
    isSecure={isSecure}
    id={id}
    onClick={onClick}
  />
);

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
    ipcRenderer.once(
      appConst.UPDATE_EVENT_IN_CACHE_COMPLETE,
      (event, payload) => {
        const { updateEvent, setAppState } = this.props;
        const rcvObj = JSON.parse(payload);
        const { openFileAfter } = rcvObj;
        delete rcvObj.openFileAfter;
        const updatedEvent: IEvent = rcvObj;
        updateEvent(updatedEvent);
        if (openFileAfter) {
          this.onPdfFileClick(openFileAfter);
        } else setAppState(appConst.EMTPY_SCREEN);
        this.setState({ updating: false });
      }
    );
  };

  onSetEventClick = (openFileAfter?: string): void => {
    const {
      editingEvent,
      currentProjectFile,
      setCurrentFileHaveChanges,
      saveCurrentProjectTemporary,
      licenseActive,
      setShowLicenseDialog,
    } = this.props;
    if (licenseActive) {
      this.setState({ updating: true });
      ipcRenderer.send(appConst.UPDATE_EVENT_IN_CACHE, {
        projectID: currentProjectFile.id,
        event: JSON.stringify(editingEvent),
        openFileAfter,
      });
      setCurrentFileHaveChanges(true);
      saveCurrentProjectTemporary();
    } else {
      setShowLicenseDialog(true);
    }
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
      setCurrentFileHaveChanges,
      saveCurrentProjectTemporary,
      licenseActive,
      setShowLicenseDialog,
    } = this.props;
    if (licenseActive) {
      remote.dialog
        .showMessageBox({
          message: `Are you sure to delete event?`,
          title: 'Question',
          type: 'question',
          buttons: ['Yes', 'Cancel'],
        })
        .then((res) => {
          const { response } = res;
          if (response === 0) {
            ipcRenderer.send(
              appConst.DELETE_FOLDER_FROM_CACHE,
              `${currentProjectFile.id}/${editingEvent.id}`
            );
            deleteEvent(editingEvent);
            setAppState(appConst.EMTPY_SCREEN);
            setCurrentFileHaveChanges(true);
            saveCurrentProjectTemporary();
          }
        });
    } else {
      setShowLicenseDialog(true);
    }
  };

  // todo: find type of acceptedFiles of Dropzone.onDrop
  onFilesDrop = (acceptedFiles) => {
    const {
      editingEvent,
      setEditingEvent,
      licenseActive,
      setShowLicenseDialog,
    } = this.props;
    if (licenseActive) {
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
    } else {
      setShowLicenseDialog(true);
    }
  };

  onDeleteEventFile = (path: string) => () => {
    const {
      editingEvent,
      setEditingEvent,
      licenseActive,
      setShowLicenseDialog,
    } = this.props;
    if (licenseActive) {
      remote.dialog
        .showMessageBox({
          message: `Are you sure to delete file "${path}"?`,
          title: 'Question',
          type: 'question',
          buttons: ['Yes', 'Cancel'],
        })
        .then((res) => {
          const { response } = res;
          if (response === 0) {
            const updatedEvent = { ...editingEvent };
            const files = Object.assign([], updatedEvent.files);
            const index = files.findIndex((f) => f.path === path);
            if (index > -1) files.splice(index, 1);
            updatedEvent.files = files;
            setEditingEvent(updatedEvent);
          }
        });
    } else {
      setShowLicenseDialog(true);
    }
  };

  onPdfFileClick = (pathIn: string) => {
    const {
      setCurrentPdf,
      setAppState,
      setSelection,
      setShowLoading,
      editingEvent,
      currentProjectFile,
    } = this.props;
    let path = pathIn;
    if (pathLib.dirname(pathIn) === '.') {
      path = pathLib.join(
        appConst.CACHE_PATH,
        currentProjectFile.id,
        editingEvent.id,
        pathIn
      );
    }
    if (pathLib.extname(path).toLowerCase() === '.pdf') {
      setShowLoading(true);
      setSelection(getInfSelection());
      ipcRenderer.send(appConst.LOAD_PDF_FILE, { path, external: false });
      setCurrentPdf({ path, eventID: editingEvent.id });
      setAppState(appConst.PDF_VIEWER);
    } else {
      setAppState(appConst.EMTPY_SCREEN);
      shell.openPath(path);
    }
  };

  render(): React.ReactElement {
    const { editingEvent, setEditingEvent } = this.props;
    const { updating } = this.state;
    return (
      <div className="event-edit-form">
        {/* <div className="event-id">ID: {editingEvent.id}</div> */}
        <div className="event-title-label" style={{ marginBottom: '-20px' }}>
          Event title:
        </div>
        <div className="event-title">
          <input
            className="event-title-input form-control"
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
          <div style={{ marginRight: '10px' }}>Event date:</div>
          <DatePicker
            customInput={<DatePickerInput />}
            selected={new Date(editingEvent.date)}
            onChange={(date: Date) => {
              const updatedEvent = { ...editingEvent };
              updatedEvent.date = date.toISOString();
              setEditingEvent(updatedEvent);
            }}
          />
        </div>
        <div className="description-label" style={{ marginBottom: '-20px' }}>
          Description:
        </div>
        <div className="event-description">
          <textarea
            className="event-description-area form-control"
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
                <p
                  className="event-pdf-file-in-edit"
                  key={'event-pdf' + index}
                  onClick={() => {
                    this.onSetEventClick(path);
                  }}
                >
                  {path}
                </p>
                <button
                  type="button"
                  className="delete-event-file-button edit-event-control-button"
                  onClick={this.onDeleteEventFile(path)}
                >
                  <FontAwesomeIcon icon={faTrash} color={'black'} />
                </button>
              </div>
            );
          })}
        </div>
        <div className="event-form-dropzone">
          <Dropzone onDrop={this.onFilesDrop}>
            {({ getRootProps, getInputProps }) => (
              <section>
                <div
                  {...getRootProps()}
                  style={{
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <input {...getInputProps()} />
                  <p>Drop files here</p>
                </div>
              </section>
            )}
          </Dropzone>
        </div>
        <div className="event-controls">
          <div className="set-event">
            <button
              type="button"
              className="set-event-button edit-event-control-button btn btn-primary"
              onClick={() => {
                this.onSetEventClick();
              }}
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
          </div>
          <button
            type="button"
            className="event-delete-button edit-event-control-button btn btn-secondary"
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
  setCurrentFileHaveChanges: projectFileActions.setCurrentFileHaveChanges,
  saveCurrentProjectTemporary: projectFileActions.saveCurrentProjectTemporary,
  setShowLicenseDialog: licenseActions.setShowLicenseDialog,
  setSelection: pdfViewerActions.setSelection,
  setShowLoading: appStateActions.setShowLoading,
};

const mapStateToProps = (state: StoreType, ownProps: IEventEditFormProps) => {
  return {
    editingEvent: state.editingEvent.event,
    currentProjectFile: state.projectFile.currentProjectFile,
    licenseActive: state.license.info.active,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(EventEditForm);

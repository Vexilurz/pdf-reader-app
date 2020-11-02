import './event-item.scss';
import * as React from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import Dropzone from 'react-dropzone';
import { StoreType } from '../../reduxStore/store';
import * as appConst from '../../types/textConstants';
import { IEvent } from '../../types/event';
import { deletePathFromFilename } from '../../utils/commonUtils';
import { actions as projectFileActions } from '../../reduxStore/projectFileSlice';
import { actions as pdfViewerActions } from '../../reduxStore/pdfViewerSlice';
import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import { actions as editingEventActions } from '../../reduxStore/editingEventSlice';
import { IPdfFileWithBookmarks } from '../../types/pdf';

export interface IEventItemProps {
  event: IEvent;
}
export interface IEventItemState {}

class EventItem extends React.Component<
  StatePropsType & DispatchPropsType,
  IEventItemState
> {
  constructor(props: StatePropsType & DispatchPropsType) {
    super(props);
    this.state = {};
  }

  componentDidMount(): void {
    this.initListeners();
  }

  initListeners = (): void => {};

  onEditEventClick = () => {
    const { setAppState, setEditingEvent, setIsNew, event } = this.props;
    setEditingEvent(event);
    setIsNew(false);
    setAppState(appConst.EVENT_FORM);
  };

  onDeleteEventClick = () => {
    const { deleteEvent, event } = this.props;
    deleteEvent(event);
  };

  // todo: refactor? almost the same in the EventEditForm
  onFilesDrop = (acceptedFiles) => {
    const { event, updateEvent } = this.props;
    const updatedEvent = { ...event };
    const files = Object.assign([], updatedEvent.files);
    acceptedFiles.forEach((file) => {
      // todo: use toLowerCase when compare?
      const { path } = file;
      const index = files.findIndex((f) => f.path === path);
      if (index === -1) files.push({ path, bookmarks: [] });
    });
    updatedEvent.files = files;
    updateEvent(updatedEvent);
  };

  onPdfFileClick = (file: IPdfFileWithBookmarks) => () => {
    const { setCurrentPdf, setAppState, event } = this.props;
    ipcRenderer.send(appConst.LOAD_PDF_FILE, file.path);
    setCurrentPdf({ path: file.path, eventID: event.id });
    setAppState(appConst.PDF_VIEWER);
  };

  render(): React.ReactElement {
    const { event } = this.props;
    return (
      <div className="event-item">
        <button
          type="button"
          className="event-delete-button"
          onClick={this.onDeleteEventClick}
        >
          Delete
        </button>
        <button
          type="button"
          className="event-edit-button"
          onClick={this.onEditEventClick}
        >
          Edit
        </button>
        <div className="event-title">{event.title}</div>
        <div className="event-description">{event.description}</div>
        <div className="event-date">{event?.date?.toString()}</div>
        <div className="event-pdf-files">
          {event.files.map((file, index) => {
            return (
              <button
                type="button"
                className="event-pdf-file"
                key={'event-key' + index}
                onClick={this.onPdfFileClick(file)}
              >
                {deletePathFromFilename(file.path)}
              </button>
            );
          })}
        </div>
        <div className="event-dropzone">
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
      </div>
    );
  }
}

const mapDispatchToProps = {
  setCurrentPdf: projectFileActions.setCurrentPdf,
  setAppState: appStateActions.setAppState,
  setEditingEvent: editingEventActions.setEditingEvent,
  setIsNew: editingEventActions.setIsNew,
  updateEvent: projectFileActions.updateEvent,
  deleteEvent: projectFileActions.deleteEvent,
};

const mapStateToProps = (state: StoreType, ownProps: IEventItemProps) => {
  return {
    event: ownProps.event,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(EventItem);

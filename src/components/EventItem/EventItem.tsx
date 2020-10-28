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

  // todo: refactor? almost the same in the EventEditForm
  onFilesDrop = (acceptedFiles) => {
    const { event, updateEvent } = this.props;
    const updatedEvent = { ...event };
    const files = Object.assign([], updatedEvent.files);
    acceptedFiles.forEach((file) => {
      // todo: use toLowerCase when compare?
      const { path } = file;
      if (files.indexOf(path) === -1) files.push(path);
    });
    updatedEvent.files = files;
    updateEvent(updatedEvent);
  };

  render(): React.ReactElement {
    const { event, setPdfPath } = this.props;
    return (
      <div className="event-item">
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
          {event.files.map((path, index) => {
            return (
              <button
                type="button"
                className="event-pdf-file"
                key={'event-key' + index}
                onClick={() => {
                  ipcRenderer.send(appConst.LOAD_PDF_FILE, path);
                  setPdfPath(path);
                }}
              >
                {deletePathFromFilename(path)}
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
  setPdfPath: pdfViewerActions.setPdfPath,
  setAppState: appStateActions.setAppState,
  setEditingEvent: editingEventActions.setEditingEvent,
  setIsNew: editingEventActions.setIsNew,
  updateEvent: projectFileActions.updateEvent,
};

const mapStateToProps = (state: StoreType, ownProps: IEventItemProps) => {
  return {
    event: ownProps.event,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(EventItem);

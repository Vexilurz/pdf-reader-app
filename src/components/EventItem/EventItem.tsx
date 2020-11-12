import './event-item.scss';
import * as React from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import Dropzone from 'react-dropzone';
import Alert from 'react-bootstrap/Alert';
import { DateTime } from 'luxon';
import { StoreType } from '../../reduxStore/store';
import * as appConst from '../../types/textConstants';
import { IEvent } from '../../types/event';
import { deletePathFromFilename } from '../../utils/commonUtils';
import { actions as projectFileActions } from '../../reduxStore/projectFileSlice';
import { actions as pdfViewerActions } from '../../reduxStore/pdfViewerSlice';
import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import { actions as editingEventActions } from '../../reduxStore/editingEventSlice';
import { IPdfFileWithBookmarks } from '../../types/pdf';
import { getInfSelection } from '../../types/bookmark';

export interface IEventItemProps {
  event: IEvent;
}
export interface IEventItemState {
  dropAreaVisible: boolean;
}

class EventItem extends React.Component<
  StatePropsType & DispatchPropsType,
  IEventItemState
> {
  constructor(props: StatePropsType & DispatchPropsType) {
    super(props);
    this.state = {
      dropAreaVisible: false,
    };
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
      const index = files.findIndex((f) => f.path === path);
      if (index === -1) files.push({ path, bookmarks: [] });
    });
    updatedEvent.files = files;
    updateEvent(updatedEvent);
  };

  onPdfFileClick = (file: IPdfFileWithBookmarks) => (e) => {
    e.stopPropagation();
    const {
      setCurrentPdf,
      setAppState,
      setSelection,
      setShowLoading,
      event,
    } = this.props;
    setShowLoading(true);
    setSelection(getInfSelection());
    ipcRenderer.send(appConst.LOAD_PDF_FILE, file.path);
    setCurrentPdf({ path: file.path, eventID: event.id });
    setAppState(appConst.PDF_VIEWER);
  };

  getDateString = (): string => {
    const { event } = this.props;
    const date = new DateTime(event?.date);
    return date.setLocale('en').toLocaleString(DateTime.DATE_MED);
  };

  render(): React.ReactElement {
    const { event } = this.props;
    const { dropAreaVisible } = this.state;

    return (
      <li className="event-item">
        <Alert
          className="event-alert"
          variant="secondary"
          onClick={this.onEditEventClick}
        >
          <div className="event-header">
            <div className="event-title">
              <b>{event.title}</b>
            </div>
            <div className="event-date float-right">{this.getDateString()}</div>
          </div>
          <div className="event-description">{event.description}</div>
          <div className="event-pdf-files">
            {event.files.map((file, index) => {
              return (
                <p
                  className="event-pdf-file"
                  key={'event-key' + index}
                  onClick={this.onPdfFileClick(file)}
                >
                  {deletePathFromFilename(file.path)}
                </p>
              );
            })}
          </div>
          {dropAreaVisible ? (
            <div className="event-dropzone">
              <Dropzone onDrop={this.onFilesDrop}>
                {({ getRootProps, getInputProps }) => (
                  <section>
                    <div {...getRootProps()}>
                      <input {...getInputProps()} />
                      <p>
                        Drag 'n' drop some files here, or click to select files
                      </p>
                    </div>
                  </section>
                )}
              </Dropzone>
            </div>
          ) : null}
        </Alert>
      </li>
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
  setSelection: pdfViewerActions.setSelection,
  setShowLoading: appStateActions.setShowLoading,
};

const mapStateToProps = (state: StoreType, ownProps: IEventItemProps) => {
  return {
    event: ownProps.event,
    currentPdf: state.projectFile.currentPdf,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(EventItem);

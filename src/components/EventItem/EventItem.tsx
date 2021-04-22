import './event-item.scss';
import * as React from 'react';
import { ipcRenderer, shell } from 'electron';
import { connect } from 'react-redux';
import Dropzone from 'react-dropzone';
import Alert from 'react-bootstrap/Alert';
import Measure from 'react-measure';
import { DateTime } from 'luxon';
import * as pathLib from 'path';
import { StoreType } from '../../reduxStore/store';
import * as appConst from '../../types/textConstants';
import { IEvent } from '../../types/event';
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
  listItemHeight: number;
}

class EventItem extends React.Component<
  StatePropsType & DispatchPropsType,
  IEventItemState
> {
  constructor(props: StatePropsType & DispatchPropsType) {
    super(props);
    this.state = {
      dropAreaVisible: false,
      listItemHeight: 0,
    };
  }

  componentDidMount(): void {}

  onEditEventClick = () => {
    const { setAppState, setEditingEvent, event } = this.props;
    setEditingEvent(event);
    setAppState(appConst.EVENT_FORM);
  };

  onPdfFileClick = (file: IPdfFileWithBookmarks) => (e) => {
    e.stopPropagation();
    const {
      setCurrentPdf,
      setAppState,
      setSelection,
      setShowLoading,
      event,
      currentProjectFile,
    } = this.props;
    let { path } = file;
    if (pathLib.dirname(file.path) === '.') {
      path = pathLib.join(
        appConst.CACHE_PATH,
        currentProjectFile.id,
        event.id,
        file.path
      );
    }
    if (pathLib.extname(path).toLowerCase() === '.pdf') {
      setShowLoading(true);
      setSelection(getInfSelection());
      ipcRenderer.send(appConst.LOAD_PDF_FILE, { path, external: false });
      setCurrentPdf({ path, eventID: event.id });
      setAppState(appConst.PDF_VIEWER);
    } else {
      shell.openPath(path);
    }
  };

  getDateString = (): string => {
    const { event } = this.props;
    const date = DateTime.fromISO(event?.date);
    return date.setLocale('en').toLocaleString(DateTime.DATE_MED);
  };

  handleResize = (contentRect) => {
    if (contentRect?.bounds?.height) {
      this.setState({ listItemHeight: contentRect.bounds.height });
    }
  };

  render(): React.ReactElement {
    const { event } = this.props;
    const { listItemHeight } = this.state;
    return (
      <Measure bounds onResize={this.handleResize}>
        {({ measureRef }) => (
          <li className="event-item" ref={measureRef}>
            <div
              style={{
                content: ' ',
                background: `#d4d9df`,
                display: `inline-block`,
                position: `absolute`,
                left: `20px`,
                width: `2px`,
                height: listItemHeight + 20,
                zIndex: 400,
              }}
            />
            <Alert
              className="event-alert"
              variant="secondary"
              onClick={this.onEditEventClick}
            >
              <div className="event-header">
                <div className="event-title">
                  <b>{event.title}</b>
                </div>
                <div className="event-date float-right">
                  {this.getDateString()}
                </div>
              </div>
              {/* <div className="event-description">{event.description}</div> */}
              <div className="event-pdf-files">
                {event.files.map((file, index) => {
                  return (
                    <p
                      className="event-pdf-file"
                      key={'event-key' + index}
                      onClick={this.onPdfFileClick(file)}
                    >
                      {pathLib.basename(file.path)}
                    </p>
                  );
                })}
              </div>
            </Alert>
          </li>
        )}
      </Measure>
    );
  }
}

const mapDispatchToProps = {
  setCurrentPdf: projectFileActions.setCurrentPdf,
  setAppState: appStateActions.setAppState,
  setEditingEvent: editingEventActions.setEditingEvent,
  updateEvent: projectFileActions.updateEvent,
  deleteEvent: projectFileActions.deleteEvent,
  setSelection: pdfViewerActions.setSelection,
  setShowLoading: appStateActions.setShowLoading,
};

const mapStateToProps = (state: StoreType, ownProps: IEventItemProps) => {
  return {
    event: ownProps.event,
    currentPdf: state.projectFile.currentPdf,
    currentProjectFile: state.projectFile.currentProjectFile,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(EventItem);

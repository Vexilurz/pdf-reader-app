import './event-item.scss';
import * as React from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import { StoreType } from '../../reduxStore/store';
// import { actions as projectFileActions } from '../../reduxStore/projectFileSlice';
// import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import { actions as pdfViewerActions } from '../../reduxStore/pdfViewerSlice';
import * as appConst from '../../types/textConstants';
import { IEvent } from '../../types/event';
import { deletePathFromFilename } from '../../utils/commonUtils';
import { IPDFdata } from '../../types/pdf';

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

  initListeners = (): void => {
    const { setPdf, setLoading } = this.props;
    ipcRenderer.on(
      appConst.PDF_FILE_CONTENT_RESPONSE,
      (event, data: Uint8Array) => {
        setPdf({ data });
        setLoading(false);
      }
    );
  };

  render(): React.ReactElement {
    const { event, setLoading } = this.props;
    return (
      <div className="event-item">
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
                  setLoading(true);
                  ipcRenderer.send(appConst.LOAD_PDF_FILE, path);
                }}
              >
                {deletePathFromFilename(path)}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = {
  setPdf: pdfViewerActions.setPdf,
  setLoading: pdfViewerActions.setLoading,
};

const mapStateToProps = (state: StoreType, ownProps: IEventItemProps) => {
  return {
    event: ownProps.event,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(EventItem);

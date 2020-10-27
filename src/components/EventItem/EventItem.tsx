import './event-item.scss';
import * as React from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import { StoreType } from '../../reduxStore/store';
import * as appConst from '../../types/textConstants';
import { IEvent } from '../../types/event';
import { deletePathFromFilename } from '../../utils/commonUtils';

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

  render(): React.ReactElement {
    const { event } = this.props;
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

const mapDispatchToProps = {};

const mapStateToProps = (state: StoreType, ownProps: IEventItemProps) => {
  return {
    event: ownProps.event,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(EventItem);

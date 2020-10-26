import './event-item.scss';
import * as React from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import { StoreType } from '../../reduxStore/store';
// import { actions as projectFileActions } from '../../reduxStore/projectFileSlice';
// import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import * as appConst from '../../types/textConstants';
import { IEvent } from '../../types/event';

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
    // ipcRenderer.on(appConst.PDF_FILE_CONTENT_RESPONSE, (event, data) => {
    //   this.setState({ pdfData: { data } });
    // });
  };

  render(): React.ReactElement {
    const { event } = this.props;
    return (
      <div className="event-item">
        <div className="event-title">{event.title}</div>
        <div className="event-description">{event.description}</div>
        <div className="event-date">{event?.date?.toString()}</div>
        <div className="event-pdf-files">
          {event.files.map((file, index) => {
            return (
              <div className="event-pdf-file" key={'event-key' + index}>
                {file.replace(/^.*[\\\/]/, '')}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = {
  // setFile: projectFileActions.setFile,
  // setAppState: appStateActions.setAppState,
};

const mapStateToProps = (state: StoreType, ownProps: IEventItemProps) => {
  return {
    event: ownProps.event,
    // currentAppState: state.appState.current,
    // projectFileContent: state.projectFile.content,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(EventItem);

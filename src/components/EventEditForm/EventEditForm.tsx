import './event-edit-form.scss';
import * as React from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import { StoreType } from '../../reduxStore/store';
import { actions as projectFileActions } from '../../reduxStore/projectFileSlice';
import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import * as appConst from '../../types/textConstants';

export interface IEventEditFormProps {}
export interface IEventEditFormState {}

class EventEditForm extends React.Component<
  StatePropsType & DispatchPropsType,
  IEventEditFormState
> {
  // constructor(props: IEventEditFormProps & DispatchPropsType) {
  //   super(props);
  //   this.state = {
  //   };
  // }

  componentDidMount(): void {
    this.initListeners();
  }

  initListeners = (): void => {
    // ipcRenderer.on(appConst.NEW_FILE_DIALOG_RESPONSE, (event, response) => {
    // });
  };

  onSetEventClick = (): void => {};

  render(): React.ReactElement {
    return (
      <div className="event-edit-form">
        <div className="event-title-label">Event title:</div>
        <div className="event-title">
          <input
            className="event-title-input"
            type="text"
            style={{
              width: '400px',
            }}
            onChange={(event) => {
              // this.projectName = event.target.value;
            }}
          />
        </div>
        <div className="date-picker">Event date picker here</div>
        <div className="description-label">Description:</div>
        <div className="event-description">
          <input
            className="event-description-area"
            type="textarea"
            style={{
              width: '400px',
              height: '150px',
            }}
            onChange={(event) => {
              // this.projectName = event.target.value;
            }}
          />
        </div>
        <div className="file-drop-area">File drop area here</div>
        <div className="set-event">
          <button
            type="button"
            className="set-event-button"
            onClick={this.onSetEventClick}
          >
            Set event
          </button>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = {
  // setFile: projectFileActions.setFile,
  setAppState: appStateActions.setAppState,
};

const mapStateToProps = (state: StoreType, ownProps: IEventEditFormProps) => {
  return {
    // currentAppState: state.appState.current,
    // projectFileContent: state.projectFile.content,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(EventEditForm);

import './events-area.scss';
import * as React from 'react';
import { connect } from 'react-redux';
import { StoreType } from '../../reduxStore/store';
import * as appConst from '../../types/textConstants';
import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import { actions as projectFileActions } from '../../reduxStore/projectFileSlice';
import { actions as editingEventActions } from '../../reduxStore/editingEventSlice';
import { getNewEvent } from '../../types/event';
import EventItem from '../EventItem/EventItem';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ipcRenderer } from 'electron';
import { faSave, faCog, faPlus } from '@fortawesome/free-solid-svg-icons';
import { IProjectFileWithPath } from '../../types/projectFile';

export interface IEventsAreaProps {}
export interface IEventsAreaState {}

// TODO: refactor events-toolbar to separate component

class EventsArea extends React.Component<
  StatePropsType & DispatchPropsType,
  IEventsAreaState
> {
  componentDidMount(): void {
    this.initListeners();
  }

  initListeners = (): void => {
    ipcRenderer.on(appConst.NEW_FILE_DIALOG_RESPONSE, (event, response) => {
      const {
        saveCurrentProject,
        currentProjectFile,
        setCurrentFile,
        addFileToOpened,
      } = this.props;
      const newFile: IProjectFileWithPath = {
        ...currentProjectFile,
        path: response.path,
      };
      setCurrentFile(newFile);
      addFileToOpened(newFile); // just for update filename in project tabs...
      saveCurrentProject();
      ipcRenderer.send(appConst.ADD_TO_RECENT_PROJECTS, newFile);
    });
  };

  onCreateNewEventClick = () => {
    const { setAppState, setEditingEvent } = this.props;
    setEditingEvent(getNewEvent());
    setAppState(appConst.EVENT_FORM);
  };

  saveCurrentProjectClick = () => {
    const { currentProjectFile, saveCurrentProject } = this.props;
    if (currentProjectFile.path === '')
      ipcRenderer.send(
        appConst.SHOW_SAVE_FILE_DIALOG,
        'saveCurrentProjectClick'
      );
    else saveCurrentProject();
  };

  render(): React.ReactElement {
    const { currentProjectFile, setAppState } = this.props;
    return (
      <div className="events-area">
        Events area
        <div className="events-toolbar">
          <Button
            variant="outline-secondary"
            onClick={this.saveCurrentProjectClick}
            title="Save current project"
          >
            <FontAwesomeIcon icon={faSave} />
          </Button>
          <Button
            variant="outline-secondary"
            onClick={() => {
              setAppState(appConst.PROJECT_EDIT_FORM);
            }}
            title="Open project settings"
          >
            <FontAwesomeIcon icon={faCog} />
          </Button>
          <Button
            variant="outline-secondary"
            onClick={this.onCreateNewEventClick}
            title="Create new event"
          >
            <FontAwesomeIcon icon={faPlus} />
          </Button>
        </div>
        <ul className="events-list">
          {currentProjectFile?.content?.events?.map((event, index) => {
            return <EventItem event={event} key={'event-item-key' + index} />;
          })}
        </ul>
      </div>
    );
  }
}

const mapDispatchToProps = {
  saveCurrentProject: projectFileActions.saveCurrentProject,
  setAppState: appStateActions.setAppState,
  setEditingEvent: editingEventActions.setEditingEvent,
  setCurrentFile: projectFileActions.setCurrentFile,
  addFileToOpened: projectFileActions.addFileToOpened,
};

const mapStateToProps = (state: StoreType, ownProps: IEventsAreaProps) => {
  return {
    currentProjectFile: state.projectFile.currentProjectFile,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(EventsArea);

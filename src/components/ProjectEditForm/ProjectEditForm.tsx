import './project-edit-form.scss';
import * as React from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import { StoreType } from '../../reduxStore/store';
import { actions as projectFileActions } from '../../reduxStore/projectFileSlice';
import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import { IProjectFileWithPath, getNewFile } from '../../types/projectFile';
import * as appConst from '../../types/textConstants';

export interface IProjectEditFormProps {}
export interface IProjectEditFormState {}

class ProjectEditForm extends React.Component<
  StatePropsType & DispatchPropsType,
  IProjectEditFormState
> {
  private projectNameRef: React.RefObject<any>;

  constructor(props: StatePropsType & DispatchPropsType) {
    super(props);
    this.projectNameRef = React.createRef();
    this.state = {};
  }

  componentDidMount(): void {
    this.initListeners();
    this.projectNameRef.current.value = this.props.currentProjectFile.content.name;
  }

  initListeners = (): void => {};

  onSaveChangesClick = (): void => {
    const {
      setCurrentFile,
      setAppState,
      addFileToOpened,
      currentProjectFile,
      setCurrentFileHaveChanges,
      saveCurrentProjectTemporary,
    } = this.props;
    const newFile: IProjectFileWithPath = {
      ...currentProjectFile,
      content: getNewFile(this.projectNameRef.current.value),
    };
    newFile.content.events = currentProjectFile.content.events;
    setCurrentFile(newFile);
    addFileToOpened(newFile);
    setAppState(appConst.PDF_VIEWER);
    setCurrentFileHaveChanges(true);
    saveCurrentProjectTemporary();
  };

  render(): React.ReactElement {
    const { setAppState, currentProjectFile } = this.props;
    return (
      <div className="project-edit-form">
        <div className="project-name">
          {'Name:   '}
          <input
            className="project-name-input"
            type="text"
            ref={this.projectNameRef}
            style={{
              width: '350px',
            }}
          />
        </div>
        <div className="control-buttons">
          <button
            type="button"
            className="save-changes-button edit-project-control-button btn btn-primary"
            onClick={this.onSaveChangesClick}
          >
            Save project settings
          </button>
          <button
            type="button"
            className="cancel-button edit-project-control-button btn btn-primary"
            onClick={() => {
              if (currentProjectFile.path !== '')
                setAppState(appConst.EMTPY_SCREEN);
              else setAppState(appConst.START_PAGE);
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = {
  setCurrentFile: projectFileActions.setCurrentFile,
  addFileToOpened: projectFileActions.addFileToOpened,
  setAppState: appStateActions.setAppState,
  setCurrentFileHaveChanges: projectFileActions.setCurrentFileHaveChanges,
  saveCurrentProjectTemporary: projectFileActions.saveCurrentProjectTemporary,
};

const mapStateToProps = (state: StoreType, ownProps: IProjectEditFormProps) => {
  return {
    currentProjectFile: state.projectFile.currentProjectFile,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(ProjectEditForm);

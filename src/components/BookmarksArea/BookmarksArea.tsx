import './bookmarks-area.scss';
import * as React from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import { StoreType } from '../../reduxStore/store';
import { actions as projectFileActions } from '../../reduxStore/projectFileSlice';
import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import * as appConst from '../../types/textConstants';
import { IBookmark } from '../../types/bookmark';
import BookmarkItem from '../BookmarkItem/BookmarkItem';

export interface IBookmarksAreaProps {}
export interface IBookmarksAreaState {}

class BookmarksArea extends React.Component<
  StatePropsType & DispatchPropsType,
  IBookmarksAreaState
> {
  componentDidMount() {}

  render(): React.ReactElement {
    const { projectFileContent } = this.props;
    return (
      <div className="bookmarks-area">
        Bookmarks area
        {projectFileContent?.bookmarks?.map((bookmark, index) => {
          return (
            <BookmarkItem
              bookmark={bookmark}
              key={'bookmark-item-key' + index}
            />
          );
        })}
      </div>
    );
  }
}

const mapDispatchToProps = {
  // setFile: projectFileActions.setFile,
  // setAppState: appStateActions.setAppState,
};

const mapStateToProps = (state: StoreType, ownProps: IBookmarksAreaProps) => {
  return {
    // currentAppState: state.appState.current,
    projectFileContent: state.projectFile.content,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(BookmarksArea);

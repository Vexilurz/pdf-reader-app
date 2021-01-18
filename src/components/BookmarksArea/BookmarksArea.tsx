/* eslint-disable */
import './bookmarks-area.scss';
import * as React from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import { StoreType } from '../../reduxStore/store';
import { actions as projectFileActions } from '../../reduxStore/projectFileSlice';
import { actions as pdfViewerActions } from '../../reduxStore/pdfViewerSlice';
import { createBookmark } from '../../types/bookmark';
import BookmarkItem from '../BookmarkItem/BookmarkItem';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

export interface IBookmarksAreaProps {}
export interface IBookmarksAreaState {}

class BookmarksArea extends React.Component<
  StatePropsType & DispatchPropsType,
  IBookmarksAreaState
> {
  componentDidMount() {}

  render(): React.ReactElement {
    const { projectFile, indexes, setEditingBookmarkID } = this.props;
    return (
      <div
        className="bookmarks-area"
        onClick={() => {
          setEditingBookmarkID('');
        }}
      >
        Bookmarks area
        <div className="bookmarks-list">
          {projectFile.events[indexes.eventIndex]?.files[
            indexes.fileIndex
          ]?.bookmarks.map((bookmark, index) => {
            return (
              <BookmarkItem
                bookmark={bookmark}
                key={'bookmark-item-key' + index}
              />
            );
          })}
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = {
  setEditingBookmarkID: pdfViewerActions.setEditingBookmarkID,
  setNeedForceUpdate: pdfViewerActions.setNeedForceUpdate,
};

const mapStateToProps = (state: StoreType, ownProps: IBookmarksAreaProps) => {
  return {
    projectFile: state.projectFile.currentProjectFile.content,
    indexes: state.projectFile.currentIndexes,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(BookmarksArea);

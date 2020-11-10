import './bookmarks-area.scss';
import * as React from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import { StoreType } from '../../reduxStore/store';
import { actions as projectFileActions } from '../../reduxStore/projectFileSlice';
import { actions as pdfViewerActions } from '../../reduxStore/pdfViewerSlice';
import { createBookmark } from '../../types/bookmark';
import BookmarkItem from '../BookmarkItem/BookmarkItem';

export interface IBookmarksAreaProps {}
export interface IBookmarksAreaState {}

class BookmarksArea extends React.Component<
  StatePropsType & DispatchPropsType,
  IBookmarksAreaState
> {
  componentDidMount() {}

  onAddBookmark = () => {
    const { addBookmark, selection, setEditingBookmarkID } = this.props;
    if (selection.start !== Infinity && selection.end !== Infinity) {
      const newBookmark = createBookmark(
        'bookmark comment here',
        selection,
        '#cce5ff'
      );
      addBookmark(newBookmark);
      setEditingBookmarkID(newBookmark.id);
    }
  };

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
        <button
          type="button"
          className="add-bookmark-button"
          onClick={(e) => {
            e.stopPropagation();
            this.onAddBookmark();
          }}
        >
          Add bookmark
        </button>
      </div>
    );
  }
}

const mapDispatchToProps = {
  addBookmark: projectFileActions.addBookmark,
  setEditingBookmarkID: pdfViewerActions.setEditingBookmarkID,
};

const mapStateToProps = (state: StoreType, ownProps: IBookmarksAreaProps) => {
  return {
    projectFile: state.projectFile.currentProjectFile.content,
    indexes: state.projectFile.currentIndexes,
    selection: state.pdfViewer.pdfSelection,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(BookmarksArea);

import './bookmark-item.scss';
import * as React from 'react';
import { connect } from 'react-redux';
import { CirclePicker } from 'react-color';
import { StoreType } from '../../reduxStore/store';
import { actions as projectFileActions } from '../../reduxStore/projectFileSlice';
import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import { actions as pdfViewerActions } from '../../reduxStore/pdfViewerSlice';
import { IBookmark } from '../../types/bookmark';

export interface IBookmarkItemProps {
  bookmark: IBookmark;
}
export interface IBookmarkItemState {
  comment: string;
  color: string;
}

class BookmarkItem extends React.Component<
  StatePropsType & DispatchPropsType,
  IBookmarkItemState
> {
  constructor(props: StatePropsType & DispatchPropsType) {
    super(props);
    this.state = {
      comment: props.bookmark.comment,
      color: props.bookmark.color,
    };
  }

  componentDidMount(): void {
    this.initListeners();
  }

  initListeners = (): void => {};

  onSave = (e) => {
    e.stopPropagation();
    const { bookmark, updateBookmark, setEditingBookmarkID } = this.props;
    const { comment, color } = this.state;
    const newBookmark = { ...bookmark };
    newBookmark.comment = comment;
    newBookmark.color = color;
    setEditingBookmarkID('');
    updateBookmark(newBookmark);
  };

  onEdit = (e) => {
    e.stopPropagation();
    const { bookmark, setEditingBookmarkID } = this.props;
    setEditingBookmarkID(bookmark.id);
    // this.setState({
    //   comment: bookmark.comment,
    //   color: bookmark.color,
    // });
  };

  onDelete = (e) => {
    e.stopPropagation();
    const { bookmark, deleteBookmark } = this.props;
    deleteBookmark(bookmark);
  };

  render(): React.ReactElement {
    const { bookmark, editingBookmarkID, setScrollToIndex } = this.props;
    const { comment, color } = this.state;
    const { startOffset, endOffset, startPage, endPage } = bookmark.selection;
    const info = `${startPage}:${startOffset} .. ${endPage}:${endOffset}`;
    const needToEdit = editingBookmarkID === bookmark.id;
    return (
      <div
        className="bookmark-item"
        style={{ backgroundColor: bookmark.color }}
      >
        {needToEdit ? (
          <div
            className="bookmark-item-edit"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="bookmark-comment">
              <input
                className="bookmark-comment-input"
                type="text"
                style={{
                  width: '150px',
                }}
                autoFocus
                value={comment}
                onChange={(e) => {
                  this.setState({ comment: e.target.value });
                }}
              />
            </div>
            <div className="bookmark-position">{info}</div>
            <div className="bookmark-color">
              <CirclePicker
                color={color}
                colors={['#cce5ff', '#d4edda', '#f8d7da', '#fff3cd', '#d1ecf1']}
                onChange={(color) => {
                  this.setState({ color: color.hex });
                }}
              />
            </div>
            <div className="bookmark-controls">
              <button
                type="button"
                className="save-bookmark-button btn btn-primary"
                onClick={this.onSave}
              >
                Save
              </button>
              <button
                type="button"
                className="delete-bookmark-button btn btn-primary"
                onClick={this.onDelete}
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <div
            className="bookmark-item-view"
            onClick={(e) => {
              e.stopPropagation();
              // setScrollToIndex(-1);
              setScrollToIndex({ value: bookmark.selection.startPage - 1 });
              document.getElementById(bookmark.id).scrollIntoView();
            }}
          >
            <div className="bookmark-comment">{bookmark.comment}</div>
            <div className="bookmark-position">{info}</div>
            <div className="bookmark-controls">
              <button
                type="button"
                className="edit-bookmark-button btn btn-primary btn-sm"
                onClick={this.onEdit}
              >
                Edit
              </button>
              <button
                type="button"
                className="delete-bookmark-button btn btn-danger btn-sm"
                onClick={this.onDelete}
              >
                X
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

const mapDispatchToProps = {
  updateBookmark: projectFileActions.updateBookmark,
  deleteBookmark: projectFileActions.deleteBookmark,
  setEditingBookmarkID: pdfViewerActions.setEditingBookmarkID,
  setScrollToIndex: pdfViewerActions.setScrollToIndex,
};

const mapStateToProps = (state: StoreType, ownProps: IBookmarkItemProps) => {
  return {
    bookmark: ownProps.bookmark,
    editingBookmarkID: state.pdfViewer.editingBookmarkID,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(BookmarkItem);

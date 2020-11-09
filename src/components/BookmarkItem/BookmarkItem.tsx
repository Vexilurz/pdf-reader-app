import './bookmark-item.scss';
import * as React from 'react';
import { connect } from 'react-redux';
import { StoreType } from '../../reduxStore/store';
import { actions as projectFileActions } from '../../reduxStore/projectFileSlice';
import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import { IBookmark } from '../../types/bookmark';
import { SketchPicker } from 'react-color';

export interface IBookmarkItemProps {
  bookmark: IBookmark;
}
export interface IBookmarkItemState {
  needToEdit: boolean;
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
      needToEdit: false,
      comment: '',
      color: '',
    };
  }

  componentDidMount(): void {
    this.initListeners();
  }

  initListeners = (): void => {};

  onSave = () => {
    const { bookmark, updateBookmark } = this.props;
    const { comment, color } = this.state;
    const newBookmark = { ...bookmark };
    newBookmark.comment = comment;
    newBookmark.color = color;
    this.setState({
      needToEdit: false,
    });
    updateBookmark(newBookmark);
  };

  onEdit = () => {
    const { bookmark } = this.props;
    this.setState({
      needToEdit: true,
      comment: bookmark.comment,
      color: bookmark.color,
    });
  };

  onDelete = () => {
    const { bookmark, deleteBookmark } = this.props;
    deleteBookmark(bookmark);
  };

  render(): React.ReactElement {
    const { bookmark } = this.props;
    const { comment, color, needToEdit } = this.state;
    return (
      <div
        className="bookmark-item"
        style={{ backgroundColor: bookmark.color }}
      >
        {needToEdit ? (
          <div className="bookmark-item-edit">
            <div className="bookmark-comment">
              <input
                className="bookmark-comment-input"
                type="text"
                style={{
                  width: '150px',
                }}
                value={comment}
                onChange={(e) => {
                  this.setState({ comment: e.target.value });
                }}
              />
            </div>
            <div className="bookmark-position">
              {bookmark.start} .. {bookmark.end}
            </div>
            <div className="bookmark-color">
              <SketchPicker
                color={color}
                onChange={(color) => {
                  this.setState({ color: color.hex });
                }}
              />
            </div>
            <div className="bookmark-controls">
              <button
                type="button"
                className="save-bookmark-button"
                onClick={this.onSave}
              >
                Save
              </button>
              <button
                type="button"
                className="delete-bookmark-button"
                onClick={this.onDelete}
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="bookmark-item-view">
            <div className="bookmark-comment">{bookmark.comment}</div>
            <div className="bookmark-position">
              {bookmark.start} .. {bookmark.end}
            </div>
            <div className="bookmark-controls">
              <button
                type="button"
                className="edit-bookmark-button"
                onClick={this.onEdit}
              >
                Edit
              </button>
              <button
                type="button"
                className="delete-bookmark-button"
                onClick={this.onDelete}
              >
                Delete
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
};

const mapStateToProps = (state: StoreType, ownProps: IBookmarkItemProps) => {
  return {
    bookmark: ownProps.bookmark,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(BookmarkItem);

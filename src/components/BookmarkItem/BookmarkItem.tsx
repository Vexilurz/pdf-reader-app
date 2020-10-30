import './bookmark-item.scss';
import * as React from 'react';
import { connect } from 'react-redux';
import { StoreType } from '../../reduxStore/store';
import { actions as projectFileActions } from '../../reduxStore/projectFileSlice';
// import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import { IBookmark } from '../../types/bookmark';
import { SketchPicker } from 'react-color';

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
    newBookmark.needToEdit = false;
    this.setState({ comment: bookmark.comment, color: bookmark.color });
    updateBookmark(newBookmark);
  };

  onEdit = () => {
    const { bookmark, updateBookmark } = this.props;
    const newBookmark = { ...bookmark };
    newBookmark.needToEdit = true;
    this.setState({ comment: bookmark.comment, color: bookmark.color });
    updateBookmark(newBookmark);
  };

  render(): React.ReactElement {
    const { bookmark } = this.props;
    const { comment, color } = this.state;
    return (
      <div
        className="bookmark-item"
        style={{ backgroundColor: bookmark.color }}
      >
        {bookmark.needToEdit ? (
          <div className="bookmark-item-edit">
            <button
              type="button"
              className="save-bookmark-button"
              onClick={this.onSave}
            >
              Save
            </button>
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
          </div>
        ) : (
          <div className="bookmark-item-view">
            <button
              type="button"
              className="edit-bookmark-button"
              onClick={this.onEdit}
            >
              Edit
            </button>
            <div className="bookmark-comment">{bookmark.comment}</div>
            <div className="bookmark-position">
              {bookmark.start} .. {bookmark.end}
            </div>
          </div>
        )}
      </div>
    );
  }
}

const mapDispatchToProps = {
  updateBookmark: projectFileActions.updateBookmark,
};

const mapStateToProps = (state: StoreType, ownProps: IBookmarkItemProps) => {
  return {
    bookmark: ownProps.bookmark,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(BookmarkItem);

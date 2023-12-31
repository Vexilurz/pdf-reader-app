import './bookmark-item.scss';
import * as React from 'react';
import { connect } from 'react-redux';
import { CirclePicker } from 'react-color';
import { StoreType } from '../../reduxStore/store';
import { actions as projectFileActions } from '../../reduxStore/projectFileSlice';
import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import { actions as pdfViewerActions } from '../../reduxStore/pdfViewerSlice';
import { actions as licenseActions } from '../../reduxStore/licenseSlice';
import { IAreaSelection, IBookmark, IPdfSelection } from '../../types/bookmark';
import { Button, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';

const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
  <Button
    variant="outline-secondary"
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
  >
    {children}
    {/* &#x25bc; */}
  </Button>
));

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
    const {
      bookmark,
      updateBookmark,
      setEditingBookmarkID,
      setCurrentFileHaveChanges,
      saveCurrentProjectTemporary,
      setNeedForceUpdate,
    } = this.props;
    const { comment, color } = this.state;
    const newBookmark = { ...bookmark };
    newBookmark.comment = comment;
    newBookmark.color = color;
    setEditingBookmarkID('');
    updateBookmark(newBookmark);
    setNeedForceUpdate({ value: true, tip: 'onSaveBookmark' });
    setCurrentFileHaveChanges(true);
    saveCurrentProjectTemporary();
  };

  onCancelEdit = (e) => {
    e.stopPropagation();
    const { setEditingBookmarkID } = this.props;
    setEditingBookmarkID('');
  };

  onEdit = (e) => {
    const {
      bookmark,
      setEditingBookmarkID,
      licenseActive,
      setShowLicenseDialog,
    } = this.props;
    if (licenseActive) {
      e.stopPropagation();
      setEditingBookmarkID(bookmark.id);
    } else {
      setShowLicenseDialog(true);
    }
  };

  onDelete = (e) => {
    const {
      bookmark,
      deleteBookmark,
      setCurrentFileHaveChanges,
      saveCurrentProjectTemporary,
      licenseActive,
      setShowLicenseDialog,
      setNeedForceUpdate,
    } = this.props;
    if (licenseActive) {
      e.stopPropagation();
      deleteBookmark(bookmark);
      setCurrentFileHaveChanges(true);
      saveCurrentProjectTemporary();
      setNeedForceUpdate({
        value: true,
        tip: 'onDeleteBookmark',
      });
    } else {
      setShowLicenseDialog(true);
    }
  };

  render(): React.ReactElement {
    const {
      bookmark,
      editingBookmarkID,
      setScrollToPage,
      setNeedForceUpdate,
    } = this.props;
    const { comment, color } = this.state;
    let info = '';
    if (bookmark.isAreaSelection) {
      const {
        page,
        x,
        y,
        width,
        height,
      } = bookmark.selection as IAreaSelection;
      info = `A ${page} ${x}:${y} ${width}:${height}`;
    } else {
      const {
        startOffset,
        endOffset,
        startPage,
        endPage,
      } = bookmark.selection as IPdfSelection;
      info = `T ${startPage}:${startOffset} .. ${endPage}:${endOffset}`;
    }
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
              <div />
              <button
                type="button"
                className="save-bookmark-button btn btn-primary"
                onClick={this.onSave}
              >
                Save
              </button>
              <button
                type="button"
                className="cancel-edit-bookmark-button btn btn-primary"
                onClick={this.onCancelEdit}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            className="bookmark-item-view"
            onClick={(e) => {
              e.stopPropagation();
              let scrollPage = bookmark.isAreaSelection
                ? bookmark.selection.page
                : bookmark.selection.startPage;
              // TODO: this thing don't scroll when page number is not changed.
              setScrollToPage({ value: scrollPage - 1 });
              document.getElementById(bookmark.id)?.scrollIntoView();
              setNeedForceUpdate(true);
            }}
          >
            <div className="bookmark-menu">
              <div />
              <Dropdown>
                <Dropdown.Toggle
                  as={CustomToggle}
                  variant="secondary"
                  id="dropdown-basic"
                >
                  <FontAwesomeIcon icon={faEllipsisH} />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={this.onEdit}>Edit</Dropdown.Item>
                  <Dropdown.Item onClick={this.onDelete}>Delete</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
            <div className="bookmark-comment">{bookmark.comment}</div>
            <div className="bookmark-position">{info}</div>
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
  setScrollToPage: pdfViewerActions.setScrollToPage,
  setNeedForceUpdate: pdfViewerActions.setNeedForceUpdate,
  setCurrentFileHaveChanges: projectFileActions.setCurrentFileHaveChanges,
  saveCurrentProjectTemporary: projectFileActions.saveCurrentProjectTemporary,
  setShowLicenseDialog: licenseActions.setShowLicenseDialog,
};

const mapStateToProps = (state: StoreType, ownProps: IBookmarkItemProps) => {
  return {
    bookmark: ownProps.bookmark,
    editingBookmarkID: state.pdfViewer.editingBookmarkID,
    licenseActive: state.license.info.active,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(BookmarkItem);

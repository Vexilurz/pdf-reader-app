import './bookmark-item.scss';
import * as React from 'react';
import { connect } from 'react-redux';
import { StoreType } from '../../reduxStore/store';
// import { actions as projectFileActions } from '../../reduxStore/projectFileSlice';
// import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import { IBookmark } from '../../types/bookmark';
import { deletePathFromFilename } from '../../utils/commonUtils';

export interface IBookmarkItemProps {
  bookmark: IBookmark;
}
export interface IBookmarkItemState {}

class BookmarkItem extends React.Component<
  StatePropsType & DispatchPropsType,
  IBookmarkItemState
> {
  constructor(props: StatePropsType & DispatchPropsType) {
    super(props);
    this.state = {};
  }

  componentDidMount(): void {
    this.initListeners();
  }

  initListeners = (): void => {
    // ipcRenderer.on(appConst.PDF_FILE_CONTENT_RESPONSE, (bookmark, data) => {
    //   this.setState({ pdfData: { data } });
    // });
  };

  render(): React.ReactElement {
    const { bookmark } = this.props;
    return (
      <div
        className="bookmark-item"
        style={{ backgroundColor: bookmark.color }}
      >
        <div className="bookmark-comment">{bookmark.comment}</div>
        {/* <div className="bookmark-file">
          {deletePathFromFilename(bookmark.file)}
        </div> */}
        <div className="bookmark-position">
          {bookmark.start} .. {bookmark.end}
        </div>
        <div
          className="bookmark-color"
          // style={{ backgroundColor: bookmark.color }}
        >
          Color
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = {};

const mapStateToProps = (state: StoreType, ownProps: IBookmarkItemProps) => {
  return {
    bookmark: ownProps.bookmark,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(BookmarkItem);

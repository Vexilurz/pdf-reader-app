import './bookmarks-area.scss';
import * as React from 'react';

export interface IBookmarksAreaProps {
  visible: boolean;
}
export interface IBookmarksAreaState {}

export default class BookmarksArea extends React.Component<
  IBookmarksAreaProps,
  IBookmarksAreaState
> {
  componentDidMount() {}

  render(): React.ReactElement {
    const { visible } = this.props;
    return (
      <div>
        {!visible ? null : (
          <div className="bookmarks-area">
            <h4>Bookmarks area</h4>
          </div>
        )}
      </div>
    );
  }
}

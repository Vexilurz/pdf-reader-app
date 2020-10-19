import './bookmarks-area.scss';
import * as React from 'react';

export interface IBookmarksAreaProps {}
export interface IBookmarksAreaState {}

export default class BookmarksArea extends React.Component<
  IBookmarksAreaProps,
  IBookmarksAreaState
> {
  componentDidMount() {}

  render(): React.ReactElement {
    return <div className="bookmarks-area">Bookmarks area</div>;
  }
}

import './right-bar.scss';
import * as React from 'react';
import BookmarksArea from '../../BookmarksArea/BookmarksArea';

export interface IRightBarProps {
  visible: boolean;
}
export interface IRightBarState {}

export default class RightBar extends React.Component<
  IRightBarProps,
  IRightBarState
> {
  componentDidMount() {}

  render(): React.ReactElement {
    const { visible } = this.props;
    const isVisible = visible ? 'visible' : 'hidden';

    return (
      <div className="right-bar" style={{ visibility: isVisible }}>
        <BookmarksArea />
      </div>
    );
  }
}

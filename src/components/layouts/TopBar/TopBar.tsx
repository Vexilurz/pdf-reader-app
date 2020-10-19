import './top-bar.scss';
import * as React from 'react';

export interface ITopBarProps {
  visible: boolean;
}
export interface ITopBarState {}

export default class TopBar extends React.Component<
  ITopBarProps,
  ITopBarState
> {
  componentDidMount() {}

  render(): React.ReactElement {
    const { visible } = this.props;
    const isVisible = visible ? 'visible' : 'hidden';

    return (
      <div className="top-bar" style={{ visibility: isVisible }}>
        Top Bar
      </div>
    );
  }
}

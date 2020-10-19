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
    return (
      <div>{!visible ? null : <div className="top-bar">Top bar</div>}</div>
    );
  }
}

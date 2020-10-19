import './left-bar.scss';
import * as React from 'react';

export interface ILeftBarProps {
  visible: boolean;
}
export interface ILeftBarState {}

export default class LeftBar extends React.Component<
  ILeftBarProps,
  ILeftBarState
> {
  componentDidMount() {}

  render(): React.ReactElement {
    const { visible } = this.props;
    return (
      <div>{!visible ? null : <div className="left-bar">Left bar</div>}</div>
    );
  }
}

import './right-bar.scss';
import * as React from 'react';

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
    return (
      <div>{!visible ? null : <div className="right-bar">Right bar</div>}</div>
    );
  }
}

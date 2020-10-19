import './middle-space.scss';
import * as React from 'react';

export interface IMiddleSpaceProps {
  visible: boolean;
}
export interface IMiddleSpaceState {}

export default class MiddleSpace extends React.Component<
  IMiddleSpaceProps,
  IMiddleSpaceState
> {
  componentDidMount() {}

  render(): React.ReactElement {
    const { visible } = this.props;
    return (
      <div>
        {!visible ? null : <div className="middle-space">Middle space</div>}
      </div>
    );
  }
}

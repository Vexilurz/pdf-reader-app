import './top-bar.scss';
import * as React from 'react';
import ProjectsTabs from '../../ProjectsTabs/ProjectsTabs';

export interface ITopBarProps {}
export interface ITopBarState {}

export default class TopBar extends React.Component<
  ITopBarProps,
  ITopBarState
> {
  componentDidMount() {}

  render(): React.ReactElement {
    return (
      <div className="top-bar">
        <ProjectsTabs />
      </div>
    );
  }
}

import './projects-tabs.scss';
import * as React from 'react';

export interface IProjectsTabsProps {}
export interface IProjectsTabsState {}

export default class ProjectsTabs extends React.Component<
  IProjectsTabsProps,
  IProjectsTabsState
> {
  componentDidMount() {}

  render(): React.ReactElement {
    return <div className="projects-tabs">Projects tabs</div>;
  }
}

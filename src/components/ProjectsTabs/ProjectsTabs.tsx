import './projects-tabs.scss';
import * as React from 'react';

export interface IProjectsTabsProps {
  visible: boolean;
}
export interface IProjectsTabsState {}

export default class ProjectsTabs extends React.Component<
  IProjectsTabsProps,
  IProjectsTabsState
> {
  componentDidMount() {}

  render(): React.ReactElement {
    const { visible } = this.props;
    return (
      <div>
        {!visible ? null : (
          <div className="projects-tabs">
            <h4>Projects tabs</h4>
          </div>
        )}
      </div>
    );
  }
}

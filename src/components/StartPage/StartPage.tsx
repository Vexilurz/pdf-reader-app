import './start-page.scss';
import * as React from 'react';

export interface IStartPageProps {}
export interface IStartPageState {}

export default class StartPage extends React.Component<
  IStartPageProps,
  IStartPageState
> {
  componentDidMount() {}

  render(): React.ReactElement {
    return (
      <div className="start-page">
        <h4>Start page</h4>
      </div>
    );
  }
}

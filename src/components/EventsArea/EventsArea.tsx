import './events-area.scss';
import * as React from 'react';

export interface IEventsAreaProps {}
export interface IEventsAreaState {}

export default class EventsArea extends React.Component<
  IEventsAreaProps,
  IEventsAreaState
> {
  componentDidMount() {}

  render(): React.ReactElement {
    return <div className="events-area">Events area</div>;
  }
}

import './events-area.scss';
import * as React from 'react';
// import Counter from '../Counter/Counter';

export interface IEventsAreaProps {}
export interface IEventsAreaState {}

export default class EventsArea extends React.Component<
  IEventsAreaProps,
  IEventsAreaState
> {
  componentDidMount() {}

  render(): React.ReactElement {
    return (
      <div className="events-area">
        Events area
        {/* <Counter offset={100} /> */}
      </div>
    );
  }
}

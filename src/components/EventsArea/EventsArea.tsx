import './events-area.scss';
import * as React from 'react';

export interface IEventsAreaProps {
  visible: boolean;
}
export interface IEventsAreaState {}

export default class EventsArea extends React.Component<
  IEventsAreaProps,
  IEventsAreaState
> {
  componentDidMount() {}

  render(): React.ReactElement {
    const { visible } = this.props;
    return (
      <div>
        {!visible ? null : (
          <div className="events-area">
            <h4>Events area</h4>
          </div>
        )}
      </div>
    );
  }
}

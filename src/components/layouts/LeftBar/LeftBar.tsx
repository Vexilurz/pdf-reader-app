import './left-bar.scss';
import * as React from 'react';
import EventsArea from '../../EventsArea/EventsArea';

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
    const isVisible = visible ? 'visible' : 'hidden';

    return (
      <div className="left-bar" style={{ visibility: isVisible }}>
        <EventsArea />
      </div>
    );
  }
}

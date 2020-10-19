import './new-event-form.scss';
import * as React from 'react';

export interface INewEventFormProps {}
export interface INewEventFormState {}

export default class NewEventForm extends React.Component<
  INewEventFormProps,
  INewEventFormState
> {
  componentDidMount() {}

  render(): React.ReactElement {
    return (
      <div className="new-event-form">
        <h4>new-event-form</h4>
      </div>
    );
  }
}

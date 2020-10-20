import './counter.scss';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  decrement,
  increment,
  incrementByAmount,
  incrementAsync,
  ICounterSliceProps,
} from '../../reduxStore/counterSlice';

export interface ICounterProps {
  offset: number;
}
export interface ICounterState {
  incrementAmount: number;
}

class Counter extends Component<
  ICounterProps & ICounterSliceProps,
  ICounterState
> {
  constructor(props: ICounterProps & ICounterSliceProps) {
    super(props);
    this.state = {
      incrementAmount: 2,
    };
  }

  componentDidMount() {}

  render(): React.ReactElement {
    const { counter, offset } = this.props;
    const { incrementAmount } = this.state;
    return (
      <div className="counter">
        <div className="row">
          <button
            type="button"
            className="button"
            aria-label="Increment value"
            onClick={() => this.props.increment()}
          >
            +
          </button>
          <span className="value">{counter + offset}</span>
          <button
            type="button"
            className="button"
            aria-label="Decrement value"
            onClick={() => this.props.decrement()}
          >
            -
          </button>
        </div>
        <div className="row">
          <input
            className="textbox"
            aria-label="Set increment amount"
            value={incrementAmount}
            onChange={(e) =>
              this.setState({ incrementAmount: Number(e.target.value) })
            }
          />
          <button
            type="button"
            className="button"
            onClick={() => this.props.incrementByAmount(incrementAmount || 0)}
          >
            Add Amount
          </button>
          <button
            type="button"
            className="asyncButton"
            onClick={() => this.props.incrementAsync(incrementAmount || 0)}
          >
            Add Async
          </button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = function (state, ownProps: ICounterProps) {
  return {
    counter: state.counter.value,
    offset: ownProps.offset,
  };
};

const mapDispatchToProps = {
  decrement,
  increment,
  incrementByAmount,
  incrementAsync,
};

export default connect(mapStateToProps, mapDispatchToProps)(Counter);

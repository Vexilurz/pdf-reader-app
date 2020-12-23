/* eslint-disable */
import * as React from 'react';
import ReactDOM from 'react-dom';
import { Stage, Layer, Rect } from 'react-konva';
import { connect } from 'react-redux';
import * as appConst from '../../types/textConstants';
import { actions as projectFileActions } from '../../../reduxStore/projectFileSlice';
import { actions as appStateActions } from '../../../reduxStore/appStateSlice';
import { StoreType } from '../../reduxStore/store';

interface IArea {
  x: number;
  y: number;
  width: number;
  height: number;
  key: string;
}

export interface IProps {
  height: number;
  width: number;
  enable: boolean;
}

export interface IState {
  currentSelection: IArea | null;
  newSelection: IArea | null;
}

class AreaSelection extends React.Component<
  StatePropsType & DispatchPropsType,
  IState
> {
  constructor(props: StatePropsType & DispatchPropsType) {
    super(props);
    this.state = {
      currentSelection: null,
      newSelection: null,
    };
  }

  handleMouseDown = (event) => {
    const { enable } = this.props;
    const { currentSelection, newSelection } = this.state;
    if (enable) {
      if (currentSelection) {
        this.setState({ currentSelection: null });
      }
      if (!newSelection) {
        const { x, y } = event.target.getStage().getPointerPosition();
        this.setState({
          newSelection: { x, y, width: 0, height: 0, key: '' },
        });
      }
    }
  };

  handleMouseMove = (event) => {
    const { enable } = this.props;
    const { newSelection } = this.state;
    if (enable) {
      if (newSelection) {
        const sx = newSelection.x;
        const sy = newSelection.y;
        const { x, y } = event.target.getStage().getPointerPosition();
        this.setState({
          newSelection: {
            x: sx,
            y: sy,
            width: x - sx,
            height: y - sy,
            key: '',
          },
        });
      }
    }
  };

  handleMouseUp = (event) => {
    const { enable } = this.props;
    const { newSelection } = this.state;
    if (enable) {
      if (newSelection) {
        const sx = newSelection.x;
        const sy = newSelection.y;
        const { x, y } = event.target.getStage().getPointerPosition();
        this.setState({
          currentSelection: {
            x: sx,
            y: sy,
            width: x - sx,
            height: y - sy,
            key: 'current-selection',
          },
          newSelection: null,
        });
      }
    }
  };

  render(): React.ReactElement {
    const { enable, width, height } = this.props;
    const { currentSelection, newSelection } = this.state;
    const zIndex = enable ? 5 : 1;
    const annotationsToDraw = [currentSelection, newSelection];
    return (
      <Stage
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
        onMouseMove={this.handleMouseMove}
        width={width}
        height={height}
        className={'area-selection-container'}
        style={{ zIndex }}
      >
        <Layer>
          {annotationsToDraw.map((value) => {
            const res = value ? (
              <Rect
                x={value.x}
                y={value.y}
                width={value.width}
                height={value.height}
                fill="transparent"
                stroke="blue"
              />
            ) : null;
            return res;
          })}
        </Layer>
      </Stage>
    );
  }
}

const mapDispatchToProps = {};

const mapStateToProps = (state: StoreType, ownProps: IProps) => {
  return {
    enable: ownProps.enable,
    width: ownProps.width,
    height: ownProps.height,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(AreaSelection);

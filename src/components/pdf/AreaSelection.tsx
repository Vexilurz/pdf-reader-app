/* eslint-disable */
import * as React from 'react';
import ReactDOM from 'react-dom';
import { Stage, Layer, Rect } from 'react-konva';
import { connect } from 'react-redux';
import * as appConst from '../../types/textConstants';
import { actions as pdfViewerActions } from '../../reduxStore/pdfViewerSlice';
import { StoreType } from '../../reduxStore/store';
import { IAreaSelection, IBookmark } from '../../types/bookmark';

export interface IProps {
  height: number;
  width: number;
  page: number;
  bookmarks: IBookmark[];
  scale: number;
  newSelectionCallback(area: IAreaSelection): void;
}

export interface IState {
  newSelection: IAreaSelection | null;
}

class AreaSelection extends React.Component<
  StatePropsType & DispatchPropsType,
  IState
> {
  constructor(props: StatePropsType & DispatchPropsType) {
    super(props);
    this.state = {
      newSelection: null,
    };
  }

  handleMouseDown = (event) => {
    const {
      currentSelection,
      areaSelectionEnable,
      page,
      setCurrentSelection,
    } = this.props;
    const { newSelection } = this.state;
    if (areaSelectionEnable.value) {
      if (!newSelection) {
        const { x, y } = event.target.getStage().getPointerPosition();
        this.setState({
          newSelection: { x, y, width: 0, height: 0, page },
        });
      }
      if (currentSelection) {
        setCurrentSelection(null);
      }
    }
  };

  handleMouseMove = (event) => {
    const { areaSelectionEnable, page } = this.props;
    const { newSelection } = this.state;
    if (areaSelectionEnable.value) {
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
            page,
          },
        });
      }
    }
  };

  handleMouseUp = (event) => {
    const { areaSelectionEnable, setCurrentSelection, page } = this.props;
    const { newSelection } = this.state;
    if (areaSelectionEnable.value) {
      if (newSelection) {
        const sx = newSelection.x;
        const sy = newSelection.y;
        const { x, y } = event.target.getStage().getPointerPosition();
        if (Math.abs(x - sx) >= 1 && Math.abs(y - sy) >= 1) {
          const area = {
            x: sx,
            y: sy,
            width: x - sx,
            height: y - sy,
            page,
          };
          setCurrentSelection(area);
          this.props.newSelectionCallback(area);
        }
        this.setState({ newSelection: null });
      }
    }
  };

  render(): React.ReactElement {
    const {
      currentSelection,
      width,
      height,
      page,
      bookmarks,
      areaSelectionEnable,
      scale,
    } = this.props;
    const { newSelection } = this.state;
    const zIndex = areaSelectionEnable.value ? 5 : 1;
    const annotationsToDraw = [currentSelection, newSelection];

    return (
      <div className={'area-selection-container'}>
        <Stage
          onMouseDown={this.handleMouseDown}
          onMouseUp={this.handleMouseUp}
          onMouseMove={this.handleMouseMove}
          width={width}
          height={height}
          className={'area-selection-stage'}
          style={{ zIndex }}
        >
          <Layer>
            {bookmarks.map((bookmark) => {
              const sel = bookmark.selection as IAreaSelection;
              return (
                <Rect
                  x={sel.x * scale}
                  y={sel.y * scale}
                  width={sel.width * scale}
                  height={sel.height * scale}
                  fill={`${bookmark.color}44`}
                  stroke={bookmark.color}
                />
              );
            })}
            {annotationsToDraw.map((value) => {
              const res =
                value && value?.page === page ? (
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
      </div>
    );
  }
}

const mapDispatchToProps = {
  setCurrentSelection: pdfViewerActions.setAreaSelection,
};

const mapStateToProps = (state: StoreType, ownProps: IProps) => {
  return {
    newSelectionCallback: ownProps.newSelectionCallback,
    scale: ownProps.scale,
    width: ownProps.width,
    height: ownProps.height,
    page: ownProps.page,
    bookmarks: ownProps.bookmarks,
    currentSelection: state.pdfViewer.areaSelection,
    areaSelectionEnable: state.pdfViewer.areaSelectionEnable,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(AreaSelection);

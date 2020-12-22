/* eslint-disable */
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Stage, Layer, Rect } from 'react-konva';

export interface IProps {
  height: number;
  width: number;
  enable: boolean;
}

export const DrawAnnotations = ({ height, width, enable }: IProps) => {
  const [annotations, setAnnotations] = useState([]);
  const [newAnnotation, setNewAnnotation] = useState([]);

  const zIndex = enable ? 5 : 1;

  const handleMouseDown = (event) => {
    if (enable) {
      annotations.length > 1 ? annotations.shift() : {};
      if (newAnnotation.length === 0) {
        const { x, y } = event.target.getStage().getPointerPosition();
        setNewAnnotation([{ x, y, width: 0, height: 0, key: '0' }]);
      }
    }
  };

  const handleMouseUp = (event) => {
    if (enable) {
      if (newAnnotation.length === 1) {
        const sx = newAnnotation[0].x;
        const sy = newAnnotation[0].y;
        const { x, y } = event.target.getStage().getPointerPosition();
        const annotationToAdd = {
          x: sx,
          y: sy,
          width: x - sx,
          height: y - sy,
          key: annotations.length + 1,
        };
        annotations.push(annotationToAdd);

        setNewAnnotation([]);
        setAnnotations(annotations);
      }
    }
  };

  const handleMouseMove = (event) => {
    if (enable) {
      if (newAnnotation.length === 1) {
        const sx = newAnnotation[0].x;
        const sy = newAnnotation[0].y;
        const { x, y } = event.target.getStage().getPointerPosition();
        setNewAnnotation([
          {
            x: sx,
            y: sy,
            width: x - sx,
            height: y - sy,
            key: '0',
          },
        ]);
      }
    }
  };

  const annotationsToDraw = [...annotations, ...newAnnotation];
  return (
    <Stage
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      width={width}
      height={height}
      className={'area-selection-container'}
      style={{ zIndex }}
    >
      <Layer>
        {annotationsToDraw.map((value) => {
          return (
            <Rect
              x={value.x}
              y={value.y}
              width={value.width}
              height={value.height}
              fill="transparent"
              stroke="black"
            />
          );
        })}
      </Layer>
    </Stage>
  );
};

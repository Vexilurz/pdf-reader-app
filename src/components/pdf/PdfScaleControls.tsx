import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';

export interface Props {
  onSetScale(scale: number): void;
}

export const PdfScaleControls = ({ onSetScale }: Props) => {
  const [scale, setScale] = useState(1);

  const step = 0.2;

  const increment = () => {
    setScale(scale + step);
    onSetScale(scale);
  };

  const decrement = () => {
    setScale(scale - step);
    onSetScale(scale);
  };

  return (
    <>
      <ButtonGroup aria-label="Basic example">
        <Button variant="secondary" onClick={increment}>
          <FontAwesomeIcon icon={faPlus} />
        </Button>
        <Button variant="secondary">
          <FontAwesomeIcon icon={faMinus} onClick={decrement} />
        </Button>
      </ButtonGroup>
    </>
  );
};
